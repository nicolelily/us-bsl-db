import React, { useEffect, useRef } from 'react';
import * as Plot from "@observablehq/plot";
import { cn } from "@/lib/utils";
import { chartTheme } from '@/lib/chart-theme';
import { useTheme } from 'next-themes';

export interface ObservableChartProps {
  options: Plot.PlotOptions;
  data: any[];
  className?: string;
  width?: number;
  height?: number;
}

export const ObservableChart: React.FC<ObservableChartProps> = ({
  options,
  data,
  className,
  width = 640,
  height = 400,
}) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create the plot
    const chart = Plot.plot({
      ...options,
      width,
      height,
      document: containerRef.current.ownerDocument,
    });

    // Append it to the container
    containerRef.current.append(chart);

    // Cleanup
    return () => chart.remove();
  }, [options, data, width, height]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex justify-center items-center",
        isDarkMode ? "text-white [&_svg]:text-white" : "text-gray-900 [&_svg]:text-gray-900",
        className
      )}
      style={{
        '--chart-primary': chartTheme.colors.primary,
        '--chart-secondary': chartTheme.colors.secondary,
        '--chart-accent': chartTheme.colors.accent,
      } as React.CSSProperties}
    />
  );
};

export default ObservableChart;