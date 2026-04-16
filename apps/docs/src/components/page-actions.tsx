"use client";

import { ChevronDown, Copy, ExternalLink, Github } from "lucide-react";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

// Simple SVG Icons for AI Models
const ChatGPTLogo = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 256 260"
    preserveAspectRatio="xMidYMid"
    className="flex-shrink-0"
  >
    <path
      fill="#fff"
      d="M239.184 106.203a64.716 64.716 0 0 0-5.576-53.103C219.452 28.459 191 15.784 163.213 21.74A65.586 65.586 0 0 0 52.096 45.22a64.716 64.716 0 0 0-43.23 31.36c-14.31 24.602-11.061 55.634 8.033 76.74a64.665 64.665 0 0 0 5.525 53.102c14.174 24.65 42.644 37.324 70.446 31.36a64.72 64.72 0 0 0 48.754 21.744c28.481.025 53.714-18.361 62.414-45.481a64.767 64.767 0 0 0 43.229-31.36c14.137-24.558 10.875-55.423-8.083-76.483Zm-97.56 136.338a48.397 48.397 0 0 1-31.105-11.255l1.535-.87 51.67-29.825a8.595 8.595 0 0 0 4.247-7.367v-72.85l21.845 12.636c.218.111.37.32.409.563v60.367c-.056 26.818-21.783 48.545-48.601 48.601Zm-104.466-44.61a48.345 48.345 0 0 1-5.781-32.589l1.534.921 51.722 29.826a8.339 8.339 0 0 0 8.441 0l63.181-36.425v25.221a.87.87 0 0 1-.358.665l-52.335 30.184c-23.257 13.398-52.97 5.431-66.404-17.803ZM23.549 85.38a48.499 48.499 0 0 1 25.58-21.333v61.39a8.288 8.288 0 0 0 4.195 7.316l62.874 36.272-21.845 12.636a.819.819 0 0 1-.767 0L41.353 151.53c-23.211-13.454-31.171-43.144-17.804-66.405v.256Zm179.466 41.695-63.08-36.63L161.73 77.86a.819.819 0 0 1 .768 0l52.233 30.184a48.6 48.6 0 0 1-7.316 87.635v-61.391a8.544 8.544 0 0 0-4.4-7.213Zm21.742-32.69-1.535-.922-51.619-30.081a8.39 8.39 0 0 0-8.492 0L99.98 99.808V74.587a.716.716 0 0 1 .307-.665l52.233-30.133a48.652 48.652 0 0 1 72.236 50.391v.205ZM88.061 139.097l-21.845-12.585a.87.87 0 0 1-.41-.614V65.685a48.652 48.652 0 0 1 79.757-37.346l-1.535.87-51.67 29.825a8.595 8.595 0 0 0-4.246 7.367l-.051 72.697Zm11.868-25.58 28.138-16.217 28.188 16.218v32.434l-28.086 16.218-28.188-16.218-.052-32.434Z"
    />
  </svg>
);

const ClaudeLogo = () => (
  <svg
    fill="currentColor"
    fillRule="evenodd"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    className="flex-shrink-0"
  >
    <path d="M13.827 3.52h3.603L24 20h-3.603l-6.57-16.48zm-7.258 0h3.767L16.906 20h-3.674l-1.343-3.461H5.017l-1.344 3.46H0L6.57 3.522zm4.132 9.959L8.453 7.687 6.205 13.48H10.7z" />
  </svg>
);

const GeminiLogo = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 296 298"
    fill="none"
    className="flex-shrink-0"
  >
    <mask
      id="gemini__a"
      width="296"
      height="298"
      x="0"
      y="0"
      maskUnits="userSpaceOnUse"
      style={{ maskType: "alpha" }}
    >
      <path
        fill="#3186FF"
        d="M141.201 4.886c2.282-6.17 11.042-6.071 13.184.148l5.985 17.37a184.004 184.004 0 0 0 111.257 113.049l19.304 6.997c6.143 2.227 6.156 10.91.02 13.155l-19.35 7.082a184.001 184.001 0 0 0-109.495 109.385l-7.573 20.629c-2.241 6.105-10.869 6.121-13.133.025l-7.908-21.296a184 184 0 0 0-109.02-108.658l-19.698-7.239c-6.102-2.243-6.118-10.867-.025-13.132l20.083-7.467A183.998 183.998 0 0 0 133.291 26.28l7.91-21.394Z"
      />
    </mask>
    <g mask="url(#gemini__a)">
      <ellipse cx="163" cy="149" fill="#fff" rx="196" ry="159" />
      <ellipse cx="33.5" cy="142.5" fill="#fff" rx="68.5" ry="72.5" />
      <path
        fill="#fff"
        d="M194 10.5C172 82.5 65.5 134.333 22.5 135L144-66l50 76.5Z"
      />
      <path
        fill="#fff"
        d="M194.5 279.5C172.5 207.5 66 155.667 23 155l121.5 201 50-76.5Z"
      />
    </g>
  </svg>
);

const CursorLogo = () => (
  <svg
    id="cursor_dark__Ebene_1"
    version="1.1"
    viewBox="0 0 466.73 532.09"
    width="14"
    height="14"
    className="flex-shrink-0"
    fill="#fff"
  >
    <path d="M457.43,125.94L244.42,2.96c-6.84-3.95-15.28-3.95-22.12,0L9.3,125.94c-5.75,3.32-9.3,9.46-9.3,16.11v247.99c0,6.65,3.55,12.79,9.3,16.11l213.01,122.98c6.84,3.95,15.28,3.95,22.12,0l213.01-122.98c5.75-3.32,9.3-9.46,9.3-16.11v-247.99c0-6.65-3.55-12.79-9.3-16.11h-.01ZM444.05,151.99l-205.63,356.16c-1.39,2.4-5.06,1.42-5.06-1.36v-233.21c0-4.66-2.49-8.97-6.53-11.31L24.87,145.67c-2.4-1.39-1.42-5.06,1.36-5.06h411.26c5.84,0,9.49,6.33,6.57,11.39h-.01Z" />
  </svg>
);

export function PageActions({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);
  const rawBase =
    "https://raw.githubusercontent.com/Lymore01/axeom/main/apps/docs/content/docs/";
  const githubBase =
    "https://github.com/Lymore01/axeom/blob/main/apps/docs/content/docs/";

  const rawLink = `${rawBase}${path}`;
  const githubLink = `${githubBase}${path}`;

  const promptText = `Read ${rawLink}, I want to ask questions about it.`;
  const encodedPrompt = encodeURIComponent(promptText);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(rawLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const aiModels = [
    {
      name: "ChatGPT",
      icon: <ChatGPTLogo />,
      url: `https://chatgpt.com/?q=${encodedPrompt}`,
    },
    {
      name: "Claude",
      icon: <ClaudeLogo />,
      url: `https://claude.ai/new?q=${encodedPrompt}`,
    },
    {
      name: "Gemini",
      icon: <GeminiLogo />,
      url: `https://gemini.google.com/app?q=${encodedPrompt}`,
    },
    { name: "Cursor", icon: <CursorLogo />, url: `cursor://open?file=${path}` },
  ];

  return (
    <div className="axeom-action-group">
      <button onClick={copyToClipboard} className="axeom-page-action">
        <Copy size={14} />
        {copied ? "Copied!" : "Copy MD"}
      </button>

      <Popover>
        <PopoverTrigger asChild>
          <button className="axeom-page-action">
            Open In
            <ChevronDown size={14} className="ml-1 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className="p-0 border-white/10 bg-black/95 backdrop-blur-xl"
        >
          <div className="flex flex-col p-1">
            <button
              onClick={copyToClipboard}
              className="flex items-center justify-between w-full px-3 py-2 text-xs text-white/60 hover:text-white hover:bg-white/5 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Copy size={16} />
                <span>Copy MD Link</span>
              </div>
            </button>

            <a
              href={githubLink}
              target="_blank"
              className="flex items-center justify-between w-full px-3 py-2 text-xs text-white/60 hover:text-white hover:bg-white/5 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Github size={16} />
                <span>GitHub</span>
              </div>
              <ExternalLink
                size={12}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </a>

            <div className="h-px bg-white/5 my-1" />

            {aiModels.map((model) => (
              <a
                key={model.name}
                href={model.url}
                target="_blank"
                className="flex items-center justify-between w-full px-3 py-2 text-xs text-white/60 hover:text-white hover:bg-white/5 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  {model.icon}
                  <span>{model.name}</span>
                </div>
                <ExternalLink
                  size={12}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </a>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
