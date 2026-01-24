import {WorkshopBoardSPI, WorkshopCard} from "../../../application/spi/WorkshopBoardSPI";
import {EventWithPolicy, EventSource, EventSourceType, extractCardContent} from "../types/CommandStormingTypes";

// Connector type from Miro SDK
type Connector = Awaited<ReturnType<WorkshopBoardSPI['fetchConnectors']>>[number];

/**
 * CommandStormingService - 分析 Command Storming 数据
 */
export class CommandStormingService {
    private boardSPI: WorkshopBoardSPI;

    constructor(boardSPI: WorkshopBoardSPI) {
        this.boardSPI = boardSPI;
    }

    /**
     * 分析事件与策略的关系
     * 策略(violet) 通过 connector 或 overlap 连接到 事件(orange)
     */
    async analyzeEventPolicies(): Promise<EventWithPolicy[]> {
        const cards = await this.boardSPI.fetchWorkshopCards();
        const connectors = await this.boardSPI.fetchConnectors();
        
        const events = cards.filter(this.boardSPI.domainEventPredicate);
        const policies = cards.filter(this.boardSPI.policyPredicate);
        
        const result: EventWithPolicy[] = [];
        
        for (const event of events) {
            const eventName = extractCardContent(event);
            
            // 查找通过 connector 或 overlap 关联的 policy
            const relatedPolicy = this.findRelatedCard(event, policies, connectors, 'incoming');
            
            result.push({
                eventId: event.id,
                eventName: eventName,
                policyId: relatedPolicy?.id,
                policyName: relatedPolicy ? extractCardContent(relatedPolicy) : undefined
            });
        }
        
        return result;
    }

    /**
     * 分析事件的源头
     * 事件可能由以下触发：Command(light_blue), Timer(pink), Event(orange), External(red), ProcessManager(pink)
     */
    async analyzeEventSources(): Promise<EventSource[]> {
        const cards = await this.boardSPI.fetchWorkshopCards();
        const connectors = await this.boardSPI.fetchConnectors();
        
        const events = cards.filter(this.boardSPI.domainEventPredicate);
        const commands = cards.filter(this.boardSPI.commandPredicate);
        const timers = cards.filter(this.boardSPI.timerPredicate);  // pink - Timer/ProcessManager
        const externals = cards.filter(this.boardSPI.externalPredicate);
        const policies = cards.filter(this.boardSPI.policyPredicate);
        const roles = cards.filter(this.boardSPI.rolePredicate);
        
        // Debug: 打印各类型卡片数量
        console.log('[CommandStorming] Card counts:', {
            events: events.length,
            commands: commands.length,
            timers: timers.length,
            externals: externals.length,
            policies: policies.length,
            roles: roles.length,
            total: cards.length
        });
        
        const result: EventSource[] = [];
        
        for (const event of events) {
            const eventName = extractCardContent(event);
            
            // 1. 检查是否有 Command 触发（overlap 或 connector）
            const command = this.findRelatedCard(event, commands, connectors, 'incoming');
            if (command) {
                // 查找 Command 的触发者（Role）- 先用 overlap/connector，再用最近距离
                let role = this.findRelatedCard(command, roles, connectors, 'incoming');
                if (!role) {
                    role = this.findNearestCard(command, roles);
                }
                result.push({
                    eventId: event.id,
                    eventName: eventName,
                    sourceType: 'Command',
                    sourceId: command.id,
                    sourceName: extractCardContent(command),
                    roleId: role?.id,
                    roleName: role ? extractCardContent(role) : undefined
                });
                continue;
            }
            
            // 2. 检查是否有 Timer/ProcessManager 触发
            const timer = this.findRelatedCard(event, timers, connectors, 'incoming');
            if (timer) {
                // 判断是 Timer 还是 ProcessManager：通过 connector 从另一个 event 来的是 ProcessManager
                const sourceEvent = this.findRelatedCard(timer, events, connectors, 'incoming');
                const sourceType: EventSourceType = sourceEvent ? 'ProcessManager' : 'Timer';
                result.push({
                    eventId: event.id,
                    eventName: eventName,
                    sourceType: sourceType,
                    sourceId: timer.id,
                    sourceName: extractCardContent(timer, true)  // 替换第一个换行
                });
                continue;
            }
            
            // 3. 检查是否有 External 触发
            const external = this.findRelatedCard(event, externals, connectors, 'incoming');
            if (external) {
                result.push({
                    eventId: event.id,
                    eventName: eventName,
                    sourceType: 'External',
                    sourceId: external.id,
                    sourceName: extractCardContent(external)
                });
                continue;
            }
            
            // 4. 检查是否被 Policy 触发（Policy 监听其他事件后触发命令产生此事件）
            const policy = this.findRelatedCard(event, policies, connectors, 'incoming');
            if (policy) {
                // Policy 的上游事件
                const upstreamEvent = this.findRelatedCard(policy, events, connectors, 'incoming');
                if (upstreamEvent) {
                    result.push({
                        eventId: event.id,
                        eventName: eventName,
                        sourceType: 'Event',
                        sourceId: upstreamEvent.id,
                        sourceName: extractCardContent(upstreamEvent)
                    });
                    continue;
                }
            }
            
            // 5. 检查是否有直接的 Event → Event 连接（事件直接触发另一个事件）
            const sourceEvent = this.findRelatedCard(event, events, connectors, 'incoming');
            if (sourceEvent) {
                result.push({
                    eventId: event.id,
                    eventName: eventName,
                    sourceType: 'Event',
                    sourceId: sourceEvent.id,
                    sourceName: extractCardContent(sourceEvent)
                });
                continue;
            }
            
            // 6. Fallback: 查找最近的 Command 作为触发源
            const nearestCommand = this.findNearestCard(event, commands);
            if (nearestCommand) {
                // 查找 Command 的触发者（Role）- 先用 overlap/connector，再用最近距离
                let role = this.findRelatedCard(nearestCommand, roles, connectors, 'incoming');
                if (!role) {
                    role = this.findNearestCard(nearestCommand, roles);
                }
                result.push({
                    eventId: event.id,
                    eventName: eventName,
                    sourceType: 'Command',
                    sourceId: nearestCommand.id,
                    sourceName: extractCardContent(nearestCommand) + ' (最近)',
                    roleId: role?.id,
                    roleName: role ? extractCardContent(role) : undefined
                });
                continue;
            }
            
            // 7. 真的没有找到源头
            result.push({
                eventId: event.id,
                eventName: eventName,
                sourceType: 'Command',
                sourceId: '',
                sourceName: '(未识别)'
            });
        }
        
        return result;
    }

    /**
     * 查找与目标卡片关联的卡片（通过 overlap 或 connector）
     * @param targetCard 目标卡片
     * @param candidates 候选卡片列表
     * @param connectors 连接线列表
     * @param direction 'incoming' 表示查找指向 target 的, 'outgoing' 表示从 target 出发的
     */
    private findRelatedCard(
        targetCard: WorkshopCard, 
        candidates: WorkshopCard[], 
        connectors: Connector[],
        direction: 'incoming' | 'outgoing'
    ): WorkshopCard | undefined {
        // 1. 先检查 overlap（更紧密的关系）
        for (const candidate of candidates) {
            if (this.isOverlapping(targetCard, candidate)) {
                return candidate;
            }
        }
        
        // 2. 再检查 connector
        for (const candidate of candidates) {
            const connected = direction === 'incoming'
                ? this.isConnected(candidate.id, targetCard.id, connectors)
                : this.isConnected(targetCard.id, candidate.id, connectors);
            if (connected) {
                return candidate;
            }
        }
        
        return undefined;
    }

    /**
     * 检查两张卡片是否重叠或相邻（Event Storming 布局）
     * Command 通常在 Event 的左边并略有重叠
     * Role 通常在 Command 的左上角
     */
    private isOverlapping(card1: WorkshopCard, card2: WorkshopCard): boolean {
        if (card1.id === card2.id) return false;
        
        // 计算卡片边界
        const card1Left = card1.x - card1.width / 2;
        const card1Right = card1.x + card1.width / 2;
        const card1Top = card1.y - card1.height / 2;
        const card1Bottom = card1.y + card1.height / 2;
        
        const card2Left = card2.x - card2.width / 2;
        const card2Right = card2.x + card2.width / 2;
        const card2Top = card2.y - card2.height / 2;
        const card2Bottom = card2.y + card2.height / 2;
        
        // 检查水平方向是否有重叠或足够接近（允许一定间隙）
        const horizontalGap = 80; // 允许 80px 间隙
        const horizontalOverlap = card1Right + horizontalGap >= card2Left && card2Right + horizontalGap >= card1Left;
        
        // 检查垂直方向是否有重叠或足够接近
        const verticalGap = 150; // 允许 150px 间隙 (Role 通常在上方)
        const verticalOverlap = card1Bottom + verticalGap >= card2Top && card2Bottom + verticalGap >= card1Top;
        
        // 两个方向都要有重叠
        if (horizontalOverlap && verticalOverlap) {
            // 额外检查：中心点距离不能太远（防止误判）
            const dx = card1.x - card2.x;
            const dy = card1.y - card2.y;
            const centerDistance = Math.sqrt(dx * dx + dy * dy);
            const maxAllowedDistance = Math.max(card1.width, card2.width) * 2.5;  // 放宽到 2.5 倍
            
            return centerDistance < maxAllowedDistance;
        }
        
        return false;
    }

    /**
     * 检查两个卡片是否通过 connector 连接
     */
    private isConnected(fromId: string, toId: string, connectors: Connector[]): boolean {
        return connectors.some(c => 
            c.start?.item === fromId && c.end?.item === toId
        );
    }

    /**
     * 查找与目标卡片最近的卡片
     */
    private findNearestCard(targetCard: WorkshopCard, candidates: WorkshopCard[]): WorkshopCard | undefined {
        if (candidates.length === 0) return undefined;
        
        let nearest: WorkshopCard | undefined;
        let minDistance = Infinity;
        
        for (const candidate of candidates) {
            if (candidate.id === targetCard.id) continue;
            
            const dx = targetCard.x - candidate.x;
            const dy = targetCard.y - candidate.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < minDistance) {
                minDistance = distance;
                nearest = candidate;
            }
        }
        
        return nearest;
    }
}
