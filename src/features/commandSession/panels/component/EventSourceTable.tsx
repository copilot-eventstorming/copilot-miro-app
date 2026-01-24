import * as React from "react";
import {useState, useMemo} from "react";
import {EventSource, EventSourceType} from "../../types/CommandStormingTypes";
import {WorkshopBoardSPI} from "../../../../application/spi/WorkshopBoardSPI";

/**
 * EventSourceTable Props (扩展支持过滤)
 */
type TEventSourceTableProps = {
    boardSPI: WorkshopBoardSPI;
    data: EventSource[];
}

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

const ALL_SOURCE_TYPES: (EventSourceType | 'unidentified')[] = ['Command', 'Timer', 'Event', 'External', 'ProcessManager', 'unidentified'];

/**
 * 事件源列表表格（带过滤功能）
 */
export const EventSourceTable: React.FC<TEventSourceTableProps> = ({boardSPI, data}) => {
    const [filterType, setFilterType] = useState<EventSourceType | 'all' | 'unidentified'>('all');

    // 计算各类型的统计
    const typeCounts = useMemo(() => {
        const counts: Record<string, number> = {
            'Command': 0,
            'Timer': 0,
            'Event': 0,
            'External': 0,
            'ProcessManager': 0,
            'unidentified': 0
        };
        data.forEach(item => {
            if (!item.sourceId) {
                counts['unidentified']++;
            } else {
                counts[item.sourceType]++;
            }
        });
        return counts;
    }, [data]);

    // 过滤数据
    const filteredData = useMemo(() => {
        if (filterType === 'all') return data;
        if (filterType === 'unidentified') return data.filter(item => !item.sourceId);
        return data.filter(item => item.sourceType === filterType && item.sourceId);
    }, [data, filterType]);

    return (
        <div className="mx-2 overflow-y-auto flex-1 flex flex-col">
            {/* Summary 和 Filter */}
            <div className="sub-title text-lg w-full text-center">
                事件源列表 ({data.length})
            </div>
            <div className="flex flex-wrap gap-1 justify-center my-2">
                <button
                    className={`px-2 py-1 text-xs rounded ${filterType === 'all' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700'}`}
                    onClick={() => setFilterType('all')}
                >
                    全部 ({data.length})
                </button>
                {ALL_SOURCE_TYPES.map(type => (
                    <button
                        key={type}
                        className={`px-2 py-1 text-xs rounded ${filterType === type ? getSourceTypeColor(type) + ' ring-2 ring-offset-1' : getSourceTypeColor(type) + ' opacity-60'}`}
                        onClick={() => setFilterType(type)}
                    >
                        {type === 'unidentified' ? '未识别' : getSourceTypeLabel(type)} ({typeCounts[type]})
                    </button>
                ))}
            </div>

            {/* 表格 */}
            <div className="flex-1 overflow-y-auto">
                <table style={{width: "100%"}}>
                    <thead>
                    <tr>
                        <th className="header text-xs">事件名称</th>
                        <th className="header text-xs">源类型</th>
                        <th className="header text-xs">源名称 / 角色</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredData.map((item, index) => {
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
                                    <div className="flex flex-col">
                                        {/* 源名称 */}
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
                                        {/* 角色（仅命令类型显示，右对齐灰色小字） */}
                                        {item.sourceType === 'Command' && item.roleName && (
                                            <label 
                                                className="clickable-label text-right text-gray-500 text-xs italic"
                                                onClick={() => item.roleId && boardSPI.zoomToCard(item.roleId)}
                                            >
                                                👤 {item.roleName}
                                            </label>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
            {filteredData.length === 0 && (
                <div className="text-center text-gray-400 py-4">
                    {data.length === 0 ? '暂无数据，请点击"加载数据"' : '当前过滤条件无匹配数据'}
                </div>
            )}
        </div>
    );
};
