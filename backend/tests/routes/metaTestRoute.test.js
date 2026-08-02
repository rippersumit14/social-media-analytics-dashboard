import {
  readFile,
} from "node:fs/promises";
import path from "node:path";

describe("debug route audit", () => {
  it("does not expose the removed /meta-test route in app.js", async () => {
    const appFile =
      await readFile(
        path.join(
          process.cwd(),
          "app.js"
        ),
        "utf8"
      );

    expect(appFile).not.toContain(
      "meta-test"
    );
  });
});
