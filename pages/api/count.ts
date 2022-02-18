import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../components/mongoClient";
import { Db } from "mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { db } = (await connectToDatabase()) as { db: Db };

  // const totalCount = JSON.parse(req.body);
  // console.log(req.body);

  const found = await db.collection("tickets").countDocuments();

  return res.status(200).json(found);
}
