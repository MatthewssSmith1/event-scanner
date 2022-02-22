import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../components/mongoClient";
import { Db } from "mongodb";
import { TicketState } from "../index";
import stringHash from "string-hash";
import moment from "moment";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TicketState | { message: string }>
) {
  const { db } = (await connectToDatabase()) as { db: Db };

  if (req.method !== "POST")
    return res.status(405).send({ message: "Only POST requests allowed" });

  const ticketData: string = JSON.parse(req.body);

  if (!ticketData)
    return res.status(201).json({ message: "no ticket data provided" });

  const dataSplit = ticketData.split(" ");

  if (dataSplit.length != 4)
    return res.status(201).json({ message: "invalid ticket" });

  const [date, name, num, ticketHash] = dataSplit;
  const serverHash = stringHash(
    `${date} ${name} ${num}${process.env.HASH_SECRET}`
  ).toString();

  if (serverHash != ticketHash)
    return res.status(201).json({ message: "invalid ticket" });

  if (!isValidDate(date))
    return res.status(201).json({ message: "invalid date" });

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

function isValidDate(date: string): boolean {
  // const to2Digits = (s: string) => (s.length == 1 ? `0${s}` : s);
  // const monthAndDate = (d: Date) => d.toISOString().slice(5, 10).split("-");
  // const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const [tMonth, tDate] = date.split("/");

  var time = moment();
  const tdMonth = `${time.month() + 1}`;
  const tdDate = `${time.date()}`;
  time.subtract(1, "days");
  const ydMonth = `${time.month() + 1}`;
  const ydDate = `${time.date()}`;

  return (
    (tMonth == tdMonth && tDate == tdDate) ||
    (tMonth == ydMonth && tDate == ydDate)
  );
}
