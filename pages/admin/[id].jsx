import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/router";
import Cookies from "js-cookie";

import QrScanner from "../../components/QrScanner";

import styles from "../../styles/Event.module.css";

export default function Scan() {
  const router = useRouter();
  const { id } = router.query;

  if (id === undefined) return <p>loading...</p>;

  const deleteData = async() => {
    const opts = {  
      method: "POST",
      body: JSON.stringify({ eventId: id }),
    };
    let res = await fetch(
      "https://event-scanner.vercel.app/api/clearEvent",
      opts
    );
  }

  return (
    <div className={styles.content}>
      <h1>{id.toUpperCase()}</h1>
      <div className="w-32 h-12 bg-red" onClick={deleteData}>
        Delete Event Data
      </div>
    </div>
  );
}
