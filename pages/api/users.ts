import { getPublicUsers } from "../../lib/users";

export default async function handler(req, res) {
  const users = await getPublicUsers();

  if (req.query.q) {
    const array = req.query.q.split(":");
    if (array.length !== 2) {
      res.status(400).json({ statusCode: 400, message: "Invalid query" });
      return;
    }

    const [key, match] = array;
    const matchedUser = users.find((user) => {
      if (key == "package") {
        return user["packages"].includes(match);
      } else {
        return user[key] == match;
      }
    });

    if (!matchedUser) {
      res
        .status(404)
        .json({ statusCode: 404, message: "No user matched query" });
      return;
    }

    res.status(200).json(matchedUser);
    return;
  }

  res.status(200).json(users);
}
