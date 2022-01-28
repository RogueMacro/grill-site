import { useContext, useState } from "react";
import { useRouter } from "next/router";
import ErrorPage from "next/error";
import { IndexContext } from "../../components/context";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import { Button } from "@mui/material";
import { marked } from "marked";
import { renderToString } from "react-dom/server";
import { HelmetProvider, Helmet } from "react-helmet-async";
import sanitizeHtml from "sanitize-html";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// import { dark } from "react-syntax-highlighter/dist/esm/styles/prism";
import hljs from "highlight.js";

const PackageView = () => {
  const router = useRouter();
  const name = router.query.name as string;
  const index = useContext(IndexContext);
  const [readme, setReadme] = useState("loading...");

  if (!Object.keys(index).includes(name)) {
    const title = `Could not find package '${name}'`;
    return <ErrorPage statusCode={404} title={title} />;
  }

  const pkg = index[name];
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
  // readmeUrl = "https://raw.githubusercontent.com/ai/size-limit/main/README.md";

  fetch(readmeUrl)
    .then((reponse) => reponse.text())
    .then((value) => {
      setReadme(value);
    });

  marked.setOptions({
    highlight: (code, lang) => {
      // return renderToString(
      //   <SyntaxHighlighter langauge={language}>{code}</SyntaxHighlighter>
      // );
      const language = hljs.getLanguage(lang) ? lang : "plaintext";
      // console.log(hljs.highlight(code, { language }).value);
      return hljs.highlight(code, { language }).value;
    },
  });
  let dirtyReadme = marked.parse(readme);
  // dirtyReadme = dirtyReadme.replaceAll(
  //   'src="./',
  //   `src="${"https://raw.githubusercontent.com/ai/size-limit/main/"}`
  // );

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
          backgroundColor: "#F9F7F5",
          position: "sticky",
          top: "25vh",
        }}
      >
        <Grid ml="70vw">
          <Typography variant="overline">Package</Typography>
          <br />
          <Typography>{name}</Typography>
          <br />
          <Typography variant="overline">Repository</Typography>
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
          <Typography variant="overline">Versions</Typography>
          <Grid>
            <Button
              variant="contained"
              color="secondary"
              size="small"
              style={{ marginRight: "10px" }}
            >
              {latestVersion} (latest)
            </Button>
            {versions.map((key) => (
              <Button
                key={key}
                variant="contained"
                size="small"
                style={{ marginRight: "10px" }}
              >
                {key}
              </Button>
            ))}
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
          sx={{ zIndex: 1 }}
          pl="1%"
          pr="1%"
        >
          <div
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(dirtyReadme, {
                allowedTags: sanitizeHtml.defaults.allowedTags.concat([
                  "details",
                  "summary",
                ]),
              }),
            }}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default PackageView;
