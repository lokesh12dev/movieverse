// Evaluate JS in the already-open browser tab (no navigation).
// usage: node cdp-eval.mjs <expression> [clickSelector] [afterClickMs]
const CDP = process.env.CDP || "http://127.0.0.1:9235";
const expression = process.argv[2] || "document.title";
const clickSel = process.argv[3];
const afterClickMs = Number(process.argv[4] || 6000);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const list = await (await fetch(CDP + "/json")).json();
const page = list.find((t) => t.type === "page" && !t.url.startsWith("chrome://"));
if (!page) throw new Error("no page target");
const ws = new WebSocket(page.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();
const events = [];
ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg);
    pending.delete(msg.id);
  } else if (msg.method) events.push(msg);
};
await new Promise((r) => (ws.onopen = r));

const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const mid = ++id;
    pending.set(mid, (m) => (m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result)));
    ws.send(JSON.stringify({ id: mid, method, params }));
    setTimeout(() => {
      if (pending.has(mid)) {
        pending.delete(mid);
        reject(new Error("timeout " + method));
      }
    }, 30000);
  });

await send("Runtime.enable");
const evalOnce = async (expr, awaitPromise = true) => {
  const res = await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise });
  return res.result?.value ?? res;
};

if (clickSel) {
  const clicked = await evalOnce(
    `(() => { const el = document.querySelector(${JSON.stringify(clickSel)}); if (!el) return "not found"; const href = el.getAttribute("href"); el.click(); return href; })()`,
    false
  );
  console.error("clicked:", clicked);
  await sleep(afterClickMs);
}

console.log(JSON.stringify(await evalOnce(expression), null, 2));
const errors = events
  .filter((e) => e.method === "Runtime.consoleAPICalled" && e.params.type === "error")
  .map((e) => e.params.args.map((a) => a.value ?? a.description).join(" "));
if (errors.length) {
  console.error("\n--- console errors ---");
  for (const e of errors.slice(0, 12)) console.error(e.slice(0, 300));
}
ws.close();
