import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../util/mongoClient";
import { Db } from "mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  // another common pattern
  // res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
  
  const { db } = (await connectToDatabase()) as { db: Db };

  const {eventId} = JSON.parse(req.body);

  const count = await db
    .collection("tickets")
    .countDocuments({ eventId });

  return res.status(200).json(count);
}
