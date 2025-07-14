import PieChart from "@mui/icons-material/PieChart";
import InventoryIcon from "@mui/icons-material/Inventory";
import FilePresentIcon from "@mui/icons-material/FilePresent";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { ArrowBack } from "@mui/icons-material";
import Link from "next/link";
import { PreserveSearchParamsLink } from "@/components/preserve-search-params-link";

export const navItems = [
  {
    text: "Dashboard",
    icon: <PieChart />,
    href: "/dashboard",
    Component: PreserveSearchParamsLink,
  },
  {
    text: "Performance",
    icon: <TrendingUpIcon />,
    href: "/performance",
    Component: PreserveSearchParamsLink,
  },
  {
    text: "Assets",
    icon: <InventoryIcon />,
    href: "/assets",
    Component: PreserveSearchParamsLink,
  },
  {
    text: "Daten",
    icon: <FilePresentIcon />,
    href: "/data",
    Component: PreserveSearchParamsLink,
  },
];

export const demoNavItems = [
  {
    text: "Zurück zur Startseite",
    icon: <ArrowBack />,
    href: "/",
    Component: Link,
  },
  ...navItems,
];
