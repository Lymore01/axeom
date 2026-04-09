"use client";

import { createAxeomClient } from "@axeom/client";
import { useEffect, useState } from "react";
import type { App } from "./api/axeom/[[...slug]]/route";

const client = createAxeomClient<App>("/api/axeom");

export default function Home() {
  const [status, setStatus] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [response, setResponse] = useState<any>(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    client.get().then(setStatus);

    const eventSource = new EventSource("/api/axeom/stream");
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setLogs((prev) => [`[${data.time}] ${data.data}`, ...prev].slice(0, 10));
    };

    return () => eventSource.close();
  }, []);

  const handleRunRequest = async () => {
    setIsPending(true);
    try {
      const res = await client.projects.post({
        body: {
          name: "Axeom Portal",
          priority: "high",
          metadata: { tags: ["next", "axeom"], is_public: true },
        },
      });
      setResponse(res);
    } catch (e: any) {
      setResponse({ error: e.message });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#0c0c0cff",
        color: "#ededed",
        minHeight: "100vh",
        fontFamily: "'Inter', monospace",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <nav
        style={{
          height: "60px",
          borderBottom: "1px solid #1a1a1a",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 1.5rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div
            style={{
              background: "#3b82f6",
              width: "12px",
              height: "12px",
              borderRadius: "50%",
            }}
          />
          <span
            style={{
              fontWeight: 800,
              fontSize: "0.9rem",
              letterSpacing: "1px",
            }}
          >
            AXEOM RUNTIME v1.0
          </span>
        </div>
        <div style={{ fontSize: "0.8rem", color: "#666" }}>
          STATUS:{" "}
          <span style={{ color: "#4ade80" }}>
            {status?.status || "OFFLINE"}
          </span>
        </div>
      </nav>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <div
          style={{
            flex: 1,
            borderRight: "1px solid #1a1a1a",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ padding: "1.5rem" }}>
            <div style={{ display: "flex", gap: "10px", marginBottom: "2rem" }}>
              <div
                style={{
                  color: "#4ade80",
                  fontWeight: "bold",
                  fontSize: "0.8rem",
                }}
              >
                POST
              </div>
              <div style={{ color: "#888", fontSize: "0.8rem" }}>
                /api/axeom/projects
              </div>
            </div>

            <h3
              style={{
                fontSize: "0.75rem",
                color: "#666",
                textTransform: "uppercase",
                marginBottom: "1rem",
              }}
            >
              Request Body
            </h3>
            <pre
              style={{
                backgroundColor: "#0a0a0a",
                padding: "1rem",
                borderRadius: "6px",
                border: "1px solid #1a1a1a",
                fontSize: "0.85rem",
                color: "#3b82f6",
              }}
            >
              {`{
  "name": "Axeom Portal",
  "priority": "high",
  "metadata": {
    "tags": ["next", "axeom"],
    "is_public": true
  }
}`}
            </pre>

            <button
              onClick={handleRunRequest}
              disabled={isPending}
              style={{
                marginTop: "2rem",
                width: "100%",
                padding: "0.75rem",
                backgroundColor: "#fff",
                color: "#000",
                fontWeight: "bold",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                fontSize: "0.85rem",
              }}
            >
              {isPending ? "RUNNING..." : "SEND REQUEST"}
            </button>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            backgroundColor: "#020202",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ padding: "1.5rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "1rem",
              }}
            >
              <h3
                style={{
                  fontSize: "0.75rem",
                  color: "#666",
                  textTransform: "uppercase",
                }}
              >
                Response
              </h3>
              {response && (
                <span style={{ color: "#4ade80", fontSize: "0.75rem" }}>
                  200 OK
                </span>
              )}
            </div>

            <div
              style={{
                flex: 1,
                padding: "1rem",
                backgroundColor: "#080808",
                border: "1px solid #111",
                borderRadius: "6px",
                minHeight: "400px",
                overflowY: "auto",
              }}
            >
              {response ? (
                <pre
                  style={{ fontSize: "0.85rem", color: "#4ade80", margin: 0 }}
                >
                  {JSON.stringify(response, null, 2)}
                </pre>
              ) : (
                <div style={{ color: "#333", fontSize: "0.85rem" }}>
                  No response yet. Send a request to see output.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <footer
        style={{
          height: "200px",
          borderTop: "1px solid #1a1a1a",
          backgroundColor: "#050505",
          padding: "1rem",
          overflowY: "hidden",
        }}
      >
        <div
          style={{
            fontSize: "0.7rem",
            color: "#444",
            marginBottom: "0.5rem",
            fontWeight: "bold",
          }}
        >
          ENGINE CONSOLE
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {logs.map((log, i) => (
            <div
              key={i}
              style={{ fontSize: "0.75rem", color: i === 0 ? "#fff" : "#555" }}
            >
              {log}
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}
