"use client";
import { blue, orange } from "@mui/material/colors";
import { createTheme } from "@mui/material/styles";

const softShadow = '0px 4px 12px rgba(0, 0, 0, 0.1)'; // soft, diffused shadow

const theme = createTheme({
  shape: {
    borderRadius: 8, // or any value you like
  },
  // @ts-ignore
  shadows: [
    'none',              // shadows[0]
    softShadow,          // shadows[1]
    softShadow,          // shadows[2]
    softShadow,          // shadows[3]
    ...Array(21).fill(softShadow), // fill remaining shadows with softShadow
  ],
  colorSchemes: {
    light: {
      palette: {
        mode: "light",
        primary: { main: orange[800] },
        secondary: { main: blue[600] },
      },
    },
    dark: {
      palette: {
        mode: "dark",
        primary: { main: orange[400] },
        secondary: { main: blue[300] },
      },
    },
  },
  typography: {
    fontFamily: "var(--font-roboto)",
  },
});

export default theme;
