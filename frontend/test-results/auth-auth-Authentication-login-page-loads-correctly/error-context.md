# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth/auth.spec.js >> Authentication >> login page loads correctly
- Location: tests/auth/auth.spec.js:14:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByTestId('email-input')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByTestId('email-input')

```

# Test source

```ts
  1   | import {
  2   |   test,
  3   |   expect,
  4   | } from "@playwright/test";
  5   | 
  6   | import { TEST_USER } from "../utils/testUser.js";
  7   | 
  8   | test.describe(
  9   |   "Authentication",
  10  |   () => {
  11  |     /**
  12  |      * Login page renders.
  13  |      */
  14  |     test(
  15  |       "login page loads correctly",
  16  |       async ({
  17  |         page,
  18  |       }) => {
  19  |         await page.goto("/");
  20  | 
  21  |         await expect(
  22  |           page.getByTestId(
  23  |             "email-input"
  24  |           )
> 25  |         ).toBeVisible();
      |           ^ Error: expect(locator).toBeVisible() failed
  26  | 
  27  |         await expect(
  28  |           page.getByTestId(
  29  |             "password-input"
  30  |           )
  31  |         ).toBeVisible();
  32  | 
  33  |         await expect(
  34  |           page.getByTestId(
  35  |             "login-button"
  36  |           )
  37  |         ).toBeVisible();
  38  |       }
  39  |     );
  40  | 
  41  |     /**
  42  |      * Successful login.
  43  |      */
  44  |     test(
  45  |       "successful login",
  46  |       async ({
  47  |         page,
  48  |       }) => {
  49  |         await page.goto("/");
  50  | 
  51  |         await page
  52  |           .getByTestId(
  53  |             "email-input"
  54  |           )
  55  |           .fill(
  56  |             TEST_USER.email
  57  |           );
  58  | 
  59  |         await page
  60  |           .getByTestId(
  61  |             "password-input"
  62  |           )
  63  |           .fill(
  64  |             TEST_USER.password
  65  |           );
  66  | 
  67  |         await page
  68  |           .getByTestId(
  69  |             "login-button"
  70  |           )
  71  |           .click();
  72  | 
  73  |         await expect(page)
  74  |           .toHaveURL(
  75  |             /dashboard/,
  76  |             {
  77  |               timeout: 15000,
  78  |             }
  79  |           );
  80  |       }
  81  |     );
  82  | 
  83  |     /**
  84  |      * Invalid credentials.
  85  |      */
  86  |     test(
  87  |       "invalid credentials error",
  88  |       async ({
  89  |         page,
  90  |       }) => {
  91  |         await page.goto("/");
  92  | 
  93  |         await page
  94  |           .getByTestId(
  95  |             "email-input"
  96  |           )
  97  |           .fill(
  98  |             "wrong@test.com"
  99  |           );
  100 | 
  101 |         await page
  102 |           .getByTestId(
  103 |             "password-input"
  104 |           )
  105 |           .fill(
  106 |             "wrongpassword"
  107 |           );
  108 | 
  109 |         await page
  110 |           .getByTestId(
  111 |             "login-button"
  112 |           )
  113 |           .click();
  114 | 
  115 |         await expect(
  116 |           page.locator(
  117 |             "text=Invalid"
  118 |           )
  119 |         ).toBeVisible({
  120 |           timeout: 10000,
  121 |         });
  122 |       }
  123 |     );
  124 |   }
  125 | );
```