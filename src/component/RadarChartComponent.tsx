import RadarChart, {RadarData, RadarOptions} from "./RadarChart";
import React, {useEffect, useState} from "react";
import * as d3 from "d3";
import Switch from "react-switch";


export type TRadarProps = {
    id: string,
    title: string,
    data: RadarData[][],
    levels: number,
    maxValue: number,
    showMinimum?: boolean,
    showAverage?: boolean,
    showMaximum?: boolean,
    valueLabelF?: (a: number) => string,
}

export const Radar: React.FC<TRadarProps> = ({
                                                 id, title, data, levels, maxValue,
                                                 showMinimum, showAverage, showMaximum,
                                                 valueLabelF
                                             }) => {
    console.log("RadarChartComponent", data)
    const [keepData, setKeepData] = useState(data)
    const [showMin, setShowMin] = useState(showMinimum === undefined ? true : showMinimum)
    const [showAvg, setShowAvg] = useState(showAverage === undefined ? true : showAverage)
    const [showMax, setShowMax] = useState(showMaximum === undefined ? true : showMaximum)
    const [minThreshold, setMinThreshold] = useState(maxValue)
    const [maxThreshold, setMaxThreshold] = useState(maxValue)
    const [avgThreshold, setAvgThreshold] = useState(maxValue)

    const margin = {top: 30, right: 50, bottom: 50, left: 10},
        width = window.innerWidth - margin.left - margin.right,
        height = Math.min(width, window.innerHeight - margin.top - margin.bottom - 20);

    // @ts-ignore
    const colors: d3.ScaleOrdinal<string, string> = d3.scaleOrdinal()
        .domain(["Min", "Avg", "Max"])
        .range(["#EDC951", "#CC333F", "#00A0B0"]);

    // @ts-ignore
    const radarChartOptions: RadarOptions = {
        w: width,
        h: height,
        margin: margin,
        maxValue: maxValue,
        levels: levels,
        roundStrokes: true,
        color: colors,
        showAxisLabel: false
    };

    useEffect(() => {

        //build keep data according to effect dependencies
        const minData = showMin ? data[0].filter(d => d.value <= minThreshold) : []
        const avgData = showAvg ? data[1].filter(d => d.value <= avgThreshold) : []
        const maxData = showMax ? data[2].filter(d => d.value <= maxThreshold) : []
        const newData = [minData, avgData, maxData]
        setKeepData(newData)

    }, [showMin, showAvg, showMax, minThreshold, maxThreshold, avgThreshold, data])

    // 绘制雷达图
    useEffect(() => {
        //Call function to draw the Radar chart
        RadarChart('#' + id, keepData, radarChartOptions)
    }, [keepData])

    const distinctValues = new Set(data[0].concat(data[1]).concat(data[2]).map(d => d.value))
    const sortedDistinctValues = [...distinctValues].sort((a, b) => a - b)
    return (
        <div className="w-full flex flex-col justify-center">
            <div className="font-lato text-center sub-title">{title}</div>
            <div className="w-full">
                <table className="w-full">
                    <thead>
                    <tr>
                        <th className="header header-panel text-center">Name</th>
                        <th className="header header-panel text-center">On/Off</th>
                        <th className="header header-panel text-center">Max</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr className="odd_row">
                        <td className="header header-panel text-center text-[#EDC951] text-sm">Min</td>
                        <td className="header header-panel text-center">
                            <Switch checked={showMin} onChange={setShowMin} height={18} width={40}
                                    handleDiameter={12}
                                    onColor="#EDC951"
                                    offColor="#888888"/></td>
                        <td className="header header-panel text-center">
                            <div className="w-full flex ">
                                {showMin &&
                                    <div className="flex  w-full">
                                        <input id={`${title}-minThreshold`} type="range" min="0" max={maxValue}
                                               step={0.1}
                                               value={minThreshold}
                                               className="slider bg-[#EDC951] flex-grow py-0 my-2 mr-2"
                                               onChange={event => {
                                                   setMinThreshold(parseInt(event.target.value))
                                               }}/>
                                        <label className="font-lato text-sm"
                                               htmlFor={`${title}-minThreshold`}>{minThreshold}</label>
                                    </div>
                                }
                            </div>
                        </td>
                    </tr>
                    <tr className="even_row">
                        <td className="header header-panel text-center text-[#CC333F] text-sm">Avg</td>
                        <td className="header header-panel text-center">
                            <Switch checked={showAvg} onChange={setShowAvg} height={18} width={40}
                                    handleDiameter={12}
                                    onColor="#CC333F"
                                    offColor="#888888"/></td>
                        <td className="header header-panel text-center">
                            <div className="w-full flex ">
                                {showAvg &&
                                    <div className="flex  w-full">
                                        <input id={`${title}-avgThreshold`} type="range" min="0" max={maxValue}
                                               step={0.1}
                                               value={avgThreshold}
                                               className="slider bg-[#CC333F] flex-grow py-0 my-2 mr-2"
                                               onChange={event => {
                                                   setAvgThreshold(parseInt(event.target.value))
                                               }}/>
                                        <label className="font-lato text-sm"
                                               htmlFor={`${title}-avgThreshold`}>{avgThreshold}</label>
                                    </div>
                                }
                            </div>
                        </td>
                    </tr>
                    <tr className="odd_row">
                        <td className="header header-panel text-center text-[#00A0B0] text-sm"> Max</td>
                        <td className="header header-panel text-center">
                            <Switch checked={showMax} onChange={setShowMax} height={18} width={40}
                                    handleDiameter={12}
                                    onColor="#00A0B0"
                                    offColor="#888888"/></td>
                        <td className="header header-panel text-center">
                            <div className="w-full flex ">
                                {showMax &&
                                    <div className="flex w-full">
                                        <input id={`${title}-maxThreshold`} type="range" min="0" max={maxValue}
                                               step={0.1}
                                               value={maxThreshold}
                                               className="slider bg-[#00A0B0] flex-grow py-0 my-2 mr-2"
                                               onChange={event => {
                                                   setMaxThreshold(parseInt(event.target.value))
                                               }}/>
                                        <label className="font-lato text-sm"
                                               htmlFor={`${title}-maxThreshold`}>{maxThreshold}</label>
                                    </div>
                                }
                            </div>
                        </td>
                    </tr>
                    </tbody>
                </table>
                <div className="w-full text-end outline-amber-600 pb-0">
                    {
                        valueLabelF && sortedDistinctValues && sortedDistinctValues.map((value, index) => {
                            return (
                                valueLabelF(value) ? (
                                    <li key={index} className="text-cell text-cell-panel text-sm">
                                        {value} - {valueLabelF(value)}
                                    </li>
                                ) : (
                                    <div></div>
                                )
                            )
                        })
                    }
                </div>
            </div>

            <div id={id}/>
        </div>
    )

}