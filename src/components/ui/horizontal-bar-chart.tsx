import React from 'react';
import * as Plot from "@observablehq/plot";
import { ObservableChart, ObservableChartProps } from './observable-chart';
import { chartTheme, getChartStyle } from '@/lib/chart-theme';
import { useTheme } from 'next-themes';

interface HorizontalBarChartProps extends Omit<ObservableChartProps, 'options'> {
  data: Array<{ name: string; value: number }>;
  color?: string;
  margin?: Partial<{ top: number; right: number; bottom: number; left: number }>;
}

export const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({
  data,
  color = chartTheme.colors.primary,
  margin = { ...chartTheme.chart.margins.default, right: 60 }, // Increased right margin for labels
  ...props
}) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const options: Plot.PlotOptions = {
    x: { 
      label: "Number of Municipalities",
      tickSize: chartTheme.chart.axis.tickSize,
      tickPadding: chartTheme.chart.axis.tickPadding,
    },
    y: { 
      label: null,
      domain: data.map(d => d.name),
      padding: 0.2
    },
    color: {
      range: [color]
    },
    marginTop: margin.top,
    marginRight: margin.right,
    marginBottom: 40, // Increased bottom margin to accommodate label
    marginLeft: margin.left,
    marks: [
      Plot.barX(data, {
        y: "name",
        x: "value",
        fill: color,
        title: d => `${d.name}: ${d.value}`,
        stroke: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
        strokeWidth: 1
      }),
      Plot.text(data, {
        y: "name",
        x: "value",
        text: d => d.value.toString(),
        dx: 8, // Offset from the end of the bar
        fill: isDarkMode ? chartTheme.colors.text.dark : chartTheme.colors.text.light,
        fontSize: 12,
        fontWeight: "500",
        textAnchor: "start"
      }),
      Plot.ruleY(data, {
        y: "name",
        strokeOpacity: isDarkMode ? 0.2 : 0.1,
        stroke: isDarkMode ? chartTheme.colors.axis.dark : chartTheme.colors.axis.light
      })
    ]
  };

  return <ObservableChart options={options} data={data} {...props} />;
};

export default HorizontalBarChart;