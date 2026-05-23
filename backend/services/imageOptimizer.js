import sharp
  from "sharp";

import logger
  from "../utils/logger.js";

/**
 * ---------------------------------------------------
 * Image Optimization Configuration
 * ---------------------------------------------------
 */

const MAX_IMAGE_WIDTH =
  1600;

const IMAGE_QUALITY =
  80;

/**
 * ---------------------------------------------------
 * Optimize Uploaded Image
 * ---------------------------------------------------
 *
 * Features:
 * - resize large images
 * - compress image
 * - convert to webp
 * - strip metadata
 * - memory buffer optimization
 */

export const optimizeImage =
  async (
    file
  ) => {

    try {

      /**
       * Validate buffer
       */
      if (
        !file?.buffer
      ) {

        throw new Error(
          "Missing image buffer"
        );
      }

      /**
       * Optimize image buffer
       */
      const optimizedBuffer =
        await sharp(

          file.buffer
        )

          /**
           * Auto rotate image
           */
          .rotate()

          /**
           * Resize large images
           */
          .resize({

            width:
              MAX_IMAGE_WIDTH,

            withoutEnlargement:
              true,
          })

          /**
           * Convert to webp
           */
          .webp({

            quality:
              IMAGE_QUALITY,
          })

          /**
           * Remove metadata
           */
          .withMetadata(false)

          /**
           * Return optimized buffer
           */
          .toBuffer();

      logger.success(
        "Image optimized successfully",

        {
          original:
            file.originalname,

          optimizedSize:
            optimizedBuffer.length,
        }
      );

      /**
       * Return optimized file
       */
      return {

        ...file,

        buffer:
          optimizedBuffer,

        mimetype:
          "image/webp",

        size:
          optimizedBuffer.length,
      };

    } catch (error) {

      logger.error(
        "Image optimization failed",

        {
          message:
            error.message,
        }
      );

      throw error;
    }
  };