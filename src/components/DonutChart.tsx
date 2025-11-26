import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface DonutChartProps {
    data: { name: string; value: number }[];
    width?: number;
    height?: number;
}

const DonutChart: React.FC<DonutChartProps> = ({ data, width = 400, height = 400 }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [dimensions, setDimensions] = useState({ width, height });

    // Handle resize if width/height are not fixed
    useEffect(() => {
        if (svgRef.current) {
            const { clientWidth, clientHeight } = svgRef.current.parentElement || { clientWidth: width, clientHeight: height };
            setDimensions({ width: clientWidth || width, height: clientHeight || height });
        }
    }, [width, height]);

    useEffect(() => {
        if (!data || data.length === 0 || !svgRef.current) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove(); // Clear previous render

        const { width: w, height: h } = dimensions;
        const margin = { top: 40, right: 20, bottom: 40, left: 20 };
        const innerWidth = w - margin.left - margin.right;
        const innerHeight = h - margin.top - margin.bottom;
        const radius = Math.min(innerWidth, innerHeight) / 2;

        const g = svg.append("g")
            .attr("transform", `translate(${w / 2},${h / 2})`);

        const color = d3.scaleOrdinal()
            .domain(['City', 'County'])
            .range(['#7DCBC4', '#5D2A1A']);

        const pie = d3.pie<{ name: string; value: number }>()
            .value(d => d.value)
            .sort(null); // Keep original order or sort as needed

        const arc = d3.arc<d3.PieArcDatum<{ name: string; value: number }>>()
            .innerRadius(radius * 0.6) // Donut hole
            .outerRadius(radius);

        const arcs = g.selectAll("arc")
            .data(pie(data))
            .enter()
            .append("g")
            .attr("class", "arc");

        arcs.append("path")
            .attr("d", arc)
            .attr("fill", (d) => color(d.data.name) as string)
            .attr("stroke", "#fff")
            .style("stroke-width", "2px");

        const outerArc = d3.arc<d3.PieArcDatum<{ name: string; value: number }>>()
            .innerRadius(radius * 1.1)
            .outerRadius(radius * 1.1);

        // Add polylines
        g.selectAll("polyline")
            .data(pie(data))
            .enter()
            .append("polyline")
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("fill", "none")
            .attr("points", (d) => {
                const posA = arc.centroid(d); // Line start
                const posB = outerArc.centroid(d); // Line break
                const posC = outerArc.centroid(d); // Label position
                const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                posC[0] = radius * 1.2 * (midAngle < Math.PI ? 1 : -1); // Multiply by 1 or -1 to put it on the right or left
                return [posA, posB, posC] as any;
            });

        // Add labels
        g.selectAll("text.label")
            .data(pie(data))
            .enter()
            .append("text")
            .attr("class", "label")
            .text((d) => {
                // Only show label if slice is big enough
                if (d.endAngle - d.startAngle < 0.1) return "";
                return `${d.data.name} (${d.data.value})`;
            })
            .attr("transform", (d) => {
                const pos = outerArc.centroid(d);
                const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                pos[0] = radius * 1.25 * (midAngle < Math.PI ? 1 : -1);
                return `translate(${pos})`;
            })
            .style("text-anchor", (d) => {
                const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                return midAngle < Math.PI ? "start" : "end";
            })
            .style("font-size", "12px")
            .style("font-weight", "bold")
            .style("fill", "#333");

        // Add center text (optional, e.g., total)
        const total = d3.sum(data, d => d.value);
        g.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "-0.5em")
            .style("font-size", "16px")
            .style("font-weight", "bold")
            .text("Total");

        g.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "1.0em")
            .style("font-size", "14px")
            .text(total);

    }, [data, dimensions]);

    return (
        <div className="w-full h-full flex justify-center items-center">
            <svg ref={svgRef} width={dimensions.width} height={dimensions.height} />
        </div>
    );
};

export default DonutChart;
