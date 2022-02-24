import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { ArrowLeftIcon, XIcon } from "@heroicons/react/solid";
const QrReader = dynamic(() => import("react-qr-reader"), { ssr: false });
import cn from "classnames";
import Cookies from "js-cookie";

import styles from "./old4525.module.css";

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
  const [count, setCount] = useState(0);
  const [mounted, setMounted] = useState<boolean>(false);
  const [diff, setDiff] = useState<number>(0);

  useEffect(() => {
    if (mounted) return;
    setMounted(true);

    setDiff(parseInt(Cookies.get("diff") || "0"));

    updateDiff(0);
  });

  const onScan = async (data: string | null) => {
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

  const updateDiff = (offset: number) => {
    if (offset != 0) {
      Cookies.set("diff", `${diff + offset}`);
      setDiff(diff + offset);
    }

    fetch("/api/count", {
      method: "POST",
      body: JSON.stringify(count + diff),
    })
      .then((res) => res.json())
      .then(setCount);
  };

  const CountInfo = () => (
    <>
      <p>{`${count} tickets scanned`}</p>
      <p>{`${count + diff} total`}</p>
      <div className={styles.counter}>
        <div className={styles.plus} onClick={() => updateDiff(1)}>
          +
        </div>
        <div className={styles.minus} onClick={() => updateDiff(-1)}>
          -
        </div>
      </div>
    </>
  );

  return (
    <>
      <div className={styles.scanner}>
        <QrReader onScan={onScan} onError={setErr} />
      </div>
      <div className={cn(styles.homeInfo, { [`${styles.red}`]: err !== null })}>
        {err && <p>{err}</p>}
        {err && (
          <div className={styles.xIcon} onClick={() => setErr(null)}>
            <XIcon />
          </div>
        )}
        {!err && <CountInfo />}
      </div>
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

    //seconds
    var time = Math.ceil((Date.now() - lastUsed) / 1000);

    if (time < 60) return `${time} seconds ago`;

    //now minutes
    time = Math.ceil(time / 60);

    if (time < 60) return `${time} minutes ago`;

    //now hours
    time = Math.ceil(time / 60);

    if (time < 24) return `${time} hours ago`;

    //now days
    time = Math.ceil(time / 24);

    return `${time} days ago`;
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
