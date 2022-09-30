import { useRouter } from "next/router";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import compareVersions from "compare-versions";
import Box from "@mui/material/Box";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { PackageEntry } from "../lib";

export default function PackageItem(
  name: string,
  data: PackageEntry,
  showArrow: boolean = true
) {
  const router = useRouter();

  const handleClick = (e) => {
    e.preventDefault();
    router.push(`/package/${name}`);
  };

  return (
    <Card key={name} elevation={2}>
      <CardActionArea onClick={handleClick}>
        <CardContent>
          <Box display="flex" justifyContent="right" alignItems="center">
            <Box flexGrow="1">
              <Typography fontSize={20} fontWeight="bold" display="inline">
                {name}
              </Typography>
              <Typography
                fontSize={15}
                fontWeight="light"
                display="inline"
                marginLeft="10px"
              >
                v{Object.keys(data.versions).sort(compareVersions).at(-1)}
              </Typography>
              <Typography fontSize={14} color="text.secondary">
                {data.description}
              </Typography>
            </Box>
            {showArrow ? <ArrowForwardIosIcon color="action" /> : <></>}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
