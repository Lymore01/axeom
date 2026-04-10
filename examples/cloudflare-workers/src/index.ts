import { swagger } from "@axeom/swagger";
import Axeom, { logger } from "axeom";

const axeom = new Axeom()
  .use(swagger({ info: { title: "Axeom Cloudflare Workers API" } }))
  .use(logger())
  .get("/", () => {
    return {
      message: "Hello from Cloudflare Workers!",
      runtime: "workerd",
      region: "edge",
    };
  })
  .get("/env", (_ctx) => {
    return {
      message: "Access environment variables directly in Cloudflare!",
    };
  });

export default {
  async fetch(request: Request, _env: any, _ctx: any): Promise<Response> {
    return axeom.handle(request);
  },
};
