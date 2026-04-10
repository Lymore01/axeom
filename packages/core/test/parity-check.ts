import { Axeom } from "../src/index";

const app = new Axeom();
const sequence: string[] = [];

app.onBeforeMatch(() => {
  sequence.push("onBeforeMatch");
});
app.onBeforeHandle(() => {
  sequence.push("onBeforeHandle");
});
app.onAfterHandle(() => {
  sequence.push("onAfterHandle");
});
app.onResponse((res) => {
  sequence.push("onResponse");
  res.headers.set("X-Sequence", sequence.join(","));
});

app.get("/ping", () => {
  sequence.push("handler");
  return { message: "pong" };
});

app.get("/error", () => {
  sequence.push("handler");
  throw new Error("test error");
});

// @ts-expect-error
const isBun = typeof Bun !== "undefined";
// @ts-expect-error
const isDeno = typeof Deno !== "undefined";
const isWorkerd =
  // @ts-expect-error
  typeof __IS_WORKERD__ !== "undefined" ||
  (typeof navigator !== "undefined" && navigator.userAgent === "Cloudflare-Workers");

const runtime = isBun
  ? "bun"
  : isDeno
    ? "deno"
    : isWorkerd
      ? "workerd"
      : "node";

console.log(`\x1b[34m[Parity] Running tests on ${runtime}...\x1b[0m`);

async function runTests() {
  try {
    // Test Success
    sequence.length = 0;
    const req1 = new Request("http://localhost/ping");
    const res1 = await app.handle(req1);
    const seq1 = res1.headers.get("X-Sequence");
    const expectedSeq1 =
      "onBeforeMatch,onBeforeHandle,handler,onAfterHandle,onResponse";

    if (seq1 !== expectedSeq1) {
      console.error(
        `\x1b[31m[FAILED] Expected ${expectedSeq1}, got ${seq1}\x1b[0m`,
      );
      exit(1);
    }
    console.log("\x1b[32m[PASSED] Success path matches expectation.\x1b[0m");

    // Test Error
    sequence.length = 0;
    const req2 = new Request("http://localhost/error");
    const res2 = await app.handle(req2);
    const seq2 = res2.headers.get("X-Sequence");
    const expectedSeq2 = "onBeforeMatch,onBeforeHandle,handler,onResponse";

    if (seq2 !== expectedSeq2) {
      console.error(
        `\x1b[31m[FAILED (Error Path)] Expected ${expectedSeq2}, got ${seq2}\x1b[0m`,
      );
      exit(1);
    }
    console.log("\x1b[32m[PASSED] Error path matches expectation.\x1b[0m");

    console.log(
      `\x1b[32m[SUCCESS] ALL PARITY CHECKS PASSED ON ${runtime}!\x1b[0m`,
    );
    exit(0);
  } catch (err) {
    console.error(`\x1b[31m[CRITICAL ERROR] ${err}\x1b[0m`);
    exit(1);
  }
}

function exit(code: number) {
  // @ts-expect-error
  if (isDeno) Deno.exit(code);
  if (typeof process !== "undefined") process.exit(code);
  // @ts-expect-error
  if (isBun) process.exit(code);

  if (isWorkerd) {
    console.log(
      `\x1b[33m[Workerd] Parity check finished with code ${code}\x1b[0m`,
    );
  }
}

if (runtime !== "workerd") {
  runTests();
}

export default {
  async fetch(request: Request) {
    console.log("\x1b[35m[Workerd] Triggering parity tests...\x1b[0m");
    await runTests();
    return new Response("Parity tests complete. Check your terminal.");
  },
};
