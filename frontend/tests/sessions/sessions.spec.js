import {
  test,
  expect,
} from "@playwright/test";

import { loginUser } from "../helpers/auth.helper.js";

import { sendChatMessage } from "../helpers/chat.helper.js";

test.describe(
  "Chat Sessions",
  () => {
    test.beforeEach(
      async ({
        page,
      }) => {
        await loginUser(
          page
        );

        await page.goto(
          "/ai-chat"
        );
      }
    );

    test(
      "new session appears in sidebar",
      async ({
        page,
      }) => {
        const message =
          "Create session test";

        await sendChatMessage(
          page,
          message
        );

        await expect(
          page.locator(
            `text=${message}`
          )
        ).toBeVisible({
          timeout: 30000,
        });
      }
    );
  }
);