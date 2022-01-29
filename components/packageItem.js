import { useRouter } from "next/router";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";

export default function PackageItem(name, data) {
  const router = useRouter();

  const handleClick = (e) => {
    e.preventDefault();
    router.push(`/package/${name}`);
  };

  return (
    <Card key={name} elevation={2}>
      <CardActionArea onClick={handleClick}>
        <CardContent>
          <Typography fontSize={20} fontWeight="bold" display="inline">
            {name}
          </Typography>
          <Typography
            fontSize={15}
            fontWeight="light"
            display="inline"
            marginLeft="10px"
          >
            v{Object.keys(data.versions).at(-1)}
          </Typography>
          <Typography fontSize={14} color="text.secondary">
            {data.description === undefined ? (
              <i>*nothingness*</i>
            ) : (
              data.description
            )}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
