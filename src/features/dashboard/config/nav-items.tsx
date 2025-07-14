import PieChart from "@mui/icons-material/PieChart";
import InventoryIcon from "@mui/icons-material/Inventory";
import FilePresentIcon from "@mui/icons-material/FilePresent";
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

export const navItems = [
  { text: "Dashboard", icon: <PieChart />, href: "/dashboard" },
  { text: "Performance", icon: <TrendingUpIcon />, href: "/performance" },
  { text: "Assets", icon: <InventoryIcon />, href: "/assets" },
  { text: "Daten", icon: <FilePresentIcon />, href: "/data" },
];
