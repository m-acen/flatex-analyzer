"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  IconButton,
  Drawer,
  List,
  ListItem,
  Divider,
  Button,
} from "@mui/material";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import Link from "next/link";
import { RepoButton } from "./repo-button";
import { ColorModeToggle } from "./color-mode-toggle";
import { usePathname } from "next/navigation";
import { CtaButton } from "./cta-button";
import { AuthSwitch, MobileAuthSwitch } from "@/features/auth/components/auth-switch";

export function Header() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  const drawerContent = (
    <Box
      sx={{
        width: 250,
        height: "100svh", // Ensure it doesn't grow beyond the viewport
        display: "flex",
        flexDirection: "column",
      }}
      role="presentation"
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          p: 1,
        }}
      >
        <Link
          href="/"
          style={{
            gap: 2,
            textDecoration: "none",
            color: theme.palette.text.primary,
            display: "flex",
            alignItems: "center",
          }}
        >
          <AnalyticsIcon fontSize="medium" color="primary" />
          <Typography variant="body1" color="text.primary">
            Flatex Dashboard
          </Typography>
        </Link>
        <IconButton onClick={toggleDrawer(false)}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      <List
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <ListItem>
          <ColorModeToggle fullWidth />
        </ListItem>

        <Box sx={{ flexGrow: 1 }} />

        <ListItem>
          <Box
            onClick={(e) => e.stopPropagation()}
            sx={{ width: "100%" }} // ensures full width if needed
          >
            <MobileAuthSwitch />
          </Box>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box
      component="header"
      sx={{
        py: 1,
        px: 2,
        borderBottom: `1px solid ${theme.palette.divider}`,
        display: "flex",
        alignItems: "center",
      }}
    >
      <Link
        href="/"
        style={{
          gap: 2,
          textDecoration: "none",
          color: theme.palette.text.primary,
          display: "flex",
          alignItems: "center",
        }}
      >
        <AnalyticsIcon fontSize="large" color="primary" />
        <Typography variant="h6" color="text.primary">
          Flatex Dashboard
        </Typography>
      </Link>
      <Box sx={{ flexGrow: 1 }} />

      {isMobile ? (
        <>
          <IconButton
            aria-label="open drawer"
            onClick={toggleDrawer(true)}
            color="inherit"
          >
            <MenuIcon />
          </IconButton>
          <Drawer
            anchor="right"
            open={drawerOpen}
            onClose={toggleDrawer(false)}
          >
            {drawerContent}
          </Drawer>
        </>
      ) : (
        <Box sx={{ display: "flex", gap: 2 }}>
          <ColorModeToggle />
          {pathname !== "/dashboard" && <CtaButton />}
          <AuthSwitch />
        </Box>
      )}
    </Box>
  );
}
