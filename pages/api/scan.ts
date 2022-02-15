import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../components/mongoClient";
import { Db } from "mongodb";
import { TicketState } from "../index";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TicketState | { message: string }>
) {
  const { db } = (await connectToDatabase()) as { db: Db };

  if (req.method !== "POST")
    return res.status(405).send({ message: "Only POST requests allowed" });

  const ticketData = JSON.parse(req.body);

  const found = await db.collection("tickets").findOne({ _id: ticketData });

  if (found) {
    return res.status(200).json({ data: ticketData, lastUsed: "sometime" });
  }

  await db.collection("tickets").insertOne({ _id: ticketData });

  return res.status(200).json({ data: ticketData, lastUsed: "never" });
}
