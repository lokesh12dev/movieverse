// Minimal CDP probe: load a URL in headless Chrome, wait, then evaluate JS.
// usage: node probe.mjs <url> [expression] [waitMs]
const url = process.argv[2];
const expression = process.argv[3] || "document.documentElement.outerHTML.length";
const waitMs = Number(process.argv[4] || 7000);
const CDP = process.env.CDP || "http://127.0.0.1:9223";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const list = await (await fetch(CDP + "/json")).json();
  const page = list.find((t) => t.type === "page");
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
    } else if (msg.method) {
      events.push(msg);
    }
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

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await send("Page.navigate", { url });
  await sleep(waitMs);

  const res = await send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  console.log(JSON.stringify(res.result?.value ?? res, null, 2));

  const errors = events
    .filter((e) => e.method === "Runtime.consoleAPICalled" && e.params.type === "error")
    .map((e) => e.params.args.map((a) => a.value ?? a.description).join(" "));
  if (errors.length) {
    console.error("\n--- console errors ---");
    for (const e of errors.slice(0, 15)) console.error(e.slice(0, 400));
  }
  ws.close();
}

main().catch((e) => {
  console.error("probe failed:", e.message);
  process.exit(1);
});
