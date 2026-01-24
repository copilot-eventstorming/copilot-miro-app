import {WorkshopBoardSPI, WorkshopCard} from "../../../application/spi/WorkshopBoardSPI";

/**
 * 事件源类型
 */
export type EventSourceType = 'Command' | 'Timer' | 'Event' | 'External' | 'ProcessManager';

/**
 * 事件与策略关系
 */
export interface EventWithPolicy {
    eventId: string;
    eventName: string;
    policyId?: string;
    policyName?: string;
}

/**
 * 事件源关系 - 事件及其触发源
 */
export interface EventSource {
    eventId: string;
    eventName: string;
    sourceType: EventSourceType;
    sourceId: string;
    sourceName: string;
    roleId?: string;       // 命令触发方（角色）
    roleName?: string;
}

/**
 * 导出数据结构
 */
export interface CommandStormingExport {
    eventsWithPolicies: EventWithPolicy[];
    eventSources: EventSource[];
    exportTime: string;
    boardId?: string;
}

/**
 * CommandStormingBoardPanel Props
 */
export type TCommandStormingBoardPanelProps = {
    boardSPI: WorkshopBoardSPI;
}

/**
 * EventPolicyTable Props
 */
export type TEventPolicyTableProps = {
    boardSPI: WorkshopBoardSPI;
    data: EventWithPolicy[];
}

/**
 * EventSourceTable Props
 */
export type TEventSourceTableProps = {
    boardSPI: WorkshopBoardSPI;
    data: EventSource[];
}

/**
 * 辅助函数：提取卡片内容文本
 */
export function extractCardContent(card: WorkshopCard): string {
    if (card.type === 'sticky_note') {
        return card.content?.replace(/<[^>]*>/g, '') || '';
    }
    return '';
}
