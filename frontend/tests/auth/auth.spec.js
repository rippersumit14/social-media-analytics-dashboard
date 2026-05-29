import {
  test,
  expect,
} from "@playwright/test";

import { TEST_USER } from "../utils/testUser.js";

test.describe(
  "Authentication",
  () => {
    /**
     * Login page renders.
     */
    test(
      "login page loads correctly",
      async ({
        page,
      }) => {
        await page.goto("/");

        await expect(
          page.getByTestId(
            "email-input"
          )
        ).toBeVisible();

        await expect(
          page.getByTestId(
            "password-input"
          )
        ).toBeVisible();

        await expect(
          page.getByTestId(
            "login-button"
          )
        ).toBeVisible();
      }
    );

    /**
     * Successful login.
     */
    test(
      "successful login",
      async ({
        page,
      }) => {
        await page.goto("/");

        await page
          .getByTestId(
            "email-input"
          )
          .fill(
            TEST_USER.email
          );

        await page
          .getByTestId(
            "password-input"
          )
          .fill(
            TEST_USER.password
          );

        await page
          .getByTestId(
            "login-button"
          )
          .click();

        await expect(page)
          .toHaveURL(
            /dashboard/,
            {
              timeout: 15000,
            }
          );
      }
    );

    /**
     * Invalid credentials.
     */
    test(
      "invalid credentials error",
      async ({
        page,
      }) => {
        await page.goto("/");

        await page
          .getByTestId(
            "email-input"
          )
          .fill(
            "wrong@test.com"
          );

        await page
          .getByTestId(
            "password-input"
          )
          .fill(
            "wrongpassword"
          );

        await page
          .getByTestId(
            "login-button"
          )
          .click();

        await expect(
          page.locator(
            "text=Invalid"
          )
        ).toBeVisible({
          timeout: 10000,
        });
      }
    );
  }
);