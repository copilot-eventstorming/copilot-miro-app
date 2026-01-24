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
 * 辅助函数：提取卡片内容文本，去除HTML标签和特殊字符（emoji等）
 * @param replaceFirstNewline 是否将第一个换行符替换为空格（适用于 PM/Policy 卡片）
 */
export function extractCardContent(card: WorkshopCard, replaceFirstNewline: boolean = false): string {
    if (card.type === 'sticky_note') {
        let content = card.content || '';
        // 移除 HTML 标签
        content = content.replace(/<[^>]*>/g, '');
        // 移除 HTML 实体（如 &#x1fa77; ）
        content = content.replace(/&#x[0-9a-fA-F]+;?/g, '');
        content = content.replace(/&[a-zA-Z]+;/g, '');
        // 移除 emoji 和其他特殊 Unicode 字符
        content = content.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]/gu, '');
        content = content.trim();
        
        // 将第一个换行符替换为空格（适用于 PM/Policy）
        if (replaceFirstNewline && content.includes('\n')) {
            const firstNewline = content.indexOf('\n');
            content = content.substring(0, firstNewline) + ' ' + content.substring(firstNewline + 1);
        }
        
        return content;
    }
    return '';
}
