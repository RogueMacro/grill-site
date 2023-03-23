import { useContext, useState, useEffect } from "react";
import { useRouter } from "next/router";
import ErrorPage from "next/error";
import { IndexContext } from "../../components/context";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Popover from "@mui/material/Popover";
import { marked } from "marked";
import { HelmetProvider, Helmet } from "react-helmet-async";
import sanitizeHtml from "sanitize-html";
import copy from "clipboard-copy";
import { PublicUser } from "../../lib/users";
import Link from "@mui/material/Link";
import LinearProgress from "@mui/material/LinearProgress";
import "highlight.js/styles/github.css";
import { toHtml } from "hast-util-to-html";
import {
  createStarryNight,
  all as starryLanguages,
} from "@wooorm/starry-night";
import { useTheme } from "@mui/styles";
import Box from "@mui/material/Box";

const PackageView = () => {
  const theme = useTheme();

  const router = useRouter();
  const [name, setName] = useState(null);
  useEffect(() => {
    if (router.isReady) {
      const pkgName = router.query.name as string;
      setName(pkgName);
    }
  }, [router.isReady, router.query.name]);

  const index = useContext(IndexContext);
  const [readme, setReadme] = useState("loading...");
  const [starryNight, setStarryNight] = useState(undefined);
  const [author, setAuthor] = useState<PublicUser>(null);
  const [error, setError] = useState(null);

  const [copiedPopupAnchorEl, setCopiedPopupAnchorEl] = useState(null);
  const copiedPopupOpen = Boolean(copiedPopupAnchorEl);

  useEffect(() => {
    if (!name) {
      return;
    }

    if (!index.find(name)) {
      setError({ status: 404, message: `Could not find package '${name}'` });
      return;
    }

    fetch(`/api/author/${name}`).then(async (response) => {
      if (response.status !== 200) {
        setError({ status: response.status, message: response.statusText });
        return;
      }
      let user = await response.json();
      setAuthor(user);
    });
  }, [name, index]);

  useEffect(() => {
    async function getStarryNight() {
      setStarryNight(await createStarryNight(starryLanguages));
    }

    if (starryNight === undefined) getStarryNight();
  });

  useEffect(() => {
    if (!starryNight) return;

    marked.setOptions({
      highlight: (code, lang) => {
        let scope = starryNight.flagToScope(lang);
        if (scope !== undefined) {
          const tree = starryNight.highlight(code, scope);
          return toHtml(tree);
        }

        return code;
      },
    });
  }, [readme, starryNight]);

  if (error) {
    return <ErrorPage statusCode={error.status} title={error.message} />;
  }

  if (!author) {
    return <LinearProgress />;
  }

  const pkg = index.find(name);
  const description = pkg.description;
  const versions = Object.keys(pkg.versions).sort().reverse();
  const latestVersion = versions.at(0);
  const latestRev = pkg.versions[latestVersion].rev;
  versions.shift();

  if (!pkg.url.endsWith("/")) pkg.url += "/";
  var readmeUrl = pkg.url;
  readmeUrl = readmeUrl.replace(".git", "");
  readmeUrl = readmeUrl.replace(
    "https://github.com",
    "https://raw.githubusercontent.com"
  );
  readmeUrl += `${latestRev}/README.md`;

  fetch(readmeUrl)
    .then((response) => {
      if (response.status === 404) {
        return "This package has no README.";
      } else {
        return response.text();
      }
    })
    .then((value) => {
      setReadme(value);
    });

  let dirtyReadme = marked.parse(readme);

  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title>Grill - Beef Package Manager</title>
        </Helmet>
      </HelmetProvider>
      <Grid
        item
        sx={{
          width: "100vw%",
          height: "50vh",
          padding: "20px",
          backgroundColor: theme.palette.background.package,
          position: "sticky",
          top: "25vh",
        }}
      >
        <Grid ml="70vw">
          <Grid container spacing="10vw">
            <Grid item>
              <Typography variant="overline" sx={{ opacity: 0.6 }}>
                Package
              </Typography>
              <br />
              <Typography>{name}</Typography>
            </Grid>
            <Grid item>
              <Typography variant="overline" sx={{ opacity: 0.6 }}>
                Author
              </Typography>
              <br />
              <Link
                underline="hover"
                color="inherit"
                href={`${window.location.origin}/user/${author.username}`}
              >
                {author.username}
              </Link>
            </Grid>
          </Grid>

          <br />
          <Typography variant="overline" sx={{ opacity: 0.6 }}>
            Description
          </Typography>
          <br />
          <Typography>{description}</Typography>
          <br />
          <Typography variant="overline" sx={{ opacity: 0.6 }}>
            Repository
          </Typography>
          <br />
          <Button
            variant="outlined"
            size="small"
            href={pkg.url}
            sx={{ textTransform: "none", pointerEvents: "all" }}
          >
            {pkg.url}
          </Button>
          <br />
          <br />
          <Typography variant="overline" sx={{ opacity: 0.6 }}>
            Versions
          </Typography>
          <Grid>
            <Button
              variant="contained"
              color="secondary"
              size="small"
              style={{ marginRight: "10px" }}
              onClick={(event) => {
                copy(name + ' = "' + latestVersion + '"');
                setCopiedPopupAnchorEl(event.currentTarget);
                setTimeout(() => setCopiedPopupAnchorEl(null), 1500);
              }}
            >
              {latestVersion} (latest)
            </Button>

            {versions.map((key) => (
              <Button
                key={key}
                // variant="outlined"
                variant="contained"
                sx={{ color: "white" }}
                size="small"
                style={{ marginRight: "10px" }}
                onClick={(event) => {
                  copy(name + ' = "' + key + '"');
                  setCopiedPopupAnchorEl(event.currentTarget);
                  setTimeout(() => setCopiedPopupAnchorEl(null), 1500);
                }}
              >
                {key}
              </Button>
            ))}

            <Popover
              open={copiedPopupOpen}
              anchorEl={copiedPopupAnchorEl}
              onClose={() => setCopiedPopupAnchorEl(null)}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "center",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "center",
              }}
            >
              <Typography sx={{ px: 1 }}>Copied!</Typography>
            </Popover>
          </Grid>
        </Grid>
      </Grid>
      <Grid
        container
        direction="column"
        alignItems="center"
        sx={{ marginTop: "-50vh", marginBottom: "5vh" }}
      >
        <Grid
          item
          component={Card}
          elevation={4}
          mt="30px"
          width="40%"
          minHeight="80vh"
          sx={{ zIndex: 1, backgroundImage: "none" }}
          pl="1%"
          pr="1%"
        >
          <Box
            sx={{ fontFamily: "Hubot" }}
            className="readme"
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(dirtyReadme, {
                allowedTags: sanitizeHtml.defaults.allowedTags.concat([
                  "details",
                  "summary",
                ]),
                allowedAttributes: { span: ["class"] },
              }),
            }}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default PackageView;
