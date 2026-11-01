// CDP probe v2: load a URL, optionally click a selector, then evaluate JS.
// usage: node probe2.mjs <url> <clickSelector|-> <expression> [waitMs] [afterClickMs]
const url = process.argv[2];
const clickSel = process.argv[3];
const expression = process.argv[4] || "document.title";
const waitMs = Number(process.argv[5] || 7000);
const afterClickMs = Number(process.argv[6] || 7000);
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
      }, 20000);
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
  console.error("navigated, waiting", waitMs);
  await sleep(waitMs);
  console.error("wait done, ready to interact");

  const evalOnce = async (expr, awaitPromise = true) => {
    const res = await send("Runtime.evaluate", {
      expression: expr,
      returnByValue: true,
      awaitPromise,
    });
    return res.result?.value ?? res;
  };

  if (clickSel && clickSel !== "-") {
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
}

main().catch((e) => {
  console.error("probe failed:", e.message);
  process.exit(1);
});
