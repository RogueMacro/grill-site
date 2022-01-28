import { useRouter } from "next/router";
import ErrorPage from "next/error";
import { useState, useContext, useEffect } from "react";
import { IndexContext } from "../../components/context";
import PackageItem from "../../components/packageItem";
import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { PublicUser } from "../../lib/users";

export default function Profile() {
  const router = useRouter();
  const [user, setUser]: [PublicUser, any] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const [isFetchingUser, setFetchingUser] = useState(false);
  const index = useContext(IndexContext);

  useEffect(() => {
    setFetchingUser(true);
    const identifier = router.query.identifier;
    const query = router.query.hasOwnProperty("id")
      ? `id:${identifier}`
      : `username:${identifier}`;
    fetch(`/api/users?q=${query}`).then(async (response) => {
      setFetchingUser(false);
      if (response.status !== 200) {
        setFetchError([response.status, response.statusText]);
        return;
      }
      let user = await response.json();
      user.created = new Date(user.created);
      setUser(user);
    });
  }, []);

  if (fetchError) {
    return <ErrorPage statusCode={fetchError[0]} title={fetchError[1]} />;
  }

  if (isFetchingUser || (!isFetchingUser && !user)) {
    return <>loading...</>;
  }

  var packages = {};
  for (let key in index) {
    if (key.startsWith("")) packages[key] = index[key];
  }

  console.log(user);

  return (
    <Stack direction="row" justifyContent="center" pt="10vh" spacing="5%">
      <Stack component={Card} width="20%" height="15vh" padding="1%">
        <Stack direction="row" spacing="20px" alignItems="center">
          <Avatar src={user.picture} />
          <Typography>{user.username}</Typography>
        </Stack>
        <br />
        <Typography>
          Been a Griller since{" "}
          {user.created.toLocaleString("default", { month: "long" })},{" "}
          {user.created.getFullYear()}
        </Typography>
      </Stack>
      <Stack width="20%" spacing="20px">
        <Typography variant="h4">Packages ({user.packages.length})</Typography>
        {user.packages.map((pkg) => PackageItem(pkg, index[pkg]))}
      </Stack>
    </Stack>
  );
}
