import Axeom from "axeom";

const axeom = new Axeom()
  .get("/", () => {
    return {
      message: "Axeom running on Deno! 🦕",
      runtime: "deno",
      version: Deno.version.deno,
    };
  })
  .get("/api/v1", () => ({ status: "OK" }));

axeom.listen(3002);
