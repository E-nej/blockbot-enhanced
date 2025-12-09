import { useEffect, useRef } from "react";
import scratchblocks from "scratchblocks";

export function BlockIcon({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (!code || typeof code !== "string") return;

    const trimmed = code.trim();
    if (!trimmed) return;

    const uniqueClass = `blocks-${Math.random().toString(36).slice(2, 8)}`;
    const pre = document.createElement("pre");
    pre.className = `blocks ${uniqueClass}`;

    pre.textContent = trimmed;

    ref.current.innerHTML = "";
    ref.current.appendChild(pre);

    try {
      // render only this instance by targeting the unique class
      scratchblocks.renderMatching(`pre.${uniqueClass}`, {
        style: "scratch3",
        languages: ["en"],
        scale: 1,
      });
    } catch (err) {
      console.error("Scratchblocks render error:", err, "code:", code);
      ref.current.innerHTML = "<!-- invalid block -->";
    }
  }, [code]);

  return <div ref={ref} />;
}
