"use client";

import React from "react";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { MonthlyComparisonItem } from "@/libraries/api/MonthlyStatisticsAPI";

// Register Chart.js components
ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend
);

interface MonthlyComparisonChartProps {
	data: MonthlyComparisonItem[];
	title?: string;
	height?: number;
}

export function MonthlyComparisonChart({
	data,
	title = "Monthly Comparison: Predicted vs Actual Dengue Cases",
	height = 300,
}: MonthlyComparisonChartProps) {
	const chartData = {
		labels: data.map((item) => item.monthName),
		datasets: [
			{
				label: "Predicted Cases",
				data: data.map((item) => item.averagePredicted),
				backgroundColor: "rgba(59, 130, 246, 0.7)", // Blue
				borderColor: "rgb(59, 130, 246)",
				borderWidth: 1,
			},
			{
				label: "Actual Cases",
				data: data.map((item) => item.averageActual),
				backgroundColor: "rgba(239, 68, 68, 0.7)", // Red
				borderColor: "rgb(239, 68, 68)",
				borderWidth: 1,
			},
		],
	};

	const options = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				position: "top" as const,
			},
			title: {
				display: !!title,
				text: title,
			},
			tooltip: {
				callbacks: {
					label: function (context: any) {
						return `${context.dataset.label}: ${context.parsed.y.toFixed(2)} cases`;
					},
				},
			},
		},
		scales: {
			y: {
				beginAtZero: true,
				title: {
					display: true,
					text: "Number of Cases",
				},
			},
			x: {
				title: {
					display: true,
					text: "Month",
				},
			},
		},
	};

	return (
		<div style={{ height: `${height}px`, width: "100%" }}>
			<Bar data={chartData} options={options} />
		</div>
	);
}

export default MonthlyComparisonChart;
