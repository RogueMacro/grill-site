import Image from "next/image";
import Link from "next/link";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import CssBaseline from "@mui/material/CssBaseline";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import LocalShipping from "@mui/icons-material/LocalShipping";
import Logout from "@mui/icons-material/Logout";
import Settings from "@mui/icons-material/Settings";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { IndexContext } from "../components/context";
import { useEffect, useState } from "react";
import { HelmetProvider, Helmet } from "react-helmet-async";
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { useRouter } from "next/router";
import { getIndex } from "../lib/index";

const theme = createTheme({
  typography: {
    fontFamily: `"SFMono-Regular", "Consolas", "Liberation Mono", "Menlo", "Monospace"`,
    fontSize: 14,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
  },
});

function NavBar() {
  const { loginWithPopup, logout, user, isAuthenticated, isLoading } =
    useAuth0();

  const [username, setUsername] = useState("...");
  useEffect(() => {
    if (isAuthenticated && user) {
      const fetchUsername = async () => {
        const response = await fetch(`/api/users?q=id:${user.sub}`);
        const json = await response.json();
        setUsername(json.username);
      };
      fetchUsername();
    }
  }, [isAuthenticated, user]);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const router = useRouter();

  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar>
          <Toolbar>
            <Image width={40} height={40} src="/grill.svg" alt="" />
            <Link href="/" passHref={true}>
              <Typography
                variant="h5"
                display="inline"
                sx={{ flexGrow: 1, marginLeft: 2, cursor: "pointer" }}
              >
                GRILL
              </Typography>
            </Link>
            {isAuthenticated ? (
              <>
                <Typography>{username}</Typography>
                <IconButton onClick={handleClick}>
                  {user.picture ? <Avatar src={user.picture} /> : <Avatar />}
                </IconButton>
              </>
            ) : (
              <Button color="inherit" onClick={() => loginWithPopup()}>
                Login
              </Button>
            )}
          </Toolbar>
        </AppBar>
      </Box>
      {isLoading ? (
        <></>
      ) : (
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          onClick={handleClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: "visible",
              filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
              mt: 1.5,
              "& .MuiAvatar-root": {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              "&:before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: "background.paper",
                transform: "translateY(-50%) rotate(45deg)",
                zIndex: 0,
              },
            },
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <MenuItem
            onClick={() => {
              router.push(`/user/${user.sub}?id`);
            }}
          >
            <Avatar /> Profile
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              router.push(`/dashboard`);
            }}
          >
            <ListItemIcon>
              <LocalShipping fontSize="small" />
            </ListItemIcon>
            My Packages
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              router.push(`/settings`);
            }}
          >
            <ListItemIcon>
              <Settings fontSize="small" />
            </ListItemIcon>
            Settings
          </MenuItem>
          <MenuItem
            onClick={() => logout({ returnTo: window.location.origin })}
          >
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      )}
    </>
  );
}

function AuthProvider({ children }) {
  if (typeof window !== "undefined") {
    return (
      <Auth0Provider
        domain="dev-bzktuxhd.us.auth0.com"
        clientId={process.env.CLIENT_ID}
        redirectUri={window.location.origin}
        audience="https://dev-bzktuxhd.us.auth0.com/api/v2/"
        scope="read:current_user create:current_user_metadata update:current_user_metadata"
      >
        {children}
      </Auth0Provider>
    );
  } else {
    return <>{children}</>;
  }
}

export function App({ Component, pageProps, ...appProps }) {
  const [packages, setPackages] = useState(null);
  useEffect(() => {
    if (packages === null) {
      getIndex().then((index) => {
        setPackages(index.packages);
      });
    }
  });

  const router = useRouter();
  if (router.pathname.startsWith("/login")) {
    if (packages !== undefined) {
      setPackages(undefined);
    }
    return (
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    );
  }

  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title>Grill - Beef Package Manager</title>
        </Helmet>
      </HelmetProvider>

      <AuthProvider>
        <ThemeProvider theme={theme}>
          <IndexContext.Provider value={packages}>
            <CssBaseline />
            <NavBar />
            <Box pt="64px" width="100%">
              {packages ? <Component {...pageProps} /> : <>loading...</>}
            </Box>
          </IndexContext.Provider>
        </ThemeProvider>
      </AuthProvider>
    </>
  );
}

export default App;
