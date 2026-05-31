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
 * Maximum OCR text length
 *
 * Prevents:
 * - token explosion
 * - noisy OCR overload
 * - huge prompts
 */

const MAX_OCR_TEXT_LENGTH =
  4000;

/**
 * OCR timeout protection
 */

const OCR_TIMEOUT_MS =
  45000;

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
       * Normalize whitespace
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
       * Limit OCR length
       */

      .slice(

        0,

        MAX_OCR_TEXT_LENGTH
      );
  };

/**
 * ---------------------------------------------------
 * OCR Timeout Wrapper
 * ---------------------------------------------------
 */

const withTimeout =
  (
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
                  "OCR extraction timeout exceeded"
                )
              ),

            timeoutMs
          )
      ),
    ]);
  };

/**
 * ---------------------------------------------------
 * Extract Text From Image
 * ---------------------------------------------------
 *
 * Features:
 * - OCR extraction
 * - analytics parsing
 * - AI-ready text cleanup
 * - timeout safety
 * - multimodal enhancement
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
        await withTimeout(

          Tesseract.recognize(

            imageBuffer,

            "eng",

            {

              /**
               * Tesseract progress logger
               */

              logger:
                (
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
          ),

          OCR_TIMEOUT_MS
        );

      /**
       * Extract raw OCR text
       */

      const rawText =
        result?.data?.text || "";

      /**
       * Clean OCR output
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

      /**
       * Never break AI chat flow
       * because OCR failed
       */

      return {

        extractedText:
          "",

        hasText:
          false,
      };
    }
  };