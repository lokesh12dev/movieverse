// Watch console errors on the currently open tab while reloading a URL.
// usage: node console-watch.mjs <url> [waitMs]
const CDP = process.env.CDP || "http://127.0.0.1:9235";
const url = process.argv[2];
const waitMs = Number(process.argv[3] || 9000);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const list = await (await fetch(CDP + "/json")).json();
const page = list.find((t) => t.type === "page" && !t.url.startsWith("chrome://"));
const ws = new WebSocket(page.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();
const logs = [];
ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg);
    pending.delete(msg.id);
  } else if (msg.method === "Runtime.consoleAPICalled" && ["error", "warning"].includes(msg.params.type)) {
    logs.push({ type: msg.params.type, text: msg.params.args.map((a) => a.value ?? a.description).join(" ") });
  } else if (msg.method === "Runtime.exceptionThrown") {
    logs.push({ type: "exception", text: msg.params.exceptionDetails.exception?.description });
  }
};
await new Promise((r) => (ws.onopen = r));
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const mid = ++id;
    pending.set(mid, (m) => (m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result)));
    ws.send(JSON.stringify({ id: mid, method, params }));
  });

await send("Runtime.enable");
if (url && url !== "-") {
  await send("Page.enable");
  await send("Page.navigate", { url });
}
await sleep(waitMs);
const res = await send("Runtime.evaluate", { expression: "location.href", returnByValue: true });
console.log(JSON.stringify({ url: res.result?.value, logs }, null, 2));
ws.close();
