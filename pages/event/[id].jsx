import React, { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Cookies from "js-cookie";

import QrScanner from "../../components/QrScanner";

import styles from "../../styles/Event.module.css";

const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://event-scanner.vercel.app"
    : "";//"http://localhost:3000";

export default function Scan() {
  const lastTicket = useRef("");
  const [resp, setResp] = useState(null);
  const [error, setError] = useState(null);

  const [count, setCount] = useState(0);

  const reset = () => {
    setResp(null);
    setError(null);
  };

  const router = useRouter();
  const { id } = router.query;

  const updateCount = useCallback(() => {
    if (id !== undefined) {
      fetch(`${BASE_URL}/api/count`, {
        method: "POST",
        body: id,

        mode: "cors", // no-cors, *cors, same-origin
        credentials: "same-origin", // include, *same-origin, omit
        // headers: {
          // "Content-Type": "application/json",
          // 'Content-Type': 'application/x-www-form-urlencoded',
        // },
      })
        .then((res) => res.json())
        .then(setCount);
    }
  }, [id, setCount]);

  const onScan = useCallback(
    async (ticketData) => {
      const opts = {
        method: "POST",
        body: ticketData + "===" + id,
        // mode: "cors", // no-cors, *cors, same-origin
        // credentials: "same-origin", // include, *same-origin, omit
        // headers: {
        //   "Content-Type": "application/json",
          // 'Content-Type': 'application/x-www-form-urlencoded',
        // },
      };
      let res = await fetch(`${BASE_URL}/api/scan`, opts);
      let json = await res.json();

      console.log(json);
      return;

      if (lastTicket.current.length !== 0 && lastTicket.current === ticketData)
        return;

      console.log("new ticket: ", ticketData, "  status: ", res.status);

      lastTicket.current = ticketData;

      if (res.status === 200) {
        if (count !== 0) setCount(count + 1);
        setResp(json);
        updateCount();
      } else {
        setError(json.message);
      }
    },
    [id, count, updateCount, lastTicket]
  );

  if (id === undefined) return <p>loading...</p>;

  return (
    <div className={styles.content}>
      <h1>{`${id.toUpperCase()}`}</h1>
      <div className={styles.wrapper}>
        <QrScanner onScan={onScan} onError={() => {}} />
      </div>
      <CountInfo eventId={id} count={count} updateCount={updateCount} />
      {(error !== null || resp !== null) && (
        <RespText resp={resp} error={error} reset={reset} />
      )}
    </div>
  );
}
function RespText({ resp, error, reset }) {
  let bgColor = "white";
  if (error !== null) bgColor = "red";
  else if (resp !== null) {
    bgColor = resp.elapsedTime < 3 ? "green" : "red";
  }

  return (
    <div
      className={styles.homeInfo}
      onClick={() => reset()}
      style={{ backgroundColor: bgColor }}
    >
      <h3>x</h3>
      {error ? (
        <p>{error}</p>
      ) : (
        <>
          <p>{resp.message}</p>
          <p>{lastUsedText(resp.elapsedTime)}</p>
        </>
      )}
    </div>
  );
}

const lastUsedText = (elapsedTime) => {
  if (elapsedTime === 0) return "first use";

  //seconds
  var time = Math.ceil(elapsedTime / 1000);

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

function CountInfo({ eventId, count, updateCount }) {
  const [diff, setDiff] = useState(0);
  const [mounted, setMounted] = useState(false);

  const updateDiff = useCallback(
    (offset) => {
      if (offset != 0) {
        Cookies.set("diff", `${diff + offset}`);
        setDiff(diff + offset);
      }

      updateCount();
    },
    [diff, updateCount]
  ); //, count]);

  useEffect(() => {
    if (mounted) return;
    setMounted(true);

    setDiff(parseInt(Cookies.get("diff") || "0"));

    updateDiff(0);
  }, [mounted, updateDiff]);

  return (
    <>
      <div className={styles.counter}>
        <div className={styles.plus} onClick={() => updateDiff(1)}>
          <p> + </p>
        </div>
        <div className={styles.counts}>
          <h2>{count}</h2>
          <h1>{count + diff}</h1>
        </div>
        <div className={styles.minus} onClick={() => updateDiff(-1)}>
          <p> - </p>
        </div>
      </div>
    </>
  );
}
