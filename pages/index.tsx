import { useState, useEffect, useContext, useCallback, useMemo } from "react";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import { IndexContext } from "../components/context";
import PackageItem from "../components/packageItem";
import Fuse from "fuse.js";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import useTheme from "@mui/styles/useTheme";

export default function PackageSearch() {
  const isDarkTheme = useTheme().palette.mode === "dark";
  const [searched, setSearched] = useState({});
  const index = useContext(IndexContext);

  const fuse = useMemo(() => {
    var searchIndex = [];
    for (let key in index.packages) {
      searchIndex.push({
        title: key,
        description: index.packages[key].description,
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

  const sideBarWidth = "50vw";
  const [newlyPublishedCount, setNewlyPublishedCount] = useState(5);

  return (
    <>
      <Typography textAlign="center" paddingTop="5vh" variant="h2">
        All Packages
      </Typography>
      <Box display="flex">
        <Box width={sideBarWidth}></Box>
        <Grid
          container
          spacing={0}
          direction="column"
          alignItems="center"
          justifyContent="top"
          paddingTop="5vh"
          marginBottom="5vh"
        >
          <TextField
            label="Search..."
            sx={{
              width: "100%",
              marginBottom: "20px",
              backgroundColor: isDarkTheme ? "" : "white",
            }}
            onChange={(event) => requestSearch(event.target.value)}
          />
          <Stack spacing={2} style={{ width: "100%" }}>
            {Object.values(searched).map((i: any) => {
              return PackageItem(i.item.title, index.packages[i.item.title]);
            })}
          </Stack>
        </Grid>

        <Grid
          container
          width={sideBarWidth}
          spacing={0}
          direction="column"
          alignItems="center"
          justifyContent="top"
        >
          {/* <Typography variant="h4" marginBottom="6px">
            Newly published
          </Typography>
          <Stack width="80%" spacing={1}>
            {Object.entries(index.packages)
              .reverse()
              .filter((_, i) => i < newlyPublishedCount)
              .map(([pkg, data]) => {
                return PackageItem(pkg, data);
              })}
          </Stack>
          {Object.entries(index.packages).length > newlyPublishedCount ? (
            <>
              <br />
              <Button
                onClick={() => setNewlyPublishedCount(newlyPublishedCount + 5)}
              >
                Show More
              </Button>
            </>
          ) : (
            <></>
          )} */}
        </Grid>
      </Box>
    </>
  );
}
