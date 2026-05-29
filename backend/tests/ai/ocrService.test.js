import sharp
  from "sharp";

import {
  extractTextFromImage,
} from "../../services/ocrService.js";

/**
 * ---------------------------------------------------
 * OCR Service Tests
 * ---------------------------------------------------
 */

describe(
  "OCR Service",

  () => {

    test(
      "should process image buffer",

      async () => {

        /**
         * Create dummy image
         */
        const imageBuffer =
          await sharp({

            create: {

              width: 500,

              height: 300,

              channels: 3,

              background: {

                r: 255,
                g: 255,
                b: 255,
              },
            },
          })

            .png()

            .toBuffer();

        const result =
          await extractTextFromImage(

            imageBuffer
          );

        expect(
          result
        ).toBeDefined();

        expect(
          result
        ).toHaveProperty(
          "extractedText"
        );

        expect(
          result
        ).toHaveProperty(
          "hasText"
        );
      },
      30000
    );

    test(
      "should fail on missing buffer",

      async () => {

        await expect(

          extractTextFromImage()

        ).rejects.toThrow(
          "Missing image buffer"
        );
      }
    );
  }
);