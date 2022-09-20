import { getAuthor } from "../../../lib/users";

export default async function handler(req, res) {
  const author = await getAuthor(req.query.package);
  if (!author) {
    res.status(404).json({ message: "This package does not exist" });
    return;
  }

  res.status(200).json(author);
}
