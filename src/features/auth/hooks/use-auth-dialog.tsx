"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import AuthDialog from "../components/auth-dialog";

type AuthDialogContextType = {
  open: (mode?: "signIn" | "signUp") => void;
  close: () => void;
};

const AuthDialogContext = createContext<AuthDialogContextType | undefined>(undefined);

export function useAuthDialog() {
  const context = useContext(AuthDialogContext);
  if (!context) {
    throw new Error("useAuthDialog must be used within an AuthDialogProvider");
  }
  return context;
}

type AuthDialogProviderProps = {
  children: ReactNode;
};

export function AuthDialogProvider({ children }: AuthDialogProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const open = (mode: "signIn" | "signUp" = "signIn") => {
    setIsSignUp(mode === "signUp");
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
  };

  return (
    <AuthDialogContext.Provider value={{ open, close }}>
      {children}
      <AuthDialog open={isOpen} onClose={close} key={isSignUp ? "signUp" : "signIn"} />
    </AuthDialogContext.Provider>
  );
}
