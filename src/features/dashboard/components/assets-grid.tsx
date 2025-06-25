import { Grid } from "@mui/material";
import { Asset } from "../types/asset";
import { DepotItemCard } from "./depot-item-card";

export function AssetsGrid({ assets }: { assets: Asset[] }) {
  return (
    <Grid container spacing={2} p={2}>
      {assets.map((item) => (
        <Grid key={item.isin} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <DepotItemCard item={item} />
        </Grid>
      ))}
    </Grid>
  );
}
