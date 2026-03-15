"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import { HeatmapBarangayData } from "@/models/HeatmapBarangayData";
import { useMantineColorScheme } from "@mantine/core";

// Risk level color config per theme
const RISK_COLORS = {
  light: {
    Critical: "#e03131",
    High: "#f76707",
    Medium: "#fcc419",
    Low: "#51cf66",
  },
  dark: {
    Critical: "#ff6b6b",
    High: "#ff922b",
    Medium: "#ffd43b",
    Low: "#69db7c",
  },
} as const;

// Heatmap gradient per theme
const HEAT_GRADIENT = {
  light: {
    0.0: "#e6fcf5",
    0.2: "#51cf66",
    0.4: "#fcc419",
    0.6: "#f76707",
    0.8: "#e03131",
    1.0: "#c92a2a",
  },
  dark: {
    0.0: "#0ca678",
    0.2: "#69db7c",
    0.4: "#ffd43b",
    0.6: "#ff922b",
    0.8: "#ff6b6b",
    1.0: "#f03e3e",
  },
} as const;

// Light map tiles
const LIGHT_TILE_URL =
  process.env.NEXT_PUBLIC_OSM_TILE_URL ||
  "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

// Dark map tiles (CartoDB dark matter for dark mode)
const DARK_TILE_URL =
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

const ATTRIBUTION =
  process.env.NEXT_PUBLIC_OSM_ATTRIBUTION ||
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const DEFAULT_CENTER: [number, number] = [
  parseFloat(process.env.NEXT_PUBLIC_MAP_DEFAULT_LAT || "7.369"),
  parseFloat(process.env.NEXT_PUBLIC_MAP_DEFAULT_LNG || "122.121"),
];

const DEFAULT_ZOOM = parseInt(
  process.env.NEXT_PUBLIC_MAP_DEFAULT_ZOOM || "9",
  10
);

type DengueHeatmapProps = {
  data: HeatmapBarangayData[];
  height?: number | string;
};

export default function DengueHeatmap({
  data,
  height = 500,
}: DengueHeatmapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const heatLayerRef = useRef<L.HeatLayer | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);
  const { colorScheme } = useMantineColorScheme();

  const theme = colorScheme === "dark" ? "dark" : "light";
  const riskColors = RISK_COLORS[theme];
  const gradient = HEAT_GRADIENT[theme];

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    const tileUrl = theme === "dark" ? DARK_TILE_URL : LIGHT_TILE_URL;
    const tileLayer = L.tileLayer(tileUrl, {
      attribution: ATTRIBUTION,
      maxZoom: 18,
    }).addTo(map);

    tileLayerRef.current = tileLayer;
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      tileLayerRef.current = null;
      heatLayerRef.current = null;
      markersRef.current = [];
    };
  }, []);

  // Update tile layer on theme change
  useEffect(() => {
    if (!mapRef.current || !tileLayerRef.current) return;

    const tileUrl = theme === "dark" ? DARK_TILE_URL : LIGHT_TILE_URL;
    tileLayerRef.current.setUrl(tileUrl);
  }, [theme]);

  // Update heatmap data and markers
  useEffect(() => {
    if (!mapRef.current || !data || data.length === 0) return;

    const map = mapRef.current;

    // Remove old heat layer
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
    }

    // Remove old markers
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    // Get max cases for intensity normalization
    const maxCases = Math.max(...data.map((d) => d.currentYearCases), 1);

    // Build heat points: [lat, lng, intensity]
    const heatPoints: [number, number, number][] = data.map((d) => [
      d.latitude,
      d.longitude,
      d.currentYearCases / maxCases,
    ]);

    // Create heat layer
    const heatLayer = L.heatLayer(heatPoints, {
      radius: 30,
      blur: 20,
      maxZoom: 15,
      max: 1.0,
      minOpacity: 0.3,
      gradient: gradient,
    });

    heatLayer.addTo(map);
    heatLayerRef.current = heatLayer;

    // Add circle markers with tooltips for each barangay
    const newMarkers: L.CircleMarker[] = [];
    data.forEach((d) => {
      const color = riskColors[d.riskLevel];
      const marker = L.circleMarker([d.latitude, d.longitude], {
        radius: 6,
        fillColor: color,
        color: theme === "dark" ? "#dee2e6" : "#495057",
        weight: 1,
        opacity: 0.8,
        fillOpacity: 0.9,
      });

      marker.bindTooltip(
        `<div style="font-family: 'Noto Sans', sans-serif; font-size: 12px;">
          <strong>${d.barangayName}</strong><br/>
          <span style="color: ${color}; font-weight: 600;">● ${d.riskLevel} Risk</span><br/>
          Cases (Year): <strong>${d.currentYearCases}</strong><br/>
          Total Cases: <strong>${d.totalCases}</strong>
        </div>`,
        {
          direction: "top",
          offset: [0, -8],
        }
      );

      marker.addTo(map);
      newMarkers.push(marker);
    });

    markersRef.current = newMarkers;

    // Fit bounds to data points if we have any
    if (heatPoints.length > 0) {
      const bounds = L.latLngBounds(
        heatPoints.map((p) => [p[0], p[1]] as [number, number])
      );
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
    }
  }, [data, theme, gradient, riskColors]);

  return (
    <div
      ref={mapContainerRef}
      style={{
        height: typeof height === "number" ? `${height}px` : height,
        width: "100%",
        borderRadius: "var(--mantine-radius-md)",
        overflow: "hidden",
        zIndex: 0,
      }}
    />
  );
}
