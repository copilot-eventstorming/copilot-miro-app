import React from "react";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faArrowRight, faArrowUp, faArrowDown} from '@fortawesome/free-solid-svg-icons'

export type TPanelProps = {
    title: string,
    children: React.ReactNode,
    index: number,
    level: number,
    currentStep: number,
    currentLevel: number,
    setCurrentLevel: (a: number) => void,
    setCurrentStep: (a: number) => void,
}
export const AgendaItem: React.FC<TPanelProps> = ({
                                                      title,
                                                      children,
                                                      index,
                                                      level,
                                                      setCurrentLevel,
                                                      setCurrentStep,
                                                      currentStep,
                                                      currentLevel,
                                                  }) => {
    const [expanded, setExpanded] = React.useState(true);
    const marginLeft = `${Math.abs(level) * 0.5}rem`;
    // const marginLeft = `${currentLevel === 0 ? 0 : level === currentLevel - 1 ? 0 : 1}rem`;
    console.log("currentLevel", currentLevel, "level", level, "currentStep", currentStep, "step", index, "expand", expanded)
    return (
        (level === currentLevel || level === currentLevel + 1 || index === currentStep) &&
        <div className={`agenda-item ${index === currentStep ? 'agenda-item-open' : ''}`}>


            {(level === currentLevel || level === currentLevel + 1 || (index === currentStep && level > currentLevel - 2)) && (
                <div className="w-full flex flex-row ">
                    <div className={`w-full flex flex-row justify-between`} style={{marginLeft: marginLeft}}>
                        <input type="radio" id={`agenda-item-${index}`} className="hidden"
                               checked={index === currentStep}
                               onChange={() => {
                               }}/>
                        <label className={`agenda-item-btn flex-row justify-between 
                        ${index !== currentStep ? 'bg-blue-700 hover:bg-blue-300' : 'bg-orange-400 hover:bg-orange-300'}`} onClick={() => {
                            setCurrentStep(index)
                            setCurrentLevel(level)
                        }} htmlFor={`agenda-item-${index}`}>
                            <span className="flex-grow">{title}</span>
                            <span className="arrow-button text-end">
                                {(index === currentStep && currentLevel >= 1 && level > 0) ? (
                                    <FontAwesomeIcon onClick={(event) => {
                                        event.stopPropagation();
                                        if (level > 0) setCurrentLevel(currentLevel - 1)
                                    }} icon={faArrowUp} className="mx-1 px-1 hover:cursor-pointer"/>
                                ) : (<span> </span>)}
                                {
                                    <FontAwesomeIcon
                                        icon={index === currentStep && expanded ? faArrowDown : faArrowRight}
                                        className="mx-1 px-1 hover:cursor-pointer"
                                        onClick={(event) => {
                                            if(index === currentStep) setExpanded(!expanded)
                                        }}
                                    />}

                            </span>
                        </label>
                    </div>
                </div>)}
            {
                (index === currentStep && expanded) && children
            }
        </div>
    );
};