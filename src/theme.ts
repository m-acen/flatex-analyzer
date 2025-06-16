"use client";
import { blue, orange } from "@mui/material/colors";
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
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
