'use client';

import { Button } from "@mui/material";

type Props = {
  onSignIn: () => Promise<void>;
};

const SignIn = ({ onSignIn }: Props) => {
  return (
    <Button
      variant="outlined"
      color="secondary"
      onClick={onSignIn}
      size="large"
    >
      Anmelden
    </Button>
  );
};

export default SignIn;