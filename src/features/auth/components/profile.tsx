import React, { useState } from "react";
import {
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  Button,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import DeleteIcon from "@mui/icons-material/Delete";
import theme from "@/theme";

type ProfileMenuProps = {
  username: string;
  onLogout: () => Promise<void>;
  onDeleteAccount: () => Promise<void>;
  variant?: "icon" | "text";
};

const ProfileMenu: React.FC<ProfileMenuProps> = ({
  username,
  onLogout,
  onDeleteAccount,
  variant = "icon",
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const getInitial = (name: string) => name?.charAt(0).toUpperCase() || "?";

  const color = theme.palette.primary.main;

  return (
    <>
      <Button onClick={handleClick} size="small" fullWidth={variant === "text"} sx={{ display: "flex", alignItems: "center", justifyContent: "flex-start" }}>
        <Avatar sx={{ bgcolor: color, width: 32, height: 32 }}>
          {getInitial(username)}
        </Avatar>
        {
          variant === "text" ? (
            <span style={{ marginLeft: 8, color: theme.palette.text.primary }}>
              {username}
            </span>
          ) : null
        }
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        slotProps={{
          paper: {
            elevation: 4,
            sx: {
              mt: 1.5,
              minWidth: 180,
              overflow: "visible",
              filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.15))",
              "&:before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: "background.paper",
                transform: "translateY(-50%) rotate(45deg)",
                zIndex: 0,
              },
            },
          },
        }}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem
          onClick={async () => {
            await onDeleteAccount();
          }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          Konto l&ouml;schen
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={async () => {
            await onLogout();
          }}
        >
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Abmelden
        </MenuItem>
      </Menu>
    </>
  );
};

export default ProfileMenu;
