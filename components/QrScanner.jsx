import { QrReader } from "react-qr-reader";


export default function QrScanner({onScan, onError}) {
  return (
    <QrReader
      onResult={(result, error) => {
        if (!!result) {
          onScan(result?.text);
        }

        if (!!error) {
          onError(error);
        }
      }}
      constraints={{ facingMode: "environment" }}
      scanDelay={500}
      // style={{ width: "90vw", height: "90vw" }}
    />
  );
}