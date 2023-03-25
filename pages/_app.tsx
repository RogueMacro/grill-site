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
import { IndexContext } from "../components/context";
import { useEffect, useState } from "react";
import { HelmetProvider, Helmet } from "react-helmet-async";
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { useRouter } from "next/router";
import { getIndex } from "../lib/index";
import { createTheme, PaletteColorOptions, Theme } from "@mui/material/styles";
import {
  Experimental_CssVarsProvider as CssVarsProvider,
  useColorScheme,
  experimental_extendTheme,
} from "@mui/material/styles";
import "../styles/code.css";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";

declare module "@mui/material/styles/createPalette" {
  interface TypeBackground {
    package?: string;
  }

  interface PaletteOptions {
    code?: PaletteColorOptions;
  }
}

declare module "@mui/styles/defaultTheme" {
  interface DefaultTheme extends Theme {}
}

const base = createTheme({
  typography: {
    fontFamily: "Hubot",
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
            @font-face {
              font-family: 'Hubot';
              font-style: normal;
              font-display: swap;
              font-weight: 400;
              src: url(/fonts/HubotSans/Hubot-Sans.ttf) format('truetype') ,
                   url(/fonts/HubotSans/Hubot-Sans-Bold.ttf) format('truetype');
            }
          `,
    },
  },
});

const theme = experimental_extendTheme(
  {
    colorSchemes: {
      light: {
        palette: {
          background: {
            package: "#f0eee4",
          },
          code: {
            main: "#F6F8FA",
          },
        },
      },
      dark: {
        palette: {
          primary: {
            main: "#ffa500",
          },
          secondary: {
            main: "#7830ec",
          },
          text: {
            primary: "#C8D0D9",
          },
          background: {
            default: "#161B22",
            paper: "#0D1117",
            package: "#1c2027",
          },
          code: {
            main: "#161B22",
          },
        },
      },
    },
  },
  base
);

export default function App({ Component, pageProps, ...appProps }) {
  const [index, setIndex] = useState(null);
  useEffect(() => {
    if (index === null) {
      getIndex().then((index) => {
        setIndex(index);
      });
    }
  }, [index]);

  const router = useRouter();
  if (router.pathname.startsWith("/login")) {
    if (index !== undefined) {
      setIndex(undefined);
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
        <CssVarsProvider theme={theme}>
          <IndexContext.Provider value={index}>
            <CssBaseline />
            <NavBar />
            <Box pt="64px" width="100%">
              {index ? <Component {...pageProps} /> : <></>}
            </Box>
          </IndexContext.Provider>
        </CssVarsProvider>
      </AuthProvider>
    </>
  );
}

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

  const { mode, setMode } = useColorScheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // for server-side rendering
    // learn more at https://github.com/pacocoursey/next-themes#avoid-hydration-mismatch
    return null;
  }

  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar sx={{ paddingLeft: "10vw" }}>
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
            <Button
              color="inherit"
              size="small"
              sx={{
                textTransform: "none",
                fontSize: "20px",
                marginRight: "20px",
              }}
              href="https://roguemacro.gitbook.io/grill"
            >
              Documentation
            </Button>
            <Button
              color="inherit"
              size="small"
              sx={{
                textTransform: "none",
                fontSize: "20px",
                marginRight: "20px",
              }}
              href="https://github.com/RogueMacro/grill/releases/latest"
            >
              Download
            </Button>
            {isAuthenticated ? (
              <>
                <Typography>{username}</Typography>
                <IconButton onClick={handleClick}>
                  {user.picture ? <Avatar src={user.picture} /> : <Avatar />}
                </IconButton>
              </>
            ) : (
              <Button
                color="inherit"
                size="small"
                sx={{ textTransform: "none", fontSize: "20px" }}
                onClick={() => loginWithPopup()}
              >
                Login
              </Button>
            )}
            <IconButton
              color="inherit"
              size="small"
              sx={{
                textTransform: "none",
                fontSize: "20px",
                marginLeft: "5vw",
              }}
              onClick={() => setMode(mode === "dark" ? "light" : "dark")}
            >
              {mode === "dark" ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>
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
        clientId="0EKKYGRUBizA8QYUARGk3Rgxiln1h4Mq"
        redirectUri="https://grillpm.vercel.app"
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
