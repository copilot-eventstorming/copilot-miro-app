import * as React from "react";
import {TEventPolicyTableProps} from "../../types/CommandStormingTypes";

/**
 * 事件与策略关系表格
 */
export const EventPolicyTable: React.FC<TEventPolicyTableProps> = ({boardSPI, data}) => {
    return (
        <div className="mx-2 overflow-y-auto max-h-80">
            <div className="sub-title text-lg w-full text-center">事件与策略列表</div>
            <table style={{width: "100%"}}>
                <thead>
                <tr>
                    <th className="header text-xs">事件名称</th>
                    <th className="header text-xs">触发策略</th>
                </tr>
                </thead>
                <tbody>
                {data.map((item, index) => {
                    const rowClass = index % 2 === 0 ? "even_row" : "odd_row";
                    return (
                        <tr key={item.eventId} className={rowClass}>
                            <td className="text-cell text-xs">
                                <label 
                                    className="clickable-label"
                                    onClick={() => boardSPI.zoomToCard(item.eventId)}
                                >
                                    {item.eventName || '(无内容)'}
                                </label>
                            </td>
                            <td className="text-cell text-xs">
                                {item.policyId ? (
                                    <label 
                                        className="clickable-label"
                                        onClick={() => boardSPI.zoomToCard(item.policyId!)}
                                    >
                                        {item.policyName || '(无内容)'}
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
