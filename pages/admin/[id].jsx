import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/router";
import Cookies from "js-cookie";

import QrScanner from "../../components/QrScanner";

import styles from "../../styles/Event.module.css";


const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://event-scanner.vercel.app"
    : "";//"http://localhost:3000";

export default function Scan() {
  const router = useRouter();
  const { id } = router.query;

  if (id === undefined) return <p>loading...</p>;

  const deleteData = async () => {
    const opts = {
      method: "POST",
      body: JSON.stringify({ eventId: id }),

      mode: "cors", // no-cors, *cors, same-origin
      // credentials: "same-origin", // include, *same-origin, omit
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
    };
    let res = await fetch(`${BASE_URL}/api/clearEvent`, opts);
  };

  return (
    <div className={styles.content}>
      <h1>{id.toUpperCase()}</h1>
      <div className="w-32 h-12 bg-red" onClick={deleteData}>
        Delete Event Data
      </div>
    </div>
  );
}
