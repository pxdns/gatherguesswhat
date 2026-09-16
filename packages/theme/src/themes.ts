export interface NexaTheme {
  id: string;
  name: string;
  appearance: "light" | "dark";
  colors: {
    background: string;
    surface: string;
    textPrimary: string;
    textSecondary: string;
    textTertiary: string;
    accent: string;
    danger: string;
    success: string;
    warning: string;
    border: string;
  };
  glass: {
    tint: string;
    opacity: number;
    blur: number;
    saturation: number;
    brightness: number;
    borderOpacity: number;
    highlightOpacity: number;
  };
}

export const lightTheme: NexaTheme = {
  id: "light",
  name: "Light",
  appearance: "light",
  colors: {
    background: "#ffffff",
    surface: "#f8f8f8",
    textPrimary: "#1a1a1a",
    textSecondary: "#666666",
    textTertiary: "#999999",
    accent: "#0066ff",
    danger: "#ff3333",
    success: "#00aa33",
    warning: "#ffaa00",
    border: "#e0e0e0",
  },
  glass: {
    tint: "#ffffff",
    opacity: 0.8,
    blur: 10,
    saturation: 1,
    brightness: 1,
    borderOpacity: 0.2,
    highlightOpacity: 0.1,
  },
};

export const darkTheme: NexaTheme = {
  id: "dark",
  name: "Dark",
  appearance: "dark",
  colors: {
    background: "#0a0a0a",
    surface: "#1a1a1a",
    textPrimary: "#ffffff",
    textSecondary: "#a0a0a0",
    textTertiary: "#707070",
    accent: "#3399ff",
    danger: "#ff5555",
    success: "#33dd33",
    warning: "#ffcc00",
    border: "#333333",
  },
  glass: {
    tint: "#1a1a1a",
    opacity: 0.75,
    blur: 20,
    saturation: 0.9,
    brightness: 1.1,
    borderOpacity: 0.15,
    highlightOpacity: 0.08,
  },
};

export const themes: Record<string, NexaTheme> = {
  light: lightTheme,
  dark: darkTheme,
};
