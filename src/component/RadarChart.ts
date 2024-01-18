/////////////////////////////////////////////////////////
/////////////// The Radar Chart Function ////////////////
/////////////// Written by Nadieh Bremer ////////////////
////////////////// VisualCinnamon.com ///////////////////
/////////// Inspired by the code of alangrafu ///////////
/////////////////////////////////////////////////////////

import * as d3 from "d3";

export interface RadarData {
    axis: string;
    value: number;
}

export interface RadarOptions {
    w: number;
    h: number;
    margin: { top: number, right: number, bottom: number, left: number };
    levels: number;
    maxValue: number;
    labelFactor: number;
    wrapWidth: number;
    opacityArea: number;
    dotRadius: number;
    opacityCircles: number;
    strokeWidth: number;
    roundStrokes: boolean;
    showAxisLabel: boolean;
    color: d3.ScaleOrdinal<string, string>;
}

function RadarChart(id: string, data: RadarData[][], options: RadarOptions) {
    const cfg = {
        w: 600,				//Width of the circle
        h: 600,				//Height of the circle
        margin: {top: 10, right: 10, bottom: 10, left: 10}, //The margins of the SVG
        levels: 4,				//How many levels or inner circles should there be drawn
        maxValue: 4, 			//What is the value that the biggest circle will represent
        labelFactor: 1.25, 	//How much farther than the radius of the outer circle should the labels be placed
        wrapWidth: 60, 		//The number of pixels after which a label needs to be given a new line
        opacityArea: 0.05, 	//The opacity of the area of the blob
        dotRadius: 4, 			//The size of the colored circles of each blog
        opacityCircles: 0.1, 	//The opacity of the circles of each blob
        strokeWidth: 2, 		//The width of the stroke around each blob
        roundStrokes: false,	//If true the area and stroke will follow a round path (cardinal-closed)
        color: d3.scaleOrdinal(d3.schemeCategory10),	//Color function
        showAxisLabel: false
    };

    if ('undefined' !== typeof options) {
        Object.assign(cfg, options);
    }

    //If the supplied maxValue is smaller than the actual one, replace by the max in the data
    const maxValue = Math.max(cfg.maxValue, <number>d3.max(data, function (i) {
        return d3.max(i.map(function (o) {
            return o.value;
        }))
    }));

    const allAxis =
            new Set((data[0].concat(data[1]).concat(data[2]).map((i, j) => i.axis))),
        total = allAxis.size,
        radius = Math.min(cfg.w / 2, cfg.h / 2),
        Format = d3.format('.0'),
        angleSlice = Math.PI * 2 / total;

    //Scale for the radius
    const rScale = d3.scaleLinear()
        .range([0, radius])
        .domain([0, maxValue]);

    /////////////////////////////////////////////////////////
    //////////// Create the container SVG and g /////////////
    /////////////////////////////////////////////////////////

    //Remove whatever chart with the same id/class was present before
    d3.select(id).select("svg").remove();

    //Initiate the radar chart SVG
    const svg = d3.select(id).append("svg")
        .attr("width", cfg.w + cfg.margin.left + cfg.margin.right)
        .attr("height", cfg.h + cfg.margin.top + cfg.margin.bottom)
        .attr("class", "radar" + id);

    //Append a g element
    const g = svg.append("g")
        .attr("transform", "translate(" + (cfg.w / 2 + cfg.margin.left) + "," + (cfg.h / 2 + cfg.margin.top) + ")");

    /////////////////////////////////////////////////////////
    ////////// Glow filter for some extra pizzazz ///////////
    /////////////////////////////////////////////////////////

    //Filter for the outside glow
    const filter = g.append('defs').append('filter').attr('id', 'glow'),
        feGaussianBlur = filter.append('feGaussianBlur').attr('stdDeviation', '2.5').attr('result', 'coloredBlur'),
        feMerge = filter.append('feMerge'),
        feMergeNode_1 = feMerge.append('feMergeNode').attr('in', 'coloredBlur'),
        feMergeNode_2 = feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    /////////////////////////////////////////////////////////
    /////////////// Draw the Circular grid //////////////////
    /////////////////////////////////////////////////////////

    //Wrapper for the grid & axes
    const axisGrid = g.append("g").attr("class", "axisWrapper");

    //Draw the background circles
    axisGrid.selectAll(".levels")
        .data(d3.range(1, (cfg.levels + 1)).reverse())
        .enter()
        .append("circle")
        .attr("class", "gridCircle")
        .attr("r", (d, i) => radius / cfg.levels * d)
        .style("fill", "#CDCDCD")
        .style("stroke", "#CDCDCD")
        .style("fill-opacity", cfg.opacityCircles)
        .style("filter", "url(#glow)");

    //Text indicating at what % each level is
    axisGrid.selectAll(".axisLabel")
        .data(d3.range(1, (cfg.levels + 1)).reverse())
        .enter().append("text")
        .attr("class", "axisLabel")
        .attr("x", 4)
        .attr("y", function (d) {
            return -d * radius / cfg.levels;
        })
        .attr("dy", "0.4em")
        .style("font-size", "10px")
        .attr("fill", "#737373")
        .text(function (d, i) {
            return Format(maxValue * d / cfg.levels);
        });

    /////////////////////////////////////////////////////////
    //////////////////// Draw the axes //////////////////////
    /////////////////////////////////////////////////////////

    //Create the straight lines radiating outward from the center
    const axis = axisGrid.selectAll(".axis")
        .data(allAxis)
        .enter()
        .append("g")
        .attr("class", "axis");

    //Append the lines
    axis.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", function (d, i) {
            return rScale(maxValue * 1.1) * Math.cos(angleSlice * i - Math.PI / 2);
        })
        .attr("y2", function (d, i) {
            return rScale(maxValue * 1.1) * Math.sin(angleSlice * i - Math.PI / 2);
        })
        .attr("class", "line")
        .style("stroke", "white")
        .style("stroke-width", "2px");

    //Append the labels at each axis
    if (cfg.showAxisLabel) {
        axis.append("text")
            .attr("class", "legend")
            .style("font-size", "11px")
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .attr("x", function (d, i) {
                return rScale(maxValue * cfg.labelFactor) * Math.cos(angleSlice * i - Math.PI / 2);
            })
            .attr("y", function (d, i) {
                return rScale(maxValue * cfg.labelFactor) * Math.sin(angleSlice * i - Math.PI / 2);
            })
            .text(function (d) {
                return d
            })
            .call(wrap, cfg.wrapWidth);
    }

    /////////////////////////////////////////////////////////
    ///////////// Draw the radar chart blobs ////////////////
    /////////////////////////////////////////////////////////

    //The radial line function
    const radarLine = d3.lineRadial<RadarData>()
        .curve(d3.curveCardinalClosed)
        .radius(function (d) {
            return rScale(d.value);
        })
        .angle(function (d, i) {
            return i * angleSlice;
        });


    //Create a wrapper for the blobs
    const blobWrapper = g.selectAll(".radarWrapper")
        .data(data)
        .enter().append("g")
        .attr("class", "radarWrapper");

    //Append the backgrounds
    blobWrapper
        .append("path")
        .attr("class", "radarArea")
        .attr("d", (d, i) => radarLine(d))
        .style("fill", function (d, i) {
            return cfg.color(i.toString());
        })
        .style("fill-opacity", cfg.opacityArea)
        .on('mouseover', function (d, i) {
            d3.selectAll(".radarArea")
                .transition().duration(200)
                .style("fill-opacity", 0.1);
            d3.select(this)
                .transition().duration(200)
                .style("fill-opacity", 0.7);
        })
        .on('mouseout', function () {
            d3.selectAll(".radarArea")
                .transition().duration(200)
                .style("fill-opacity", cfg.opacityArea);
        });

    //Create the outlines
    blobWrapper.append("path")
        .attr("class", "radarStroke")
        .attr("d", (d, i) => radarLine(d))
        .style("stroke-width", cfg.strokeWidth + "px")
        .style("stroke", function (d, i) {
            return cfg.color(i.toString());
        })
        .style("fill", "none")
        .style("filter", "url(#glow)");

    //Append the circles
    blobWrapper.selectAll(".radarCircle")
        .data(function (d, i) {
            return d;
        })
        .enter().append("circle")
        .attr("class", "radarCircle")
        .attr("r", cfg.dotRadius)
        .attr("cx", function (d, i) {
            return rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2);
        })
        .attr("cy", function (d, i) {
            return rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2);
        })
        .style("fill", function (d, i) {
            return cfg.color(i.toString());
        })
        .style("fill-opacity", 0.6);

    /////////////////////////////////////////////////////////
    //////// Append invisible circles for tooltip ///////////
    /////////////////////////////////////////////////////////

    //Wrapper for the invisible circles on top
    const blobCircleWrapper = g.selectAll(".radarCircleWrapper")
        .data(data)
        .enter().append("g")
        .attr("class", "radarCircleWrapper")

    //Set up the small tooltip for when you hover over a circle
    const tooltip = g.append("text")
        .attr("class", "tooltip font-lato text-gray-500 text-lg")
        .style("font-size", "10px")
        .style("opacity", 0);

    //Append a set of invisible circles on top for the mouseover pop-up
    blobCircleWrapper.selectAll(".radarInvisibleCircle")
        .data(function (d, i) {
            return d;
        })
        .enter().append("circle")
        .attr("class", "radarInvisibleCircle")
        .attr("r", cfg.dotRadius * 1.5)
        .attr("cx", function (d, i) {
            return rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2);
        })
        .attr("cy", function (d, i) {
            return rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2);
        })
        .style("fill", "none")
        .style("pointer-events", "all")
        .on("mouseover", function (mouseEvent, radarData) {
            let newX = parseFloat(d3.select(this).attr('cx')) - 10;
            let newY = parseFloat(d3.select(this).attr('cy')) - 10;

            tooltip
                .attr('x', newX)
                .attr('y', newY)
                .attr('class', 'tooltip font-lato text-gray-900 text-lg')
                .text(`(${radarData.axis}, ${Format(radarData.value)})`)
                .transition().duration(100)
                .style('opacity', 0.8);
        })
        .on("mouseout", function () {
            tooltip.transition().duration(100)
                .style("opacity", 0);
        });


    /////////////////////////////////////////////////////////
    /////////////////// Helper Function /////////////////////
    /////////////////////////////////////////////////////////

    //Taken from http://bl.ocks.org/mbostock/7555321
    //Wraps SVG text
    function wrap(text: d3.Selection<SVGTextElement, string, SVGGElement, unknown>, width: number): void {
        text.each(function () {
            const text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                y = text.attr("y"),
                x = text.attr("x"),
                dy = parseFloat(text.attr("dy") || '0');
            let word: string | undefined,
                line: string[] = [],
                lineNumber = 0,
                lineHeight = 1.4, // ems
                tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");

            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node()?.getComputedTextLength()! > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                }
            }
        });
    }

}//RadarChart

export default RadarChart;