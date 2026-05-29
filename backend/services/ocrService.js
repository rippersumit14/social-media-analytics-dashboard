import Tesseract
  from "tesseract.js";

import logger
  from "../utils/logger.js";

/**
 * ---------------------------------------------------
 * OCR Configuration
 * ---------------------------------------------------
 */

/**
 * Maximum extracted text length
 *
 * Prevents:
 * - token explosion
 * - noisy OCR overload
 * - massive prompts
 */

const MAX_OCR_TEXT_LENGTH =
  4000;

/**
 * ---------------------------------------------------
 * Clean OCR Text
 * ---------------------------------------------------
 */

const cleanOCRText =
  (
    text = ""
  ) => {

    return text

      /**
       * Normalize spaces
       */
      .replace(/\s+/g, " ")

      /**
       * Remove invisible unicode chars
       */
      .replace(
        /[\u200B-\u200D\uFEFF]/g,
        ""
      )

      /**
       * Trim whitespace
       */
      .trim()

      /**
       * Limit OCR output size
       */
      .slice(
        0,
        MAX_OCR_TEXT_LENGTH
      );
  };

/**
 * ---------------------------------------------------
 * Extract Text From Image
 * ---------------------------------------------------
 *
 * Features:
 * - OCR extraction
 * - analytics screenshot parsing
 * - cleaned text output
 * - optimized AI-ready text
 */

export const extractTextFromImage =
  async (
    imageBuffer
  ) => {

    try {

      /**
       * Validate image buffer
       */
      if (!imageBuffer) {

        throw new Error(
          "Missing image buffer"
        );
      }

      logger.ai(
        "Starting OCR extraction"
      );

      /**
       * Run OCR recognition
       */
      const result =
        await Tesseract.recognize(

          imageBuffer,

          "eng",

          {

            /**
             * OCR progress logger
             *
             * Tesseract requires:
             * logger MUST be function
             */

            logger: (
              message
            ) => {

              if (

                process.env.NODE_ENV ===
                "development"

              ) {

                if (
                  message?.status
                ) {

                  console.log(

                    `[OCR] ${message.status}`
                  );
                }
              }
            },
          }
        );

      /**
       * Raw OCR output
       */
      const rawText =
        result?.data?.text || "";

      /**
       * Clean OCR text
       */
      const cleanedText =
        cleanOCRText(
          rawText
        );

      logger.success(
        "OCR extraction completed",

        {
          extractedLength:
            cleanedText.length,
        }
      );

      /**
       * Structured OCR response
       */
      return {

        extractedText:
          cleanedText,

        hasText:
          cleanedText.length > 0,
      };

    } catch (error) {

      logger.error(
        "OCR extraction failed",

        {
          message:
            error.message,
        }
      );

      throw error;
    }
  };