import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../util/mongoClient";
import { Db } from "mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { db } = (await connectToDatabase()) as { db: Db };

  // const { eventId } = JSON.parse(req.body);
  const eventId = req.body;

  console.log(eventId);

  const count = await db.collection("tickets").countDocuments({ eventId });

  return res.status(200).json(count);
}
