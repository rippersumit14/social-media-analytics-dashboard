import {
  test,
  expect,
} from "@playwright/test";

test.describe(
  "Error Handling",
  () => {
    test(
      "protected routes redirect unauthenticated users",
      async ({
        page,
      }) => {
        await page.goto(
          "/ai-chat"
        );

        await expect(page)
          .toHaveURL(
            /\/$/,
            {
              timeout: 10000,
            }
          );
      }
    );
  }
);