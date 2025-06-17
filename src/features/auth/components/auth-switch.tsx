"use client";

import { deleteUser, signOut, useSession } from "@/lib/auth-client";
import ProfileMenu from "./profile";
import SignIn from "./sign-in";
import AuthDialog from "./auth-dialog";
import { useState } from "react";
import { useAuthDialog } from "../hooks/use-auth-dialog";
import { IconButton, Avatar } from "@mui/material";
import { text } from "stream/consumers";
import { Person } from "@mui/icons-material";

export function AuthSwitch() {
  const { data } = useSession();
  const { open } = useAuthDialog();
  return (
    <>
      {data !== null ? (
        <ProfileMenu
          username={data?.user.name}
          onLogout={async () => {
            await signOut();
          }}
          onDeleteAccount={async () => {
            if (
              confirm("Bist du sicher, dass du dein Konto löschen möchtest?")
            ) {
              await deleteUser();
            }
          }}
        />
      ) : (
        <SignIn onSignIn={open} />
      )}
    </>
  );
}

export function MobileAuthSwitch({ variant }: { variant?: "icon" | "text" }) {
  const { data } = useSession();
  const { open } = useAuthDialog();
  return (
    <>
      {data !== null ? (
        <ProfileMenu
          variant={variant}
          username={data?.user.name}
          onLogout={async () => {
            await signOut();
          }}
          onDeleteAccount={async () => {
            if (
              confirm("Bist du sicher, dass du dein Konto löschen möchtest?")
            ) {
              await deleteUser();
            }
          }}
        />
      ) : variant === "text" ? (
        <SignIn fullWidth onSignIn={open} />
      ) : (
        <IconButton onClick={() => open()} size="small">
          <Avatar sx={{ width: 32, height: 32 }}>
            <Person sx={{ fontSize: 20 }} />
          </Avatar>
        </IconButton>
      )}
    </>
  );
}
