/**
 * OCR Service
 *
 * Purpose:
 * - Extract text from uploaded images
 * - Optimize OCR performance
 * - Prevent server overload
 * - Keep AI image analysis scalable
 *
 * Stack:
 * - Tesseract.js
 *
 * Notes:
 * - OCR runs locally
 * - No paid vision API needed
 * - Perfect for screenshots/analytics
 */

import Tesseract from "tesseract.js";

/**
 * Maximum OCR characters
 *
 * Prevents:
 * - huge prompts
 * - token explosion
 * - memory waste
 */
const MAX_OCR_TEXT_LENGTH = 4000;

/**
 * OCR timeout
 *
 * Prevents hanging workers.
 */
const OCR_TIMEOUT_MS = 20000;

/**
 * Clean extracted OCR text
 */
const cleanOCRText = (
  text = ""
) => {
  return text
    /**
     * Remove excessive whitespace
     */
    .replace(/\s+/g, " ")

    /**
     * Remove weird characters
     */
    .replace(
      /[^\x20-\x7E\n]/g,
      ""
    )

    /**
     * Trim
     */
    .trim()

    /**
     * Limit size
     */
    .slice(
      0,
      MAX_OCR_TEXT_LENGTH
    );
};

/**
 * Timeout wrapper
 */
const withTimeout = (
  promise,
  timeoutMs
) => {
  return Promise.race([
    promise,

    new Promise(
      (_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error(
                "OCR timeout exceeded"
              )
            ),
          timeoutMs
        )
    ),
  ]);
};

/**
 * Extract OCR text from image buffer
 */
export const extractTextFromImage =
  async (imageBuffer) => {
    try {
      if (!imageBuffer) {
        return "";
      }

      /**
       * OCR processing
       */
      const ocrPromise =
        Tesseract.recognize(
          imageBuffer,

          /**
           * English language
           */
          "eng",

          {
            /**
             * Disable excessive logging
             */
            logger: () => {},
          }
        );

      /**
       * Timeout protected OCR
       */
      const result =
        await withTimeout(
          ocrPromise,
          OCR_TIMEOUT_MS
        );

      /**
       * Extract text
       */
      const rawText =
        result?.data?.text ||
        "";

      /**
       * Clean text
       */
      const cleanedText =
        cleanOCRText(
          rawText
        );

      return cleanedText;
    } catch (error) {
      console.error(
        "[OCR_EXTRACTION_ERROR]",
        {
          message:
            error.message,

          stack:
            error.stack,
        }
      );

      /**
       * Never crash AI flow
       */
      return "";
    }
  };