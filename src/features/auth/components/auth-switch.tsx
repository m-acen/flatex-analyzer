"use client";

import { deleteUser, signOut, useSession } from "@/lib/auth-client";
import ProfileMenu from "./profile";
import SignIn from "./sign-in";
import AuthDialog from "./auth-dialog";
import { useState } from "react";

export function AuthSwitch() {
  const { data } = useSession();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  return (
    <>
      <AuthDialog
        open={authDialogOpen}
        onClose={() => setAuthDialogOpen(false)}
      />
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
        <SignIn onSignIn={() => setAuthDialogOpen(true)} />
      )}
    </>
  );
}

export function MobileAuthSwitch() {
  const { data } = useSession();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  return (
    <>
      <AuthDialog
        open={authDialogOpen}
        onClose={() => setAuthDialogOpen(false)}
      />
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
        <SignIn fullWidth onSignIn={() => setAuthDialogOpen(true)} />
      )}
    </>
  );
}