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
        
        const result: EventSource[] = [];
        
        for (const event of events) {
            const eventName = extractCardContent(event);
            
            // 1. 检查是否有 Command 触发（overlap 或 connector）
            const command = this.findRelatedCard(event, commands, connectors, 'incoming');
            if (command) {
                // 查找 Command 的触发者（Role）
                const role = this.findRelatedCard(command, roles, connectors, 'incoming');
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
                    sourceName: extractCardContent(timer)
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
            
            // 5. 没有找到源头
            result.push({
                eventId: event.id,
                eventName: eventName,
                sourceType: 'Command',  // 默认假设是命令触发，但来源未知
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
     * 检查两张卡片是否重叠
     * 使用中心点欧氏距离判断
     */
    private isOverlapping(card1: WorkshopCard, card2: WorkshopCard): boolean {
        if (card1.id === card2.id) return false;
        
        const dx = card1.x - card2.x;
        const dy = card1.y - card2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        const maxWidth = Math.max(card1.width, card2.width);
        const threshold = maxWidth * 0.5;
        
        return distance < threshold;
    }

    /**
     * 检查两个卡片是否通过 connector 连接
     */
    private isConnected(fromId: string, toId: string, connectors: Connector[]): boolean {
        return connectors.some(c => 
            c.start?.item === fromId && c.end?.item === toId
        );
    }
}
