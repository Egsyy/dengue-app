// "use client";
// import React, { useEffect, useRef } from "react";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   BarElement,
//   ArcElement,
//   Title,
//   Tooltip,
//   Legend,
//   ChartOptions,
//   ChartType,
// } from "chart.js";
// import { Chart } from "react-chartjs-2";
// import { cn } from "@library-ui/CnExtension";
// import { TransformToWeeklyBarChart } from "@library-serializer/WeeklyProbabilityBarChart";
// // Register Chart.js components
// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   BarElement,
//   ArcElement,
//   Title,
//   Tooltip,
//   Legend
// );

// interface ChartComponentProps {
//   type: ChartType;
//   data: any;
//   options?: ChartOptions;
//   className?: string;
//   height?: number;
// }

// const ChartComponent = ({
//   type,
//   data,
//   options,
//   className = "",
//   height = 300,
// }: ChartComponentProps) => {
//   const chartRef = useRef<ChartJS>(null);

//   const defaultOptions: ChartOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: {
//         position: "top" as const,
//       },
//       title: {
//         display: false,
//       },
//     },
//     ...options,
//   };

//   return (
//     <div className={cn("w-full", className)} style={{ height: `${height}px` }}>
//       <Chart ref={chartRef} type={type} data={data} options={defaultOptions} />
//     </div>
//   );
// };

// export default ChartComponent;

"use client";
import React, { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartType,
  Plugin,
} from "chart.js";
import { Chart } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface ChartComponentProps {
  type: ChartType;
  data: any;
  options?: any; // Changed to any to accept plugins array
  plugins?: Plugin[];
  className?: string;
  height?: number;
}

const ChartComponent = ({
  type,
  data,
  options,
  plugins = [],
  className = "",
  height = 300,
}: ChartComponentProps) => {
  const chartRef = useRef<ChartJS>(null);

  const defaultOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: false,
      },
    },
    ...options,
  };

  return (
    <div className={`w-full ${className}`} style={{ height: `${height}px` }}>
      <Chart
        ref={chartRef}
        type={type}
        data={data}
        options={defaultOptions}
        plugins={plugins}
      />
    </div>
  );
};

export default ChartComponent;
