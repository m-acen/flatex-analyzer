"use client";

import { deleteUser, signOut, useSession } from "@/lib/auth-client";
import ProfileMenu from "./profile";
import SignIn from "./sign-in";
import AuthDialog from "./auth-dialog";
import { useState } from "react";
import { useAuthDialog } from "../hooks/use-auth-dialog";

export function AuthSwitch() {
  const { data } = useSession();
  const {open} = useAuthDialog();
  return (
    <>
      {data !== null ? (
        <ProfileMenu
          username={data?.user.name}
          onLogout={async () => {
            await signOut();
          }}
          onDeleteAccount={async () => {
            if (confirm("Bist du sicher, dass du dein Konto löschen möchtest?")) {
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

export function MobileAuthSwitch() {
  const { data } = useSession();
  const {open} = useAuthDialog();
  return (
    <>
      {data !== null ? (
        <ProfileMenu
          username={data?.user.name}
          onLogout={async () => {
            await signOut();
          }}
          onDeleteAccount={async () => {
            if (confirm("Bist du sicher, dass du dein Konto löschen möchtest?")) {
              await deleteUser();
            }
          }}
        />
      ) : (
        <SignIn fullWidth onSignIn={open} />
      )}
    </>
  );
}