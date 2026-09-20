import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const token = process.env.LINE_CHANNEL_ACCESS_TOKEN?.trim();
const liffId = process.env.LINE_LIFF_ID?.trim() || process.env.VITE_LIFF_ID?.trim();
const imagePath = resolve(process.env.RICH_MENU_IMAGE || "public/rich-menu.png");

if (!token || !liffId) {
  throw new Error("LINE_CHANNEL_ACCESS_TOKEN and LINE_LIFF_ID (or VITE_LIFF_ID) are required");
}

const labels = ["Home", "My Group", "Scoreboard", "Buddy / Budder", "Activities", "My Profile"];
const paths = ["home", "group", "scoreboard", "buddy", "activities", "profile"];
const columns = [0, 833, 1666, 2500];
const rows = [0, 843, 1686];
const areas = paths.map((path, index) => {
  const row = Math.floor(index / 3);
  const column = index % 3;
  return {
    bounds: {
      x: columns[column],
      y: rows[row],
      width: columns[column + 1] - columns[column],
      height: rows[row + 1] - rows[row],
    },
    action: { type: "uri", label: labels[index], uri: `https://liff.line.me/${liffId}/${path}` },
  };
});

async function lineRequest(url, init) {
  const response = await fetch(url, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, ...init.headers },
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`LINE API ${response.status}: ${body}`);
  }
  return response;
}

const createResponse = await lineRequest("https://api.line.me/v2/bot/richmenu", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    size: { width: 2500, height: 1686 },
    selected: true,
    name: "Chula Chiang Mai Camp 2026",
    chatBarText: "Camp menu",
    areas,
  }),
});
const { richMenuId } = await createResponse.json();
console.log(`Created ${richMenuId}`);

const image = await readFile(imagePath);
await lineRequest(`https://api-data.line.me/v2/bot/richmenu/${richMenuId}/content`, {
  method: "POST",
  headers: { "Content-Type": "image/png" },
  body: image,
});
console.log("Uploaded rich menu image");

await lineRequest(`https://api.line.me/v2/bot/user/all/richmenu/${richMenuId}`, { method: "POST", headers: {} });
console.log(`Set ${richMenuId} as the default rich menu`);
