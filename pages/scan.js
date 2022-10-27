import React, { useState, useRef } from "react";
import { QrReader } from "react-qr-reader";
import styles from "../styles/Scan.module.css";

function Scan() {
  const [data, setData] = useState("No result");

  return (
    <div className={styles.content}>
      <div className={styles.wrapper}>
        <QrReader
          onResult={(result, error) => {
            if (!!result) {
              setData(result?.text);
            }

            if (!!error) {
              console.info(error);
            }
          }}
          constraints={{ facingMode: "environment" }}
          // style={{ width: "90vw", height: "90vw" }}
        />
      </div>
      <p>{data}</p>
    </div>
  );
}

export default Scan;
