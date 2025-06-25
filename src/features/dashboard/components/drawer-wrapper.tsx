import * as React from "react";
import { styled, useTheme, Theme, CSSObject } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

import { Folder, PieChart } from "@mui/icons-material";
import {
  MobileAuthSwitch,
} from "@/features/auth/components/auth-switch";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ColorModeToggle } from "@/components/color-mode-toggle";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import { RepoButton } from "@/components/repo-button";
import { useMediaQuery } from "@mui/material";

const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  variants: [
    {
      props: ({ open }) => open,
      style: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(["width", "margin"], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      },
    },
  ],
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  variants: [
    {
      props: ({ open }) => open,
      style: {
        ...openedMixin(theme),
        "& .MuiDrawer-paper": openedMixin(theme),
      },
    },
    {
      props: ({ open }) => !open,
      style: {
        ...closedMixin(theme),
        "& .MuiDrawer-paper": closedMixin(theme),
      },
    },
  ],
}));

export default function MiniDrawer({
  children,
  navItems = [],
}: {
  children: React.ReactNode;
  navItems?: { text: string; icon: React.ReactNode; href: string }[];
}) {
  const theme = useTheme();
  const pathname = usePathname();
  const mobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => setOpen(true);
  const handleDrawerClose = () => setOpen(false);

  const drawerContent = (
    <Box
      sx={{
        width: mobile ? 240 : drawerWidth,
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <DrawerHeader>
        <IconButton onClick={handleDrawerClose}>
          {theme.direction === "rtl" ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </DrawerHeader>
      <Divider />
      <List disablePadding sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ display: "block" }}>
            <ListItemButton
              component={Link}
              href={item.href}
              selected={item.href === pathname}
              onClick={mobile ? handleDrawerClose : undefined}
              sx={{
                minHeight: 48,
                justifyContent: open ? "initial" : "center",
                px: 2.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  justifyContent: "center",
                  mr: open ? 3 : "auto",
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0 }} />
            </ListItemButton>
          </ListItem>
        ))}

        {/* Push auth switch to bottom */}
        <Box sx={{ flexGrow: 1 }} />

        <Divider />
        <ListItem disablePadding sx={{ display: "block" }}>
          <MobileAuthSwitch variant={open ? "text" : "icon"} />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100svh" }}>
      <CssBaseline />
      <AppBar
        variant="outlined"
        color="default"
        position="fixed"
        open={!mobile && open}
        sx={{
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label={open ? "close drawer" : "open drawer"}
            onClick={open ? handleDrawerClose : handleDrawerOpen}
            edge="start"
            sx={{ ...(open && !mobile ? { display: "none" } : {}) }}
          >
            {open && mobile ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
          {!mobile && <Typography variant="h6" noWrap component="div" sx={{ display: "flex", alignItems: "center", gap: 1, ml: 4 }}>
            <AnalyticsIcon fontSize="large" color="primary" />
            Flatex Dashboard
          </Typography>}
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <ColorModeToggle />
            <RepoButton />
          </Box>
        </Toolbar>
      </AppBar>

      {mobile ? (
        <MuiDrawer
          variant="temporary"
          anchor={theme.direction === "rtl" ? "right" : "left"}
          open={open}
          onClose={handleDrawerClose}
          ModalProps={{ keepMounted: true }}
        >
          {drawerContent}
        </MuiDrawer>
      ) : (
        <Drawer variant="permanent" open={open}>
          {drawerContent}
        </Drawer>
      )}

      <Box
        component="main"
        display="flex"
        flexDirection="column"
        sx={{ flexGrow: 1 }}
      >
        <DrawerHeader />
        {children}
      </Box>
    </Box>
  );
}
