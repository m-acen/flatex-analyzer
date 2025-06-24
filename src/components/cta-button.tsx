import { ArrowForward } from "@mui/icons-material";
import { Button } from "@mui/material";
import Link from "next/link";

export function CtaButton() {
  return (
    <Button
      href="/dashboard"
      variant="contained"
      size="large"
      color="primary"
      LinkComponent={Link}
      endIcon={<ArrowForward fontSize="small" />}
    >
      Dashboard
    </Button>
  );
}
