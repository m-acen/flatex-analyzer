"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link as MuiLink,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { signIn, signUp } from "@/lib/auth-client";
import { z } from "zod";

// Zod schema
const AuthSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AuthDialogProps = {
  open: boolean;
  onClose: () => void;
};

export default function AuthDialog({ open, onClose }: AuthDialogProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setLoading(true);

    const result = AuthSchema.safeParse({ email, password });

    if (!result.success) {
      const issues = result.error.flatten().fieldErrors;
      setFieldErrors({
        email: issues.email?.[0],
        password: issues.password?.[0],
      });
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        await signUp.email({
          name: email.split("@")[0],
          email,
          password,
          callbackURL: "/dashboard",
        });
      } else {
        await signIn.email({ email, password, callbackURL: "/dashboard" });
      }
      onClose(); // close on success
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>
        {isSignUp ? "Sign Up" : "Sign In"}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} mt={1}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            margin="normal"
            required
            error={!!fieldErrors.email}
            helperText={fieldErrors.email}
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
            error={!!fieldErrors.password}
            helperText={fieldErrors.password}
          />

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {isSignUp ? "Konto erstellen" : "Anmelden"}
          </Button>

          <Box mt={2} textAlign="center">
            <Typography variant="body2">
              {isSignUp ? "Du hast bereits ein Konto?" : "Du hast noch kein Konto?"} 
              <br />
              <MuiLink
                type="button"
                component="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setFieldErrors({});
                  setError("");
                }}
                underline="hover"
              >
                {isSignUp ? "Anmelden" : "Konto erstellen"}
              </MuiLink>
            </Typography>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
