import { expect } from "@playwright/test";

import { TEST_USER } from "../utils/testUser.js";

/**
 * Stable login helper.
 */
export const loginUser =
  async (
    page,
    credentials =
      TEST_USER
  ) => {
    await page.goto("/");

    await page
      .locator(
        "input[name='email']"
      )
      .fill(
        credentials.email
      );

    await page
      .locator(
        "input[name='password']"
      )
      .fill(
        credentials.password
      );

    await page
      .getByRole(
        "button",
        {
          name: "Login",
        }
      )
      .click();

    /**
     * Wait for protected route.
     */
    await expect(page)
      .toHaveURL(
        /dashboard/,
        {
          timeout: 15000,
        }
      );
  };