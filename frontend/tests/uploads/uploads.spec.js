import {
  test,
  expect,
} from "@playwright/test";

import path from "path";

import { loginUser } from "../helpers/auth.helper.js";

test.describe(
  "Image Uploads",
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
      "image upload preview works",
      async ({
        page,
      }) => {
        const imagePath =
          path.resolve(
            "tests/fixtures/images/Screenshot 2025-12-02 171533.png"
          );

        const fileInput =
          page.locator(
            "input[type='file']"
          );

        await fileInput.setInputFiles(
          imagePath
        );

        await expect(
          page.locator(
            "text=Selected Images"
          )
        ).toBeVisible();

        await expect(
          page.locator(
            "img"
          ).first()
        ).toBeVisible();
      }
    );
  }
);