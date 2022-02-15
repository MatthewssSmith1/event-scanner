import dynamic from "next/dynamic";
import { useState } from "react";

const QrReader = dynamic(() => import("react-qr-reader"), { ssr: false });

export default function Home() {
  const [data, setData] = useState<string | null>();  

  return (
    <>
      {data && <h1>{data}</h1>}
      {!data && <QrReader onScan={setData} onError={(err: any) => console.log(err)} />}
    </>
  );
}