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
 * - auto rotate
 * - resize large images
 * - convert to webp
 * - remove metadata
 * - reduce memory usage
 * - OCR-safe optimization
 */

export const optimizeImage =
  async (
    file
  ) => {

    try {

      /**
       * Validate uploaded file
       */

      if (
        !file?.buffer
      ) {

        throw new Error(
          "Missing image buffer"
        );
      }

      /**
       * Create sharp instance
       */

      const imageProcessor =
        sharp(
          file.buffer,

          {

            /**
             * Prevent malformed image crashes
             */

            failOn:
              "none",

            /**
             * Better animated image handling
             */

            animated:
              false,
          }
        );

      /**
       * Read image metadata
       */

      const metadata =
        await imageProcessor.metadata();

      /**
       * Optimize image
       */

      const optimizedBuffer =
        await imageProcessor

          /**
           * Auto rotate image
           */

          .rotate()

          /**
           * Resize oversized images
           */

          .resize({

            width:
              MAX_IMAGE_WIDTH,

            fit:
              "inside",

            withoutEnlargement:
              true,
          })

          /**
           * Convert to optimized webp
           */

          .webp({

            quality:
              IMAGE_QUALITY,

            effort:
              4,
          })

          /**
           * Remove metadata
           */

          .withMetadata(false)

          /**
           * Generate optimized buffer
           */

          .toBuffer();

      /**
       * Optimized response object
       */

      const optimizedFile = {

        ...file,

        buffer:
          optimizedBuffer,

        mimetype:
          "image/webp",

        size:
          optimizedBuffer.length,

        width:
          metadata.width || null,

        height:
          metadata.height || null,

        format:
          "webp",
      };

      logger.success(

        "Image optimized successfully",

        {

          originalName:
            file.originalname,

          originalSize:
            file.size,

          optimizedSize:
            optimizedBuffer.length,

          width:
            metadata.width,

          height:
            metadata.height,
        }
      );

      return optimizedFile;

    } catch (error) {

      logger.error(

        "Image optimization failed",

        {

          fileName:
            file?.originalname,

          message:
            error.message,
        }
      );

      throw error;
    }
  };