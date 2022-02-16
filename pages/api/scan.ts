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

  const ticketData: string = JSON.parse(req.body);

  if (!ticketData) return res.status(200).json({ message: "invalid ticket" });

  const dataSplit = ticketData.split(" ");

  if (dataSplit.length != 3)
    return res.status(200).json({ message: "invalid ticket" });

  const [date, name, num] = dataSplit;

  const found = await db.collection("tickets").findOne({ data: ticketData });

  if (found) return res.status(200).json(found as any);

  const newState = {
    data: ticketData,
    date,
    name,
    num,
    lastUsed: Date.now(),
  };

  await db
    .collection("tickets")
    .insertOne({ ...newState, isNew: false } as TicketState);

  return res.status(200).json({ ...newState, isNew: true });
}
