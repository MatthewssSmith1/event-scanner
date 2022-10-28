import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../util/mongoClient";
import { Db } from "mongodb";

export type TReq = {
  eventId: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ message: string }>
) {
  if (req.method !== "POST")
    return res.status(405).send({ message: "Only POST requests allowed" });
  const { db } = (await connectToDatabase()) as { db: Db };

  const { eventId }: TReq = JSON.parse(req.body);
  if (!eventId)
    return res.status(201).json({ message: "no event ID provided" });


  await db.collection("tickets").deleteMany({ eventId });

  return res
    .status(200)
    .json({message: "success"});
}
