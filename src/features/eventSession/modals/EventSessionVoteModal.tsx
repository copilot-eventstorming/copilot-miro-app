import ReactDOM from "react-dom/client";
import React, {useEffect, useState} from "react";
import {CopilotSession, copilotSession$} from "../../../application/CopilotSession";
import {initialize, release} from "../../../utils/AppInitializer";
import {WorkshopBoardService} from "../../../api/WorkshopBoardService";
import {miroProxy} from "../../../api/MiroProxy";
import {VoteItem} from "../types/VoteItem";
import {v4 as uuidv4} from "uuid";
import {EventSessionVoteResult} from "../broadcast/message/EventSessionVoteResult";
import {EventSessionVoteModalChannel, VoteSubmittedMessage} from "../types/EventSessionVoteModalChannels";
import {Broadcaster} from "../../../application/messaging/Broadcaster";

/*

Vote others' event:
1. understand?
2. past tense, value and impact, specific meaning, and independent
 */

const EventSessionVoteModal: React.FC = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const sender = urlParams.get('sender') ?? "facilitator";
    const senderName = urlParams.get('senderName') ?? "facilitator";
    const [voteItems, setVoteItems] = useState(JSON.parse(urlParams.get('voteItems') ?? "[]"));
    const [copilotSession, setCopilotSession] = useState(copilotSession$.value as CopilotSession);
    const boardSPI = new WorkshopBoardService(miroProxy);
    const broadcaster = new Broadcaster(miroProxy);
    const [broadcastChannel, setBroadcastChannel] = useState<BroadcastChannel | null>(null);

    console.log("sender", sender)
    useEffect(() => {
        const channel = new BroadcastChannel(EventSessionVoteModalChannel);
        setBroadcastChannel(channel);

        return () => {
            channel.close();
        };
    }, []);
    const isEveryEventVoted: () => boolean = () => {
        return voteItems.length > 0
            && voteItems.every((voteItem: VoteItem) =>
                voteItem.familiar !== null &&
                (voteItem.familiar === 0
                    || (voteItem.familiar > 0
                        && voteItem.impact !== undefined && voteItem.impact !== null
                        && voteItem.independent !== undefined && voteItem.independent !== null
                        && voteItem.pastTense !== undefined && voteItem.pastTense !== null
                        && voteItem.specific !== undefined && voteItem.specific !== null
                    ))
            )
    }

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        const message = new EventSessionVoteResult(
            uuidv4(), sender,
            copilotSession?.miroUserId,
            copilotSession?.miroUsername ?? "",
            null,
            voteItems);
        broadcaster.broadcast(message);
        if (broadcastChannel) {
            release();
            broadcastChannel.postMessage(VoteSubmittedMessage);
        }
    };

    useEffect(() => {
        initialize()
    }, []);

    useEffect(() => {
        const subscription = copilotSession$.subscribe(maybeCopilotSession => {
            if (maybeCopilotSession) {
                setCopilotSession(maybeCopilotSession);
            }
        })
        return () => {
            subscription.unsubscribe()
        }
    }, []);

    return (
        <div className="w-full">
            <h1 className="title title-modal">Feedback for Domain Event Candidates</h1>
            <div className="w-full flex flex-row justify-between">
                <div/>
                <div className="header header-modal text-sm px-2">
                    <span className="text-cell text-sm font-bold">Familiarity</span>
                    <li>0: Never heard of it</li>
                    <li>1: Heard of it, but don't know what it is</li>
                    <li>2: Know what it is, but never used it</li>
                    <li>3: Used it</li>
                </div>
                <div className="header header-modal text-sm px-2">
                    <span className="text-cell text-sm font-bold">Valuable</span>
                    <li>0: No impact or value.</li>
                    <li>1: Low impact or value.</li>
                    <li>2: Medium impact or value.</li>
                    <li>3: High impact or value</li>
                </div>
                <div/>
            </div>
            <div className="w-full">
                <table className="w-full">
                    <thead>
                    <tr>
                        <th className="header header-modal text-sm text-center">Event Name</th>
                        <th className="header header-modal text-sm  text-center">Familiarity</th>
                        <th className="header header-modal text-sm  text-center">Past Tense</th>
                        <th className="header header-modal text-sm text-center">Specific</th>
                        <th className="header header-modal text-sm text-center">Independent</th>
                        <th className="header header-modal text-sm text-center">Valuable</th>
                    </tr>
                    </thead>
                    <tbody>
                    {voteItems.map((voteItem: VoteItem, row: number) => {
                        return (
                            <tr key={row} className={`${row % 2 === 0 ? "even_row" : "odd_row"} w-full `}>
                                <td className="text-cell text-cell-modal text-sm">{voteItem.eventName}</td>
                                <td>
                                    <div className="flex flex-row justify-between  space-x-4  mx-2 my-1 py-1">
                                        {[0, 1, 2, 3].map((value, col) => (
                                            <div key={value} className="flex flex-col">
                                                <input
                                                    type="radio"
                                                    id={`familiar-${row}-${col}`}
                                                    name={`familiar-group-${row}`}
                                                    value={value}
                                                    checked={voteItem.familiar === value}
                                                    onChange={(e) => {
                                                        const newVoteItems = voteItems.map((item: VoteItem, itemIndex: number) => {
                                                            if (itemIndex === row) {
                                                                return {...item, familiar: Number(e.target.value)};
                                                            }
                                                            return item;
                                                        });
                                                        setVoteItems(newVoteItems);
                                                    }}
                                                />
                                                <label htmlFor={`familiar-${row}-${col}`}
                                                       className="text-sm font-lato">{value}</label>
                                            </div>
                                        ))}
                                    </div>
                                </td>
                                <td>
                                    <div className="flex flex-row justify-between space-x-4 centered text-sm mx-5">
                                        {voteItem.familiar != null && voteItem.familiar > 0 && ['true', 'false'].map((value, col) => (
                                            <div>
                                                <div key={value} className="flex flex-col">
                                                    <input
                                                        type="radio"
                                                        id={`pastTense-${row}-${col}`}
                                                        name={`pastTense-${row}`}
                                                        value={value}
                                                        checked={voteItem.pastTense === (value === 'true')}
                                                        onChange={(e) => {
                                                            const newVoteItems = voteItems.map((item: VoteItem, itemIndex: number) => {
                                                                if (itemIndex === row) {
                                                                    return {
                                                                        ...item,
                                                                        pastTense: e.target.value === 'true'
                                                                    };
                                                                }
                                                                return item;
                                                            });
                                                            setVoteItems(newVoteItems);
                                                        }}
                                                    />
                                                    <label
                                                        htmlFor={`pastTense-${row}-${col}`}
                                                        className="text-sm font-lato">{value === 'true' ? 'Y' : 'N'}</label>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </td>
                                <td>
                                    <div className="flex flex-row justify-between  space-x-4  centered text-sm mx-5">
                                        {voteItem.familiar != null && voteItem.familiar > 0 && ['true', 'false'].map((value, col) => (
                                            <div key={value} className="flex flex-col">
                                                <input
                                                    type="radio"
                                                    id={`specific-${row}-${col}`}
                                                    name={`specific-${row}`}
                                                    value={value}
                                                    checked={voteItem.specific === (value === 'true')}
                                                    onChange={(e) => {
                                                        const newVoteItems = voteItems.map((item: VoteItem, itemIndex: number) => {
                                                            if (itemIndex === row) {
                                                                return {...item, specific: e.target.value === 'true'};
                                                            }
                                                            return item;
                                                        });
                                                        setVoteItems(newVoteItems);
                                                    }}
                                                />
                                                <label
                                                    htmlFor={`specific-${row}-${col}`}
                                                    className="text-sm font-lato">{value === 'true' ? 'Y' : 'N'}</label>
                                            </div>
                                        ))}</div>
                                </td>
                                <td>
                                    <div className="flex flex-row justify-between  space-x-4  centered text-sm mx-5">
                                        {voteItem.familiar != null && voteItem.familiar > 0 && ['true', 'false'].map((value, col) => (
                                            <div key={value} className="flex flex-col">
                                                <input
                                                    type="radio"
                                                    id={`independent-${row}-${col}`}
                                                    name={`independent-${row}`}
                                                    value={value}
                                                    checked={voteItem.independent === (value === 'true')}
                                                    onChange={(e) => {
                                                        const newVoteItems = voteItems.map((item: VoteItem, itemIndex: number) => {
                                                            if (itemIndex === row) {
                                                                return {
                                                                    ...item,
                                                                    independent: e.target.value === 'true'
                                                                };
                                                            }
                                                            return item;
                                                        });
                                                        setVoteItems(newVoteItems);
                                                    }}
                                                />
                                                <label
                                                    htmlFor={`independent-${row}-${col}`}
                                                    className="text-sm font-lato">{value === 'true' ? 'Y' : 'N'}</label>
                                            </div>
                                        ))}</div>
                                </td>
                                <td>
                                    <div
                                        className="flex flex-row justify-between  space-x-4  centered text-sm mx-5">{voteItem.familiar != null && voteItem.familiar > 0 && [0, 1, 2, 3].map((value, col) => (
                                        <div key={value} className="flex flex-col">
                                            <input
                                                type="radio"
                                                id={`impact-${row}-${col}`}
                                                name={`impact-group-${row}`}
                                                value={value}
                                                checked={voteItem.impact === value}
                                                onChange={(e) => {
                                                    const newVoteItems = voteItems.map((item: VoteItem, itemIndex: number) => {
                                                        if (itemIndex === row) {
                                                            return {...item, impact: Number(e.target.value)};
                                                        }
                                                        return item;
                                                    });
                                                    setVoteItems(newVoteItems);
                                                }}
                                            />
                                            <label htmlFor={`impact-${row}-${col}`}
                                                   className="text-sm font-lato">{value}</label>
                                        </div>
                                    ))}</div>
                                </td>
                            </tr>
                        )
                    })}
                    </tbody>
                </table>
                <div className="w-full py-2 centered">
                    <button className="btn btn-primary btn-primary-modal px-2" onClick={handleSubmit}
                            disabled={!isEveryEventVoted()}>Submit
                    </button>
                </div>
            </div>
        </div>
    );
}
const root = ReactDOM.createRoot(document.getElementById('vote-root') as HTMLElement);
root.render(<EventSessionVoteModal/>);