
import { Axeom, s } from "../packages/axeom/src/index";

/**
 * AXEOM PERFORMANCE SCHEMATIC (APS-01)
 * Purpose: Measure raw request-per-second (RPS) and latency distributions.
 */

const app = new Axeom();

// Define a spectrum of routes
app.get("/", () => "Hello World");

app.get("/user/:id", (ctx) => {
  return { id: ctx.params.id, type: "performance_node" };
});

app.post("/validate", ({ body }) => {
  return body;
}, {
  body: s.object({
    token: s.string(),
    meta: s.object({
      id: s.number()
    })
  })
});

console.log("ENGINE: Axeom initialized at port 5050");
const server = app.listen(5050);

// Benchmarking logic
async function runBench(name: string, path: string, method: string = "GET", body?: any) {
  const TOTAL_REQUESTS = 10000;
  const CONCURRENCY = 50;
  
  console.log(`\n--- BENCHMARK: ${name} ---`);
  console.log(`Target: ${method} ${path} (${TOTAL_REQUESTS} requests, concurrency: ${CONCURRENCY})`);

  const startTime = performance.now();
  let completed = 0;
  let success = 0;

  const dispatch = async () => {
    while (completed < TOTAL_REQUESTS) {
      completed++;
      try {
        const res = await fetch(`http://localhost:5050${path}`, {
          method,
          body: body ? JSON.stringify(body) : undefined,
          headers: body ? { "Content-Type": "application/json" } : {}
        });
        if (res.ok) success++;
        await res.arrayBuffer(); // Ensure body is consumed
      } catch (e) {
        // ...
      }
    }
  };

  const workers = Array.from({ length: CONCURRENCY }, dispatch);
  await Promise.all(workers);

  const duration = (performance.now() - startTime) / 1000;
  const rps = TOTAL_REQUESTS / duration;

  console.log(`Result: ${rps.toFixed(2)} req/sec`);
  console.log(`Success Rate: ${((success/TOTAL_REQUESTS)*100).toFixed(2)}%`);
  console.log(`Duration: ${duration.toFixed(3)}s`);
}

// Sequence the tests
setTimeout(async () => {
  try {
    await runBench("Plaintext (Root)", "/");
    await runBench("Path Params (/user/123)", "/user/123");
    await runBench("Validated JSON (POST /validate)", "/validate", "POST", { 
      token: "axeom_test", 
      meta: { id: 42 } 
    });
  } finally {
    console.log("\nBENCHMARK COMPLETE. SHUTTING DOWN ENGINE.");
    process.exit(0);
  }
}, 1000);
