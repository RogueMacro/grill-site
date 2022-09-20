import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import ErrorPage from "next/error";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Modal from "@mui/material/Modal";
import axios from "axios";

const ACCESS_TOKEN_LENGTH = 32;

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      {...other}
    >
      {value === index && <>{children}</>}
    </div>
  );
}

function ProfileMenu() {
  return <>profile settings: wip</>;
}

function AuthorizationMenu() {
  const [copied, setCopied] = useState("");
  const [copiedCount, setCopiedCount] = useState(1);
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [token, setToken] = useState(undefined);
  useEffect(() => {
    async function fetchToken() {
      if (isAuthenticated) {
        const accessToken = await getAccessTokenSilently({
          scope: "read:current_user",
        });

        const metadataResponse = await fetch(
          `https://dev-bzktuxhd.us.auth0.com/api/v2/users/${user.sub}`,
          {
            headers: {
              authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const { user_metadata } = await metadataResponse.json();

        if (user_metadata && user_metadata.access_token) {
          setToken(user_metadata.access_token);
        } else {
          setToken(null);
        }
      }
    }
    fetchToken();
  }, [user, isAuthenticated, getAccessTokenSilently]);

  async function createToken() {
    function generateAccessToken(length) {
      var result = "";
      var characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      var charactersLength = characters.length;
      for (var i = 0; i < length; i++) {
        result += characters.charAt(
          Math.floor(Math.random() * charactersLength)
        );
      }
      return result;
    }

    if (isAuthenticated) {
      const apiToken = await getAccessTokenSilently({
        scope: "create:current_user_metadata update:current_user_metadata",
      });

      const newToken =
        Buffer.from(user.sub).toString("base64") +
        "." +
        generateAccessToken(ACCESS_TOKEN_LENGTH);

      await axios.request({
        method: "PATCH",
        url: `https://dev-bzktuxhd.us.auth0.com/api/v2/users/${user.sub}`,
        headers: {
          authorization: `Bearer ${apiToken}`,
          "content-type": "application/json",
        },
        data: {
          user_metadata: { access_token: newToken },
        },
      });

      setToken(newToken);
      setCreatingToken(false);
    }
  }

  const [modalOpen, setModalOpenState] = useState(false);
  const [secret, setSecret] = useState("");
  const [confirmSecret, setConfirmSecret] = useState("");
  const [modalError, setModalError] = useState("");
  const [creatingToken, setCreatingToken] = useState(false);
  const setModalOpen = (val) => {
    if (!val) {
      setSecret("");
      setConfirmSecret("");
    }
    setModalOpenState(val);
  };

  useEffect(() => {
    if (secret !== confirmSecret) {
      setModalError("Secrets does not match");
    } else {
      setModalError("");
    }
  }, [secret, confirmSecret]);

  return (
    <>
      <Typography variant="overline" fontSize={16}>
        TOKEN
      </Typography>
      {token !== undefined && (
        <>
          <Button
            sx={{ marginLeft: "5px", display: "inline" }}
            onClick={() => setModalOpen(true)}
          >
            New
          </Button>
          <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 400,
                backgroundColor: "background.paper",
                border: "2px solid #000",
                boxShadow: 24,
                p: 4,
              }}
            >
              <Typography variant="h6">New Access Token</Typography>
              {token && (
                <Typography fontSize="small" gutterBottom>
                  (This will replace your old token)
                </Typography>
              )}

              <Box
                sx={{
                  position: "relative",
                }}
              >
                <Button
                  variant="contained"
                  fullWidth
                  onClick={async () => {
                    await createToken();
                    setModalOpen(false);
                  }}
                >
                  Create
                </Button>
                {creatingToken && (
                  <CircularProgress
                    size={24}
                    sx={{
                      color: "primary",
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      marginTop: "-12px",
                      marginLeft: "-12px",
                    }}
                  />
                )}
              </Box>
            </Box>
          </Modal>
        </>
      )}
      {token ? (
        <>
          <br />
          <Box
            sx={{ backgroundColor: "#dfdfdf", padding: "4px" }}
            display="inline"
          >
            <Typography display="inline">{token}</Typography>
            <IconButton
              onClick={() => {
                navigator.clipboard.writeText(token);
                if (copiedCount > 1) {
                  setCopied(`Copied x${copiedCount}!`);
                  setCopiedCount(copiedCount + 1);
                } else {
                  setCopied("Copied!");
                  setCopiedCount(2);
                }
              }}
            >
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Box>
        </>
      ) : (
        token === undefined && (
          <CircularProgress
            size="12px"
            thickness={6}
            sx={{ marginLeft: "10px" }}
          />
        )
      )}
      <Typography ml="10px" display="inline">
        {copied}
      </Typography>
    </>
  );
}

export default function Settings() {
  const [value, setValue] = useState(0);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return <></>;
  } else if (!isAuthenticated) {
    return <ErrorPage statusCode={401} title="Not logged in" />;
  } else {
    return (
      <Grid
        container
        width="100%"
        alignItems="center"
        direction="column"
        paddingX="20%"
        marginTop="4vh"
      >
        <Grid
          container
          marginBottom="4vh"
          sx={{
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Tabs value={value} onChange={handleChange}>
            <Tab label="Profile" />
            <Tab label="Authorization" />
          </Tabs>
        </Grid>

        <Grid container direction="column">
          <TabPanel value={value} index={0}>
            <ProfileMenu />
          </TabPanel>
          <TabPanel value={value} index={1}>
            <AuthorizationMenu />
          </TabPanel>
        </Grid>
      </Grid>
    );
  }
}
