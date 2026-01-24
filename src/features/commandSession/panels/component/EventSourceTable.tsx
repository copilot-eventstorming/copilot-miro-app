import * as React from "react";
import {TEventSourceTableProps} from "../../types/CommandStormingTypes";

/**
 * 获取源类型的中文显示名称
 */
function getSourceTypeLabel(sourceType: string): string {
    const labels: Record<string, string> = {
        'Command': '命令',
        'Timer': '定时器',
        'Event': '事件',
        'External': '外部系统',
        'ProcessManager': '流程处理器'
    };
    return labels[sourceType] || sourceType;
}

/**
 * 获取源类型的颜色样式
 */
function getSourceTypeColor(sourceType: string): string {
    const colors: Record<string, string> = {
        'Command': 'bg-blue-100 text-blue-800',
        'Timer': 'bg-pink-100 text-pink-800',
        'Event': 'bg-orange-100 text-orange-800',
        'External': 'bg-red-100 text-red-800',
        'ProcessManager': 'bg-purple-100 text-purple-800'
    };
    return colors[sourceType] || 'bg-gray-100 text-gray-800';
}

/**
 * 事件源列表表格
 */
export const EventSourceTable: React.FC<TEventSourceTableProps> = ({boardSPI, data}) => {
    return (
        <div className="mx-2 overflow-y-auto flex-1">
            <div className="sub-title text-lg w-full text-center">事件源列表</div>
            <table style={{width: "100%"}}>
                <thead>
                <tr>
                    <th className="header text-xs">事件名称</th>
                    <th className="header text-xs">源类型</th>
                    <th className="header text-xs">源名称</th>
                    <th className="header text-xs">触发角色</th>
                </tr>
                </thead>
                <tbody>
                {data.map((item, index) => {
                    const rowClass = index % 2 === 0 ? "even_row" : "odd_row";
                    return (
                        <tr key={`${item.eventId}-${index}`} className={rowClass}>
                            <td className="text-cell text-xs">
                                <label 
                                    className="clickable-label"
                                    onClick={() => boardSPI.zoomToCard(item.eventId)}
                                >
                                    {item.eventName || '(无内容)'}
                                </label>
                            </td>
                            <td className="text-cell text-xs">
                                <span className={`px-2 py-1 rounded text-xs ${getSourceTypeColor(item.sourceType)}`}>
                                    {getSourceTypeLabel(item.sourceType)}
                                </span>
                            </td>
                            <td className="text-cell text-xs">
                                {item.sourceId ? (
                                    <label 
                                        className="clickable-label"
                                        onClick={() => boardSPI.zoomToCard(item.sourceId)}
                                    >
                                        {item.sourceName || '(无内容)'}
                                    </label>
                                ) : (
                                    <span className="text-gray-400">{item.sourceName}</span>
                                )}
                            </td>
                            <td className="text-cell text-xs">
                                {item.roleId ? (
                                    <label 
                                        className="clickable-label"
                                        onClick={() => boardSPI.zoomToCard(item.roleId!)}
                                    >
                                        {item.roleName || '(无内容)'}
                                    </label>
                                ) : (
                                    <span className="text-gray-400">—</span>
                                )}
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
            {data.length === 0 && (
                <div className="text-center text-gray-400 py-4">暂无数据，请点击"加载数据"</div>
            )}
        </div>
    );
};
