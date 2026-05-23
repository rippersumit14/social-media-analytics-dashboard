import sharp
  from "sharp";

import {
  optimizeImage,
} from "../../services/imageOptimizer.js";

/**
 * ---------------------------------------------------
 * Image Optimizer Tests
 * ---------------------------------------------------
 */

describe(
  "Image Optimizer",

  () => {

    test(
      "should optimize image successfully",

      async () => {

        /**
         * Create dummy image buffer
         */
        const imageBuffer =
          await sharp({

            create: {

              width: 1200,

              height: 800,

              channels: 3,

              background: {

                r: 255,
                g: 0,
                b: 0,
              },
            },
          })

            .jpeg()

            .toBuffer();

        /**
         * Mock multer file
         */
        const mockFile = {

          originalname:
            "test-image.jpg",

          mimetype:
            "image/jpeg",

          size:
            imageBuffer.length,

          buffer:
            imageBuffer,
        };

        /**
         * Optimize image
         */
        const optimized =
          await optimizeImage(
            mockFile
          );

        /**
         * Assertions
         */
        expect(
          optimized
        ).toBeDefined();

        expect(
          optimized.buffer
        ).toBeDefined();

        expect(
          optimized.mimetype
        ).toBe(
          "image/webp"
        );

        expect(
          optimized.size
        ).toBeLessThan(
          mockFile.size
        );
      }
    );

    test(
      "should throw error for missing buffer",

      async () => {

        const invalidFile = {

          originalname:
            "invalid.jpg",
        };

        await expect(

          optimizeImage(
            invalidFile
          )

        ).rejects.toThrow(
          "Missing image buffer"
        );
      }
    );
  }
);