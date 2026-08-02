export function parseSSEFrame(frame) {
  const event = {
    type: "message",
    data: "",
  };

  const dataLines = [];

  frame.split(/\r?\n/).forEach((line) => {
    if (!line || line.startsWith(":")) {
      return;
    }

    const separatorIndex = line.indexOf(":");
    const field = separatorIndex === -1 ? line : line.slice(0, separatorIndex);
    const rawValue = separatorIndex === -1 ? "" : line.slice(separatorIndex + 1);
    const value = rawValue.startsWith(" ") ? rawValue.slice(1) : rawValue;

    if (field === "event") {
      event.type = value || "message";
      return;
    }

    if (field === "data") {
      dataLines.push(value);
    }
  });

  event.data = dataLines.join("\n");

  return event;
}

export function createSSEParser(onEvent) {
  let buffer = "";

  return {
    push(chunk) {
      buffer += chunk;
      const frames = buffer.split(/\r?\n\r?\n/);
      buffer = frames.pop() || "";

      frames
        .map((frame) => frame.trimEnd())
        .filter(Boolean)
        .forEach((frame) => onEvent(parseSSEFrame(frame)));
    },

    flush() {
      const frame = buffer.trimEnd();
      buffer = "";

      if (frame) {
        onEvent(parseSSEFrame(frame));
      }
    },
  };
}
