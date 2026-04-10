import swagger from "@axeom/swagger";
import Axeom, { logger } from "axeom";

new Axeom()
  .use(logger())
  .use(swagger({ info: { title: "Axeom Deno API" } }))
  .get("/", () => {
    return {
      message: "Axeom running on Deno! 🦕",
      runtime: "deno",
      version: Deno.version.deno,
    };
  })
  .get("/api/v1", () => ({ status: "OK" }))
  .sse("/events", async function* () {
    for (let i = 0; i < 10; i++) {
      yield {
        message: `Event ${i}`,
        timestamp: new Date().toISOString(),
      };
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  })
  .listen(3002);
