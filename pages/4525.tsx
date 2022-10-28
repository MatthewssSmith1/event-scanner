import react from "react"
import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeftIcon, XIcon } from "@heroicons/react/solid";
import cn from "classnames";
import Cookies from "js-cookie";
import moment from "moment";

import QrReader from "react-qr-reader";
import QrScanner from "../components/QrScanner"

import styles from "./4525.module.css";

export type Ticket = {
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

export type ViewState = Ticket | Err | "scan";

export default function Page() {
  const [count, setCount] = useState(0);
  const [mounted, setMounted] = useState<boolean>(false);
  const [diff, setDiff] = useState<number>(0);
  const [view, setView] = useState<ViewState>("scan");
  const [lastScan, setLastScan] = useState(0);


  const updateDiff = useCallback((offset: number) => {
    if (offset != 0) {
      Cookies.set("diff", `${diff + offset}`);
      setDiff(diff + offset);
    }

    setCount(0)

    // fetch("/api/count", {
    //   method: "POST",
    //   body: JSON.stringify(count + diff),
    // })
    //   .then((res) => res.json())
    //   .then(setCount);
  }, [diff]);//, count]);

  const onScan = async (data: string | null) => {
    if (!data) return;

    console.info(data)

    // const now = moment().valueOf();
    // if (now - lastScan < 1000) return;
    // setLastScan(now);

    // const opts = {
    //   method: "POST",
    //   body: JSON.stringify(data),
    // };

    // fetch("/api/scan", opts)
    //   .then((res) => res.json() as Promise<Ticket | Err>)
    //   .then(setView)
    //   .catch(console.log);
  };

  useEffect(() => {
    if (mounted) return;
    setMounted(true);

    setDiff(parseInt(Cookies.get("diff") || "0"));

    updateDiff(0);
  }, [mounted, updateDiff]);

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

  var backgroundColor = "white";
  if ((view as Ticket).isNew) backgroundColor = "green";
  else if (view != "scan") backgroundColor = "red";

  const InfoText = () => (
    <>
      {infoText(view).map((txt, i) => (
        <p key={i}>{txt}</p>
      ))}
    </>
  );

  return (
    <div className={styles.content}>
      <div className={styles.scanner}>
        {<QrScanner
          onScan={onScan}
          onErr={(err: any) => { console.warn(err); setView({ message: `${err}` } as Err) }}
        />}
      </div>
      <div
        className={styles.homeInfo}
        onClick={() => setView("scan")}
        style={{ backgroundColor }}
      >
        {view === "scan" ? <CountInfo /> : <InfoText />}
      </div>
    </div>
  );
}

function infoText(view: ViewState): string[] {
  if ((view as any).message) {
    return [(view as Err).message];
  }

  const lastUsedText = (t: Ticket) => {
    const { isNew, lastUsed } = t;

    if (isNew) return "first use";

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

  const fmtName = (t: Ticket) => {
    try {
      return t.name.replaceAll("_", " ");
    } catch (e) {
      console.log(e);
      return t.name;
    }
  };

  if ((view as any).name) {
    const t = view as Ticket;
    return [fmtName(t), lastUsedText(t)];
  }

  return ["scan"];
}
