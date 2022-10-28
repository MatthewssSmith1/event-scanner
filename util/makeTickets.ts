import fs from "fs";
import { toBuffer } from "qrcode";
import csv from "csvtojson";

import { createCanvas, loadImage } from "canvas";
import { Ticket, ticketToString } from "../pages/api/scan";

// const width = 1200;
// const height = 1200;

// const canvas = createCanvas(width, height);
// const context = canvas.getContext("2d");

// context.fillStyle = "#000";
// context.fillRect(0, 0, width, height);

// context.font = "bold 70pt Menlo";
// context.textAlign = "center";
// context.textBaseline = "top";
// context.fillStyle = "#3574d4";

// const text = "Hello, World!";

// const textWidth = context.measureText(text).width;
// context.fillRect(600 - textWidth / 2 - 10, 170 - 5, textWidth + 20, 120);
// context.fillStyle = "#fff";
// context.fillText(text, 600, 170);

// context.fillStyle = "#fff";
// context.font = "bold 30pt Menlo";
// context.fillText("flaviocopes.com", 600, 530);

const EVENT_ID = "10-27-22";
const HASH_SECRET = "WYdk7d1NCq0h2PjgACbS1zkr47LJGest7ZdPFOdV";
const QR_OPTIONS = {
  color: {
    dark: "#d95a00", // Blue dots
    light: "#000", // Transparent background
  },
};


function ensureDirExists(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

ensureDirExists("./util/tickets");
async function draw() {
  const data = await csv().fromFile("./util/ticket-data.csv");

  for (let i = 0; i < data.length; i++) {
    let { group, groupID: count } = data[i];

    for (let id = 1; id <= count; id++) {
      const ticket: Ticket = {
        eventId: EVENT_ID,
        group,
        id: `${id}`,
      };

      let qrBuffer = await toBuffer(ticketToString(ticket, HASH_SECRET), QR_OPTIONS);
      ensureDirExists(`./util/tickets/${group}`);
      fs.writeFileSync(`./util/tickets/${group}/${id}.png`, qrBuffer); // canvas.toBuffer("image/png"));
    }
  }
}

draw();

