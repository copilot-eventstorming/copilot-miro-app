import {WorkshopBoardSPI} from "../../../application/spi/WorkshopBoardSPI";
import React from "react";
import {CopilotSession} from "../../../application/CopilotSession";

export interface EventSummaryTypes {
    eventCards: number;
    eventUniqueCards: number;
    eventBlankCards: number;
    eventIn10min: number;
    eventIn10minUnique: number;
    eventIn10minBlank: number;
    eventIn5min: number;
    eventIn5minUnique: number;
    eventIn5minBlank: number;
    eventIn1min: number;
    eventIn1minUnique: number;
    eventIn1minBlank: number;
    hotspotCards: number;
    hotspotUniqueCards: number;
    hotspotBlankCards: number;
    hotspotIn10m: number;
    hotspotIn10mUniques: number;
    hotspotIn10mBlank: number;
    hotspotIn5m: number;
    hotspotIn5mUniques: number;
    hotspotIn5mBlank: number;
    hotspotIn1m: number;
    hotspotIn1mUniques: number;
    hotspotIn1mBlank: number;
    otherCards: number;
    contributors: number;
    users: number;
}

export interface EventSummaryItem {
    type: string;
    total: number;
    unique: number | undefined;
    blank: number | undefined;
}

export const emptyEventSummary: EventSummaryTypes = {
    eventCards: 0,
    eventUniqueCards: 0,
    eventBlankCards: 0,
    hotspotCards: 0,
    hotspotUniqueCards: 0,
    hotspotBlankCards: 0,
    otherCards: 0,

    eventIn10min: 0,
    eventIn10minUnique: 0,
    eventIn10minBlank: 0,

    eventIn5min: 0,
    eventIn5minUnique: 0,
    eventIn5minBlank: 0,

    eventIn1min: 0,
    eventIn1minUnique: 0,
    eventIn1minBlank: 0,


    hotspotIn10m: 0,
    hotspotIn10mUniques: 0,
    hotspotIn10mBlank: 0,
    hotspotIn5m: 0,

    hotspotIn5mUniques: 0,
    hotspotIn5mBlank: 0,
    hotspotIn1m: 0,
    hotspotIn1mUniques: 0,
    hotspotIn1mBlank: 0,
    users: 0,
    contributors: 0,

}

export interface EventStormingStepProps {
    boardSPI: WorkshopBoardSPI;
    eventSummary: EventSummaryTypes;
    setEventSummary: React.Dispatch<React.SetStateAction<EventSummaryTypes>>;
    copilotSession: CopilotSession;
    currentLevel: number;
    setCurrentLevel: (level: number) => void;
}

export interface EventSummaryTableProps {
    boardSPI: any;
    eventSummary: EventSummaryTypes;
    setEventSummary: React.Dispatch<React.SetStateAction<EventSummaryTypes>>;
    drawerOpen: boolean;
    toggleDrawer: () => void;
    autoRefresh: boolean; // 新增一个props来接收autoRefresh状态
    setAutoRefresh: (on:boolean) => void;// 新增一个props来接收setAutoRefresh函数
}