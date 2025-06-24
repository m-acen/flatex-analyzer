"use client";

import { Button } from "@mui/material";

interface Props extends React.ComponentProps<typeof Button> {
  onSignIn: () => void;
}

const SignIn = ({ onSignIn, ...props }: Props) => {
  return (
    <Button
      {...props}
      variant="outlined"
      color="primary"
      onClick={onSignIn}
      size="large"
    >
      Anmelden
    </Button>
  );
};

export default SignIn;
