import { createAxiomClient } from "@axiom/client";
import type { axiom } from "./index.js";

// 1. Create the client using only the server's type!
// For nextjs change the base url to point to your next capture all endpoint
const client = createAxiomClient<typeof axiom>("http://localhost:3000");

async function runTest() {
  console.log("Testing Axiom E2E Client...");

  try {
    // 2. This is 100% type-safe!
    // It knows "posts" exists, and returns { message: string }
    const posts = await client.posts.get();
    console.log("GET /posts:", posts.message);

    // 3. Handled dynamic params!
    // It knows it needs a "params" object with "id"
    const user = await client.users[":id"].get({
      params: { id: "123" },
    });
    console.log("GET /users/123:", user.id);

    // 4. Schema validation on the frontend!
    // It will complain if body is missing "name" or "age"!
    const postData = await client.test.post({
      body: {
        name: "John Doe",
        age: 25,
        email: "limo@gmail.com",
      },
    });

    const whoami = await client.auth.whoami.get();

    console.log("POST /test (Validated):", postData.email);
    console.log("GET /auth/whoami:", whoami);
  } catch (error) {
    console.error("Client Test Failed:", error);
  }
}

runTest();
