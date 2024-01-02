{
    let height = Math.min(width, width * 1.2);

    let graph = ({
        nodes: Array.from({length: 13})
            .map((i, index) => {
                if (index < 10 && index % 2 === 0) {
                    return {id: index, type: 'domain'};
                } else if (index < 10) {
                    return {id: index, type: 'application'};
                } else {
                    return {id: index, type: 'infrastructure'};
                }
            }),
        links: [{source: 0, target: 1}, {source: 1, target: 2}, {source: 2, target: 0}, {
            source: 1,
            target: 3
        }, {source: 3, target: 2}, {source: 3, target: 4}, {source: 4, target: 5}, {source: 5, target: 6}, {
            source: 5,
            target: 7
        }, {source: 6, target: 7}, {source: 6, target: 8}, {source: 7, target: 8}, {source: 9, target: 4}, {
            source: 9,
            target: 11
        }, {source: 9, target: 10}, {source: 10, target: 11}, {source: 11, target: 12}, {source: 12, target: 10}]
    });

    function maxRadius(nodes, rate, centerX, centerY) {
        return Math.max(...nodes.map(d => {
            return Math.sqrt((d.x - centerX) * (d.x - centerX) + (d.y - centerY) * (d.y - centerY));
        })) * rate;
    }

    function createSimulation(nodes, links, type, rate, width, height, innerNodes) {
        return d3.forceSimulation(nodes)
            .force("charge", d3.forceManyBody().strength(-50))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force('collide', d3.forceCollide().radius(d => d.radius + 10))
            .force('boundary', () => {
                let layerRadius = maxRadius(innerNodes, rate, width / 2, height / 2);
                for (const node of nodes) {
                    const x = node.x - width / 2;
                    const y = node.y - height / 2;
                    const distance = Math.sqrt(x * x + y * y);
                    const maxR = domainNodes.concat(innerNodes).length * 36
                    if (distance > maxR) {
                        console.log('maxR, distance', maxR, distance)
                        const angle = Math.atan2(y, x);
                        console.log(node.vx > width / 2, (distance - maxR) * Math.cos(angle))
                        node.vx -= (distance - maxR) * Math.cos(angle);
                        node.vy -= (distance - maxR) * Math.sin(angle);
                    }
                    if (distance < layerRadius) {
                        const angle = Math.atan2(y, x);
                        node.vx += (layerRadius - distance + 36) * Math.cos(angle);
                        node.vy += (layerRadius - distance + 36) * Math.sin(angle);
                    }
                }
            })
            .force("link", d3.forceLink(links).id(d => d.id).distance(50))
            .on("tick", tick);
    }

    const rate = 1.1;

    // const svg = d3.create("svg")
    //         .attr("viewBox", [0, 0, width, height]), link = svg
    //         .selectAll(".link")
    //         .data(graph.links)
    //         .join("line")
    //         .classed("link", true)
    //         .attr('stroke', 'black'),
    //
    //     node = svg
    //         .selectAll(".node")
    //         .data(graph.nodes)
    //         .join("circle")
    //         .attr("r", 12)
    //         .classed("node", true)
    //         .classed("fixed", d => d.fx !== undefined)
    //         .style("fill", d => {
    //             switch (d.type) {
    //                 case 'domain':
    //                     return "orange";
    //                 case 'application':
    //                     return "blue";
    //                 case 'infrastructure':
    //                     return "grey";
    //             }
    //         });

    const svg = d3.create("svg").attr("viewBox", [0, 0, width, height]);

    const linkData = svg.selectAll(".link").data(graph.links);
    const link = linkData.join("line").classed("link", true).attr('stroke', 'black');

    const nodeData = svg.selectAll(".node").data(graph.nodes);
    const node = nodeData.join("circle").attr("r", 12).classed("node", true).classed("fixed", d => d.fx !== undefined).style("fill", d => {
        switch (d.type) {
            case 'domain':
                return "orange";
            case 'application':
                return "blue";
            case 'infrastructure':
                return "grey";
        }
    });


    svg.append("circle")
        .attr("cx", width / 2)
        .attr("cy", height / 2)
        .attr("r", 5)
        .style("fill", "black");

    const domainNodes = graph.nodes.filter(d => d.type === 'domain');
    const domainNodeIds = new Set(domainNodes.map(d => d.id));
    const domainEdges = graph.links.filter(link => domainNodeIds.has(link.source) && domainNodeIds.has(link.target));

    const applicationNodes = graph.nodes.filter(d => d.type === 'application');
    const applicationNodeIds = new Set(applicationNodes.map(d => d.id).concat(domainNodeIds));
    const applicationEdges = graph.links.filter(link => applicationNodeIds.has(link.source) && applicationNodeIds.has(link.target));

    const infraNodes = graph.nodes.filter(d => d.type === 'infrastructure');
    const infraNodeIds = new Set(infraNodes.map(d => d.id).concat(domainNodeIds).concat(applicationNodeIds));
    const infraEdges = graph.links.filter(link => infraNodeIds.has(link.source) && infraNodeIds.has(link.target));

    const domainLayer = svg.append("circle")
        .attr("cx", width / 2)
        .attr("cy", height / 2)
        .style("fill", "#FFAD60").lower();

    const applicationLayer = svg.append("circle")
        .attr("cx", width / 2)
        .attr("cy", height / 2)
        .style("fill", "lightblue").lower();

    const infoLayer = svg.append("circle")
        .attr("cx", width / 2)
        .attr("cy", height / 2)
        .style("fill", "lightgrey").lower();

    const simulation0 = createSimulation(graph.nodes, graph.links, 'all', rate, width, height, []);
    const simulation = createSimulation(domainNodes, domainEdges, 'domain', rate, width, height, []);
    const simulation2 = createSimulation(applicationNodes, applicationEdges, 'application', rate, width, height, domainNodes);
    const simulation3 = createSimulation(infraNodes, infraEdges, 'infrastructure', rate, width, height, applicationNodes);

    const drag = d3.drag()
        .on("start", dragstart)
        .on("drag", dragged);

    node.call(drag).on("click", click);

    function tick() {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);
        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);

        domainLayer.attr("r", maxRadius(domainNodes, rate, width / 2, height / 2) - 12);
        applicationLayer.attr("r", maxRadius(applicationNodes, rate, width / 2, height / 2) - 12);
        infoLayer.attr("r", maxRadius(infraNodes, rate, width / 2, height / 2));
    }

    function click(event, d) {
        delete d.fx;
        delete d.fy;
        d3.select(this).classed("fixed", false);

        simulation.alpha(1).restart();
        simulation2.alpha(1).restart();
        simulation3.alpha(1).restart();
        simulation0.alpha(1).restart();
    }

    function dragstart() {
        d3.select(this).classed("fixed", true);
    }

    function dragged(event, d) {
        d.fx = clamp(event.x, 0, width);
        d.fy = clamp(event.y, 0, height);

        simulation.alpha(1).restart();
        simulation2.alpha(1).restart();
        simulation3.alpha(1).restart();
        simulation0.alpha(1).restart();
    }

    function clamp(x, lo, hi) {
        return x < lo ? lo : x > hi ? hi : x;
    }


    //yield svg.node();
}