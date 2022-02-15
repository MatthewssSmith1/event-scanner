import dynamic from "next/dynamic";
import { useState } from "react";
import { ArrowLeftIcon } from "@heroicons/react/solid";

export type TicketState = {
  data: string;
  lastUsed: string;
};

const QrReader = dynamic(() => import("react-qr-reader"), { ssr: false });

export default function Home() {
  const [ticket, setTicket] = useState<TicketState | null>(null);

  const onScan = async (data: string | null) => {
    if (!data) return;

    const res = await fetch("/api/scan", {
      method: "POST",
      body: JSON.stringify(data),
    }).catch(console.log);

    if (!res) return;

    console.log(res.status);
    const ticket: TicketState = await res.json();
    setTicket(ticket);
  };

  return (
    <div>
      <nav>
        {ticket && (
          <div onClick={() => setTicket(null)}>
            <ArrowLeftIcon />
          </div>
        )}
      </nav>
      {ticket && (
        <>
          <h1>{ticket.data}</h1>
          <h1>{ticket.lastUsed}</h1>
        </>
      )}
      {!ticket && (
        <QrReader onScan={onScan} onError={(err: any) => console.log(err)} />
      )}
    </div>
  );
}
