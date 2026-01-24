import * as React from "react";
import {useState} from "react";
import {TCommandStormingBoardPanelProps, EventWithPolicy, EventSource, CommandStormingExport} from "./types/CommandStormingTypes";
import {CommandStormingService} from "./service/CommandStormingService";
import {EventPolicyTable} from "./panels/component/EventPolicyTable";
import {EventSourceTable} from "./panels/component/EventSourceTable";

type TabType = 'policies' | 'sources';

export const CommandStormingBoardPanel: React.FC<TCommandStormingBoardPanelProps> = ({boardSPI}) => {
    const [activeTab, setActiveTab] = useState<TabType>('policies');
    const [eventsWithPolicies, setEventsWithPolicies] = useState<EventWithPolicy[]>([]);
    const [eventSources, setEventSources] = useState<EventSource[]>([]);
    const [loading, setLoading] = useState(false);
    const [lastLoadTime, setLastLoadTime] = useState<string | null>(null);

    const service = new CommandStormingService(boardSPI);

    const loadData = async () => {
        setLoading(true);
        try {
            const [policies, sources] = await Promise.all([
                service.analyzeEventPolicies(),
                service.analyzeEventSources()
            ]);
            setEventsWithPolicies(policies);
            setEventSources(sources);
            setLastLoadTime(new Date().toLocaleTimeString());
            await boardSPI.showNotification(`已加载 ${policies.length} 个事件`);
        } catch (error) {
            console.error('Failed to load data:', error);
            await boardSPI.showFailure('加载数据失败');
        } finally {
            setLoading(false);
        }
    };

    const exportJSON = async () => {
        if (eventsWithPolicies.length === 0 && eventSources.length === 0) {
            await boardSPI.showFailure('请先加载数据');
            return;
        }

        const boardInfo = await boardSPI.fetchBoardInfo();
        const exportData: CommandStormingExport = {
            eventsWithPolicies,
            eventSources,
            exportTime: new Date().toISOString(),
            boardId: boardInfo.id
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `command-storming-${boardInfo.id}-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        await boardSPI.showNotification('导出成功');
    };

    return (
        <div className="flex flex-col h-full">
            <div className="title title-panel">Command Storming 数据汇总</div>
            
            {/* 操作按钮 */}
            <div className="flex gap-2 mx-2 my-2">
                <button 
                    className="btn btn-primary flex-1"
                    onClick={loadData}
                    disabled={loading}
                >
                    {loading ? '加载中...' : '加载数据'}
                </button>
                <button 
                    className="btn btn-secondary flex-1"
                    onClick={exportJSON}
                    disabled={eventsWithPolicies.length === 0}
                >
                    导出 JSON
                </button>
            </div>
            
            {lastLoadTime && (
                <div className="text-xs text-gray-500 text-center mb-2">
                    上次加载: {lastLoadTime} | 事件数: {eventsWithPolicies.length}
                </div>
            )}

            {/* Tab 切换 */}
            <div className="flex border-b mx-2">
                <button
                    className={`px-4 py-2 text-sm font-medium ${
                        activeTab === 'policies' 
                            ? 'border-b-2 border-blue-500 text-blue-600' 
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setActiveTab('policies')}
                >
                    事件与策略 ({eventsWithPolicies.length})
                </button>
                <button
                    className={`px-4 py-2 text-sm font-medium ${
                        activeTab === 'sources' 
                            ? 'border-b-2 border-blue-500 text-blue-600' 
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setActiveTab('sources')}
                >
                    事件源 ({eventSources.length})
                </button>
            </div>

            {/* 表格内容 */}
            <div className="flex-1 overflow-auto mt-2">
                {activeTab === 'policies' && (
                    <EventPolicyTable boardSPI={boardSPI} data={eventsWithPolicies} />
                )}
                {activeTab === 'sources' && (
                    <EventSourceTable boardSPI={boardSPI} data={eventSources} />
                )}
            </div>
        </div>
    );
};