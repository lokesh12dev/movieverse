// Dump the hydrated DOM of a URL to a file using the already-open Chrome tab.
// usage: node dump-dom.mjs <url> <outfile> [waitMs]
import fs from "node:fs";

const CDP = process.env.CDP || "http://127.0.0.1:9235";
const url = process.argv[2];
const outFile = process.argv[3];
const waitMs = Number(process.argv[4] || 9000);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const list = await (await fetch(CDP + "/json")).json();
let page = list.find((t) => t.type === "page" && !t.url.startsWith("chrome://"));
if (!page) {
  const created = await (await fetch(CDP + "/json/new?about:blank", { method: "PUT" })).json();
  page = created;
}
const ws = new WebSocket(page.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();
ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg);
    pending.delete(msg.id);
  }
};
await new Promise((r) => (ws.onopen = r));
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const mid = ++id;
    pending.set(mid, (m) => (m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result)));
    ws.send(JSON.stringify({ id: mid, method, params }));
  });

await send("Page.enable");
await send("Runtime.enable");
await send("Page.navigate", { url });
await sleep(waitMs);
const res = await send("Runtime.evaluate", {
  expression: "document.documentElement.outerHTML",
  returnByValue: true,
});
const html = res.result.value;
const doctype = html.startsWith("<html") ? "<!DOCTYPE html>\n" : "";
fs.writeFileSync(outFile, doctype + html);
console.log("wrote", outFile, html.length, "chars; page", url);
ws.close();
