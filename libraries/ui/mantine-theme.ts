import { createTheme, MantineColorsTuple } from "@mantine/core";

/**
 * Centralized Mantine theme configuration for Dengue Watch app.
 * Default: Light mode with custom primary colors.
 */

// Custom primary color based on the app's accent/teal palette
const primaryColor: MantineColorsTuple = [
  "#e6fcf5",
  "#c3fae8",
  "#96f2d7",
  "#63e6be",
  "#38d9a9",
  "#20c997",
  "#12b886",
  "#0ca678",
  "#099268",
  "#087f5b",
];

// Secondary color (purple/violet tones)
const secondaryColor: MantineColorsTuple = [
  "#f3f0ff",
  "#e5dbff",
  "#d0bfff",
  "#b197fc",
  "#9775fa",
  "#845ef7",
  "#7950f2",
  "#7048e8",
  "#6741d9",
  "#5f3dc4",
];

export const mantineTheme = createTheme({
  /** Set default color scheme to light */
  primaryColor: "teal",

  /** Font configuration */
  fontFamily: '"Noto Sans", sans-serif',
  fontFamilyMonospace: "var(--font-geist-mono), monospace",

  /** Heading styles */
  headings: {
    fontFamily: '"Noto Sans", sans-serif',
    fontWeight: "600",
  },

  /** Default radius for components */
  defaultRadius: "md",

  /** Custom colors */
  colors: {
    primary: primaryColor,
    secondary: secondaryColor,
  },

  /** Component-specific defaults */
  components: {
    Button: {
      defaultProps: {
        radius: "md",
      },
    },
    Paper: {
      defaultProps: {
        radius: "md",
        shadow: "sm",
      },
    },
    Card: {
      defaultProps: {
        radius: "md",
        shadow: "sm",
      },
    },
    ActionIcon: {
      defaultProps: {
        variant: "subtle",
      },
    },
    Select: {
      defaultProps: {
        radius: "md",
      },
    },
    TextInput: {
      defaultProps: {
        radius: "md",
      },
    },
    NumberInput: {
      defaultProps: {
        radius: "md",
      },
    },
  },
});

export default mantineTheme;
