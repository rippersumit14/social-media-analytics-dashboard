function renderInline(text) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={index} className="rounded bg-ink-950/5 px-1.5 py-0.5 text-[0.9em]">
          {part.slice(1, -1)}
        </code>
      );
    }

    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    return part;
  });
}

// Lightweight markdown-safe rendering for chat responses without introducing HTML injection risk.
export function MarkdownText({ content }) {
  const blocks = String(content || "").split(/\n{2,}/);

  return (
    <div className="space-y-3">
      {blocks.map((block, index) => {
        if (block.startsWith("```") && block.endsWith("```")) {
          return (
            <pre key={index} className="overflow-x-auto rounded-lg bg-ink-950 p-3 text-sm text-white">
              <code>{block.replace(/^```[a-zA-Z]*\n?/, "").replace(/```$/, "")}</code>
            </pre>
          );
        }

        if (block.trim().startsWith("- ")) {
          return (
            <ul key={index} className="list-disc space-y-1 pl-5">
              {block.split("\n").map((line, lineIndex) => (
                <li key={lineIndex}>{renderInline(line.replace(/^- /, ""))}</li>
              ))}
            </ul>
          );
        }

        return (
          <p key={index} className="whitespace-pre-wrap">
            {renderInline(block)}
          </p>
        );
      })}
    </div>
  );
}
