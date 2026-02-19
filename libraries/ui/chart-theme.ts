// lib/chart-theme.ts or components/ui/chart-theme.ts

export function getChartColors() {
  if (typeof window === "undefined") {
    // Return default colors for SSR based on your pastel theme
    return {
      primary: "rgba(167, 139, 250, 0.7)",
      secondary: "rgba(244, 114, 182, 0.7)",
      accent: "rgba(134, 239, 172, 0.7)",
      neutral: "rgba(38, 38, 38, 0.7)",
      success: "rgba(134, 239, 172, 0.7)",
      warning: "rgba(251, 191, 36, 0.7)",
      error: "rgba(248, 113, 113, 0.7)",
      info: "rgba(96, 165, 250, 0.7)",
      // Additional colors needed for charts
      base300: "rgba(209, 213, 219, 0.7)",
      foreground: "rgba(31, 41, 55, 0.7)",
    };
  }

  // Get computed styles from the root element
  const root = document.documentElement;
  const styles = getComputedStyle(root);

  // Helper to convert OKLCH CSS variable to RGBA
  // const oklchToRgba = (cssVar: string, opacity: number = 0.7) => {
  //   const oklchValue = styles.getPropertyValue(cssVar).trim();

  //   if (!oklchValue) {
  //     console.warn(`CSS variable ${cssVar} not found`);
  //     return `rgba(96, 165, 250, ${opacity})`;
  //   }

  //   console.log(`${cssVar} value:`, oklchValue); // Debug log

  //   // Parse OKLCH values manually
  //   // Format: oklch(L% C H) or just "L% C H"
  //   const match = oklchValue.match(/oklch\(([\d.]+%?)\s+([\d.]+)\s+([\d.]+)\)/);

  //   if (!match) {
  //     // Try without oklch() wrapper
  //     const parts = oklchValue.split(/\s+/);
  //     if (parts.length >= 3) {
  //       return convertOklchToRgba(parts[0], parts[1], parts[2], opacity);
  //     }
  //     return `rgba(96, 165, 250, ${opacity})`;
  //   }

  //   return convertOklchToRgba(match[1], match[2], match[3], opacity);
  // };

  const oklchToRgba = (cssVar: string, opacity = 0.7) => {
    const val = styles.getPropertyValue(cssVar).trim();
    if (!val) return `rgba(96,165,250,${opacity})`;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return `rgba(96,165,250,${opacity})`;

    // Let browser parse lab(), oklch(), rgb(), etc.
    ctx.fillStyle = val;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;

    return `rgba(${r},${g},${b},${opacity})`;
  };

  // Manual OKLCH to RGB conversion
  function convertOklchToRgba(
    l: string,
    c: string,
    h: string,
    opacity: number
  ): string {
    // Remove % from lightness if present
    const L = parseFloat(l.replace("%", "")) / 100;
    const C = parseFloat(c);
    const H = parseFloat(h);

    // OKLCH to RGB conversion (simplified)
    // Using standard canvas for accurate conversion
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext("2d");

    if (!ctx) return `rgba(96, 165, 250, ${opacity})`;

    // Let the browser do the conversion
    ctx.fillStyle = `oklch(${l} ${c} ${h})`;
    ctx.fillRect(0, 0, 1, 1);
    const imageData = ctx.getImageData(0, 0, 1, 1);
    const [r, g, b] = imageData.data;

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  return {
    primary: oklchToRgba("--color-primary"),
    secondary: oklchToRgba("--color-secondary"),
    accent: oklchToRgba("--color-accent"),
    neutral: oklchToRgba("--color-neutral"),
    success: oklchToRgba("--color-success"),
    warning: oklchToRgba("--color-warning"),
    error: oklchToRgba("--color-error"),
    info: oklchToRgba("--color-info"),
    // Additional colors needed for charts
    base300: oklchToRgba("--color-base-300"),
    foreground: oklchToRgba("--color-foreground"),
  };
}
