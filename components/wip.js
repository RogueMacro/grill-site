import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import EngineeringIcon from "@mui/icons-material/Engineering";

export default function WIP() {
  return (
    <Grid
      container
      alignItems="center"
      justifyContent="center"
      height="60vh"
      direction="column"
    >
      <EngineeringIcon />
      <Typography>Work In Progress</Typography>
    </Grid>
  );
}
