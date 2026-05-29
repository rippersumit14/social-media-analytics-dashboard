import {
  test,
  expect,
} from "@playwright/test";

import { loginUser } from "../helpers/auth.helper.js";

import { sendChatMessage } from "../helpers/chat.helper.js";

test.describe(
  "AI Chat",
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

        await expect(page)
          .toHaveURL(
            /ai-chat/,
            {
              timeout: 15000,
            }
          );
      }
    );

    test(
      "chat page loads correctly",
      async ({
        page,
      }) => {
        await expect(
          page.getByTestId(
            "chat-input"
          )
        ).toBeVisible();

        await expect(
          page.getByTestId(
            "send-button"
          )
        ).toBeVisible();
      }
    );

    test(
      "user can send AI message",
      async ({
        page,
      }) => {
        const message =
          "Give analytics summary";

        await sendChatMessage(
          page,
          message
        );

        await expect(
          page.locator(
            `text=${message}`
          )
        ).toBeVisible();

        await expect(
          page.getByTestId(
            "chat-message-assistant"
          )
        ).toBeVisible({
          timeout: 30000,
        });
      }
    );

    test(
      "stream cancellation works",
      async ({
        page,
      }) => {
        await sendChatMessage(
          page,
          "Generate detailed analytics report"
        );

        const stopButton =
          page.getByTestId(
            "stop-stream-button"
          );

        await expect(
          stopButton
        ).toBeVisible({
          timeout: 10000,
        });

        await stopButton.click();

        await expect(
          stopButton
        ).not.toBeVisible({
          timeout: 10000,
        });
      }
    );
  }
);