import { useState, useEffect, useContext } from "react";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import { IndexContext } from "../components/context";
import PackageItem from "../components/packageItem";

export default function PackageSearch() {
  const [searched, setSearched] = useState({});

  const index = useContext(IndexContext);
  const requestSearch = (searchedVal: string) => {
    var filtered = {};
    for (let key in index) {
      if (key.startsWith(searchedVal)) filtered[key] = index[key];
    }
    setSearched(filtered);
  };

  useEffect(() => {
    requestSearch("");
  });

  return (
    <>
      <Grid
        container
        spacing={0}
        direction="column"
        alignItems="center"
        justifyContent="top"
        paddingTop="10%"
      >
        <TextField
          label="Search..."
          style={{ width: "90%", maxWidth: "1000px", marginBottom: "20px" }}
          onChange={(event) => requestSearch(event.target.value)}
        />
        <Stack spacing={3} style={{ width: "90%", maxWidth: "1000px" }}>
          {Object.keys(searched).map((key) => {
            return PackageItem(key, index[key]);
          })}
        </Stack>
      </Grid>
    </>
  );
}
