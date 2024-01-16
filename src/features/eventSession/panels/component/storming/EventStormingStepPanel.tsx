import React, {useEffect, useState} from "react";
import {EventStormingStepProps} from "../../../types/EventSummaryTypes";
import {WorkshopCard} from "../../../../../application/spi/WorkshopBoardSPI";
import 'react-tabs/style/react-tabs.css';
import '../../../../../assets/LoadingSpinner.css'
import {OnlineUserInfo} from "@mirohq/websdk-types";
import {miroProxy} from "../../../../../api/MiroProxy";
import {Broadcaster} from "../../../../../application/messaging/Broadcaster";
import {AgendaItem} from "../../../../../component/AgendaItem";
import {CreatingEvents} from "./ContributionStatistic";
import {RemoveDuplicates} from "./RemoveDuplicates";
import {CollectingEventFeedbacks} from "./CollectingFeedbacks";

/*
Enhancement:
- [x] Add Tables to show Contributions
- [-] Add Methods to recognize de-duplicate events, the duplication number indicates the importance/alignment of the event
  - [x] Clustering similar events
  - [] separate the events into different cluster??? or just remove the duplicates by participants
- [x] Add Modal to let everyone vote for others' events:
   - I think I know what it means. if yes, then
   - is it a valid event on the 4 characteristics: past tense, value and impact, specific meaning, and independent
   - [] add interest level
- [x] After Vote, facilitator can do alignment analysis and see the result in the panel.
   - [] show and record total entropy
- [] Reducing the entropy by removing the event cards
   - [x] by similarity (GPT)
   - [] by importance/impact/value
   - [] by removing/replacing non-specific events (GPT)
   - [] by correcting into past tense (GPT)
   - [] by removing/replacing non-independent events (GPT)
   - [] by summarizing the events
- [] After Vote, participants will see the vote statistics about their events from left hand side panel opened.
   - sort by interest, importance, familiarity
   -
- [] Add Table/Modal to show the vote statistics
   - List the deduplicated events order by 'familiarity percentage', and 'consensus' with ascending direction
 */





const Steps: React.FC = () => <>
    <div className="flex flex-col w-full my-4 px-4 py-2 font-lato text-sm">

        <b>Steps</b>
        <li>Align Workshop Objectives</li>
        <li>Event Storming Ramp Up
            <ul style={{listStyleType: 'disc', paddingLeft: '30px'}}>
                <li>Everyone's 1st shot</li>
                <li>Quick Review</li>
            </ul>
        </li>
        <li>Event Storming Fast Track
            <ul style={{listStyleType: 'disc', paddingLeft: '30px'}}>
                <li>Fire at will</li>
                <li>Review
                    <ul style={{listStyleType: 'disc', paddingLeft: '15px'}}>
                        <li>Remove duplicates</li>
                        <li>Collect feedbacks</li>
                        <li>Ignore Low-value cards</li>
                        <li>Fix non-past tense cards</li>
                        <li>Fix unclear semantics cards</li>
                        <li>Split non-independent events</li>
                        <li>Merge cards with too fine granularity</li>
                    </ul>
                </li>
            </ul>
        </li>
    </div>
</>;


const ReviewStep: React.FC<EventStormingStepProps> = ({
                                                          boardSPI, eventSummary,
                                                          setEventSummary, copilotSession,
                                                          currentLevel, setCurrentLevel
                                                      }) => {
    const [cards, setCards] = useState([] as WorkshopCard[])
    const [deduplicationDrawerOpen, setDeduplicationDrawerOpen] = React.useState(true);
    const [currentStep, setCurrentStep] = useState(0)
    const [onlineUsers, setOnlineUsers] = useState([] as OnlineUserInfo[])
    const broadcaster = new Broadcaster(miroProxy)

    useEffect(() => {
        setCurrentLevel(3)
    }, [])
    useEffect(() => {
        boardSPI.fetchEventCards().then(cards => {
            setCards(cards)
        })
    }, []);
    const deduplicationToggleDrawer = () => {
        setDeduplicationDrawerOpen(!deduplicationDrawerOpen);
    };
    return (
        <div className="agenda">
            <AgendaItem
                title="Remove duplicates"
                index={0}
                level={3}
                currentLevel={currentLevel}
                currentStep={currentStep}
                setCurrentLevel={setCurrentLevel}
                setCurrentStep={setCurrentStep}
            >
                <RemoveDuplicates boardSPI={boardSPI} cards={cards} setCards={setCards}
                                  copilotSession={copilotSession}
                                  drawerOpen={deduplicationDrawerOpen}
                                  toggleDrawer={deduplicationToggleDrawer}/>
            </AgendaItem>
            <AgendaItem
                title="Collect feedbacks"
                index={1}
                level={3}
                currentLevel={currentLevel}
                currentStep={currentStep}
                setCurrentLevel={setCurrentLevel}
                setCurrentStep={setCurrentStep}
            >
                <CollectingEventFeedbacks onlineUsers={onlineUsers} cards={cards} boardSPI={boardSPI} copilotSession={copilotSession}
                                          broadcaster={broadcaster}/>

            </AgendaItem>
            <AgendaItem
                title="Ignore Low-value cards"
                index={2}
                level={3}
                currentLevel={currentLevel}
                currentStep={currentStep}
                setCurrentLevel={setCurrentLevel}
                setCurrentStep={setCurrentStep}
            >
                <div/>
            </AgendaItem>
            <AgendaItem
                title="Fix non-past tense cards"
                index={3}
                level={3}
                currentLevel={currentLevel}
                currentStep={currentStep}
                setCurrentLevel={setCurrentLevel}
                setCurrentStep={setCurrentStep}
            >
                <div/>
            </AgendaItem>
            <AgendaItem
                title="Fix unclear semantics cards"
                index={4}
                level={3}
                currentLevel={currentLevel}
                currentStep={currentStep}
                setCurrentLevel={setCurrentLevel}
                setCurrentStep={setCurrentStep}
            >
                <div/>
            </AgendaItem>
            <AgendaItem
                title="Split non-independent events"
                index={5}
                level={3}
                currentLevel={currentLevel}
                currentStep={currentStep}
                setCurrentLevel={setCurrentLevel}
                setCurrentStep={setCurrentStep}
            >
                <div/>
            </AgendaItem>
            <AgendaItem
                title="Merge cards with too fine granularity"
                index={6}
                level={3}
                currentLevel={currentLevel}
                currentStep={currentStep}
                setCurrentLevel={setCurrentLevel}
                setCurrentStep={setCurrentStep}
            >
                <div/>
            </AgendaItem>
        </div>
    )
}


const RampUpStepPanel: React.FC<EventStormingStepProps> = ({
                                                               boardSPI, eventSummary,
                                                               setEventSummary, copilotSession,
                                                               currentLevel, setCurrentLevel
                                                           }) => {
    const [currentStep, setCurrentStep] = useState(0)

    useEffect(() => {
        setCurrentLevel(2)
    }, [])
    return (
        <div className="agenda">
            <AgendaItem
                title="2.2.1 Everyone's 1st shot"
                index={0}
                level={2}
                currentLevel={currentLevel}
                currentStep={currentStep}
                setCurrentLevel={setCurrentLevel}
                setCurrentStep={setCurrentStep}
            >
                <CreatingEvents setEventSummary={setEventSummary} eventSummary={eventSummary} boardSPI={boardSPI}/>
            </AgendaItem>
            <AgendaItem
                title="2.2.2 Quick Review"
                index={1}
                level={2}
                currentLevel={currentLevel}
                currentStep={currentStep}
                setCurrentLevel={setCurrentLevel}
                setCurrentStep={setCurrentStep}
            >
                <ReviewStep setEventSummary={setEventSummary} eventSummary={eventSummary} boardSPI={boardSPI}
                            currentLevel={currentLevel} setCurrentLevel={setCurrentLevel}
                            copilotSession={copilotSession}/>
            </AgendaItem>
        </div>
    )
}


const FastTrackStepPanel: React.FC<EventStormingStepProps> = ({
                                                                  boardSPI, eventSummary,
                                                                  setEventSummary, copilotSession,
                                                                  currentLevel, setCurrentLevel
                                                              }) => {
    const [currentStep, setCurrentStep] = useState(0)
    return (
        <div className="agenda">
            <AgendaItem
                title="2.3.1 Fire at will"
                index={0}
                level={2}
                currentLevel={currentLevel}
                currentStep={currentStep}
                setCurrentLevel={setCurrentLevel}
                setCurrentStep={setCurrentStep}
            >
                <CreatingEvents setEventSummary={setEventSummary} eventSummary={eventSummary} boardSPI={boardSPI}/>
            </AgendaItem>
            <AgendaItem
                title="2.3.2 Review"
                index={1}
                level={2}
                currentLevel={currentLevel}
                currentStep={currentStep}
                setCurrentLevel={setCurrentLevel}
                setCurrentStep={setCurrentStep}
            >
                <ReviewStep setEventSummary={setEventSummary} eventSummary={eventSummary} boardSPI={boardSPI}
                            currentLevel={currentLevel} setCurrentLevel={setCurrentLevel}
                            copilotSession={copilotSession}/>
            </AgendaItem>
        </div>
    )
}

const EventStormingStepPanel: React.FC<EventStormingStepProps> = ({
                                                                      boardSPI, eventSummary,
                                                                      setEventSummary, copilotSession,
                                                                      currentLevel, setCurrentLevel
                                                                  }) => {
    const [currentStep, setCurrentStep] = useState(0)

    useEffect(() => {
        setCurrentLevel(1)
    }, [])

    return (
        <div className="agenda">
            <AgendaItem
                title="2.1. Align Workshop Objectives"
                index={0}
                level={1}
                currentLevel={currentLevel}
                currentStep={currentStep}
                setCurrentLevel={setCurrentLevel}
                setCurrentStep={setCurrentStep}
            >
                <Steps/>
            </AgendaItem>
            <AgendaItem
                title="2.2. Event Storming Ramp Up"
                index={1}
                level={1}
                currentLevel={currentLevel}
                currentStep={currentStep}
                setCurrentLevel={setCurrentLevel}
                setCurrentStep={setCurrentStep}
            >
                <RampUpStepPanel boardSPI={boardSPI}
                                 eventSummary={eventSummary} setEventSummary={setEventSummary}
                                 currentLevel={currentLevel} setCurrentLevel={setCurrentLevel}
                                 copilotSession={copilotSession}/>
            </AgendaItem>
            <AgendaItem
                title="2.3. Event Storming Fast Track"
                index={2}
                level={1}
                currentLevel={currentLevel}
                currentStep={currentStep}
                setCurrentLevel={setCurrentLevel}
                setCurrentStep={setCurrentStep}
            >
                <FastTrackStepPanel boardSPI={boardSPI}
                                    eventSummary={eventSummary} setEventSummary={setEventSummary}
                                    currentLevel={currentLevel} setCurrentLevel={setCurrentLevel}
                                    copilotSession={copilotSession}/>
            </AgendaItem>
        </div>
    );
};

export {
    EventStormingStepPanel
};