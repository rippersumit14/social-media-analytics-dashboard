import { expect } from "@playwright/test";

/**
 * Stable AI message sender.
 */
export const sendChatMessage =
  async (
    page,
    message
  ) => {
    const input =
      page.getByTestId(
        "chat-input"
      );

    await expect(
      input
    ).toBeVisible();

    await input.fill(
      message
    );

    const sendButton =
      page.getByTestId(
        "send-button"
      );

    await expect(
      sendButton
    ).toBeEnabled();

    await sendButton.click();
  };