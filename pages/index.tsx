import dynamic from "next/dynamic";
import { useState } from "react";
import { ArrowLeftIcon } from "@heroicons/react/solid";
import cn from "classnames";

import styles from "./index.module.css";

export type TicketState = {
  data: string;
  date: string;
  name: string;
  num: string;
  lastUsed: number;
  isNew: boolean;
};

export type Err = {
  message: string;
};

const QrReader = dynamic(() => import("react-qr-reader"), { ssr: false });

export default function Home() {
  const [ticket, setTicket] = useState<TicketState | null>({
    data: "",
    date: "2/16",
    name: "Jerry",
    num: "5",
    lastUsed: 10000000,
    isNew: true
  });
  const [err, setErr] = useState<string | null>();

  const onScan = async (data: string | null) => {
    if (!data) return;

    const res = await fetch("/api/scan", {
      method: "POST",
      body: JSON.stringify(data),
    }).catch(console.log);

    if (!res) return;

    const ticket: TicketState | Err = await res.json();
    if (ticket as TicketState) setTicket(ticket as TicketState);
    if (ticket as Err) setErr((ticket as Err).message);
  };

  var lastUsed = "never";
  if (ticket as TicketState && !ticket?.isNew) {
    var secondsElapsed = Math.ceil(
      (Date.now() - (ticket as TicketState).lastUsed) / 1000
    );
    if (secondsElapsed < 60) lastUsed = `${secondsElapsed} seconds ago`;
    else lastUsed = `${Math.ceil(secondsElapsed / 60)} minutes ago`;
  }
  

  return (
    <div className={styles.content}>
      <nav>
        <div onClick={() => setTicket(null)}>
          <ArrowLeftIcon />
        </div>
      </nav>
      {ticket && (
        <>
          <div className={styles.info}>
            <h1>{ticket.date}</h1>
            <h1>{(ticket.name || "").replaceAll("_", " ")}</h1>
            <h1>{ticket.num}</h1>
          </div>
          <div
            className={cn(styles.lastUsed, {
              [`${styles.isNew}`]: ticket.isNew,
            })}
          >
            <h1>{lastUsed}</h1>
          </div>
        </>
      )}
      {!ticket && (
        <div className={styles.scanner}>
          <QrReader onScan={onScan} onError={setErr} />
        </div>
      )}
      {err && <h1>{err}</h1>}
    </div>
  );
}
