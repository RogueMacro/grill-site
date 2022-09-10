import { useState, useEffect, useContext, useCallback, useMemo } from "react";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import { IndexContext } from "../components/context";
import PackageItem from "../components/packageItem";
import Fuse from "fuse.js";

export default function PackageSearch() {
  const [searched, setSearched] = useState({});

  const index = useContext(IndexContext);

  const fuse = useMemo(() => {
    var searchIndex = [];
    for (let key in index) {
      searchIndex.push({
        title: key,
        description: index[key].description,
      });
    }
    return new Fuse(searchIndex, {
      keys: ["title", "description"],
      shouldSort: true,
    });
  }, [index]);

  const requestSearch = useCallback(
    (searchedVal: string) => {
      if (searchedVal == "") searchedVal = " ";
      const results = fuse.search(searchedVal);
      setSearched(results);
    },
    [fuse]
  );

  useEffect(() => {
    requestSearch(" ");
  }, [requestSearch]);

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
          {Object.values(searched).map((i: any) => {
            return PackageItem(i.item.title, index[i.item.title]);
          })}
        </Stack>
      </Grid>
    </>
  );
}
