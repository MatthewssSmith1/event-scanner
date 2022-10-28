// import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../util/mongoClient";
import { Db } from "mongodb";
import { stringToTicket } from "../../util/makeTickets";
import { Ticket } from "../../util/makeTickets";

export type Entry = {
  eventId: string;
  data: string;
  lastUsed: number;
};

export type TReq = {
  eventId: string;
  ticketData: string;
};

export type TRes = {
  message: string;
  elapsedTime?: number;
};

export default async function handler(
  req: any, // NextApiRequest,
  res: any //NextApiResponse<TRes | { message: string }>
) {
  let { eventId, ticketData } = req.body;
  // return res
  //   .status(405)
  //   .json({ message: JSON.stringify({ eventId, ticketData }) });

  const { db } = (await connectToDatabase()) as { db: Db };

  // if (req.method !== "POST")
  //   return res.status(405).json({ message: "Only POST requests allowed" });

  // let eventId, ticketData;
  // try {
  //   console.log(req.body);
  //   let body = req.body

  //   // if (body.length !== 2)
  //   //   return res.status(201).json({ message: "no ticket data provided" });

  //   ticketData = body.ticketData;
  //   eventId = body.eventId;
  // } catch (e) {
  //   console.log("caught", e);
  //   return res.status(406).json({ message: "parse error" });
  // }

  if (!ticketData || ticketData.length === 0)
    return res.status(201).json({ message: "no ticket data provided" });

  const ticket = stringToTicket(ticketData, process.env.HASH_SECRET);

  if (ticket === undefined)
    return res.status(202).json({ message: "invalid ticket" });

  const ticketEventId = ticket.eventId; //.replace(" ", "_");

  if (ticketEventId !== eventId)
    return res.status(203).json({
      message: `wrong event: ${ticket.eventId} ${ticket.group} (${ticket.id})`,
    });

  const found = await db.collection("tickets").findOne({ data: ticketData });

  if (found)
    return res.status(200).json({
      message: `${ticket.group} (${ticket.id})`,
      elapsedTime: Date.now() - found.lastUsed,
    } as TRes);

  await db.collection("tickets").insertOne({
    eventId,
    data: ticketData,
    lastUsed: Date.now(),
  } as Entry);

  return res.status(200).json({
    message: `${ticket.group} (${ticket.id})`,
    elapsedTime: 0,
  } as TRes);
}
