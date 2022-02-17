import dynamic from "next/dynamic";
import { useState } from "react";
import { ArrowLeftIcon, HomeIcon } from "@heroicons/react/solid";
const QrReader = dynamic(() => import("react-qr-reader"), { ssr: false });
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

const exTicket: TicketState = {
  data: "11/2 Jerry 4 78192976",
  date: "11/2",
  name: "Jerry",
  num: "4",
  lastUsed: 995000000000,
  isNew: true,
};

export default function Index() {
  const [ticket, setTicket] = useState<TicketState | null>(null);

  console.log(ticket);

  return (
    <div className={styles.content}>
      {!ticket && <Home setTicket={setTicket} />}
      {ticket && <TicketView ticket={ticket} setTicket={setTicket} />}
    </div>
  );
}

type HomeProps = {
  setTicket: (ticket: TicketState | null) => void;
};
function Home({ setTicket }: HomeProps) {
  const [err, setErr] = useState<string | null>(null);

  const onScan = async (data: string | null) => {
    // console.log(data)
    if (!data) return;

    fetch("/api/scan", {
      method: "POST",
      body: JSON.stringify(data),
    })
      .then(async (res) => {
        const json = await res.json();
        if (res.status == 200) {
          setTicket(json as TicketState);
          setErr(null);
        } else {
          setErr((json as Err).message);
        }
      })
      .catch(console.log);
  };

  return (
    <>
      <div className={styles.scanner}>
        <QrReader onScan={onScan} onError={setErr} />
      </div>
      <div className={styles.homeInfo}>{err && <p>{err}</p>}</div>
    </>
  );
}

type TicketViewProps = {
  ticket: TicketState;
  setTicket: (ticket: TicketState | null) => void;
};
function TicketView({ ticket, setTicket }: TicketViewProps) {
  const { date, name, num, isNew } = ticket;

  const formatName = (name: string) => {
    try {
      return name.replaceAll("_", " ");
    } catch (_) {
      return name;
    }
  };

  const lastUsedText = (t: TicketState) => {
    const { isNew, lastUsed } = t;

    if (isNew) return "never";

    var seconds = Math.ceil((Date.now() - lastUsed) / 1000);

    if (seconds < 60) return `${seconds} seconds ago`;

    return `${Math.ceil(seconds / 60)} minutes ago`;
  };

  return (
    <>
      <div className={styles.backArrow} onClick={() => setTicket(null)}>
        <ArrowLeftIcon />
      </div>
      <div className={styles.info}>
        <h1>{date}</h1>
        <h1>{formatName(name)}</h1>
        <h1>{num}</h1>
      </div>
      <div
        className={cn(styles.lastUsed, {
          [`${styles.isNew}`]: isNew,
        })}
      >
        <h1>{lastUsedText(ticket)}</h1>
      </div>
    </>
  );
}
