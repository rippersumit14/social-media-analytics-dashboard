// services/ocrService.js

/**
 * ---------------------------------------------------
 * OCR Service
 * ---------------------------------------------------
 *
 * Purpose:
 * - Extract text from uploaded images
 * - Prevent AI token explosion
 * - Keep OCR orchestration isolated
 * - Protect backend from hanging OCR jobs
 *
 * Stack:
 * - Tesseract.js
 */

import Tesseract from "tesseract.js";

import AppError from "../utils/AppError.js";

/**
 * ---------------------------------------------------
 * OCR Configuration
 * ---------------------------------------------------
 */

/**
 * Maximum OCR text length
 *
 * Prevents:
 * - massive prompts
 * - token explosion
 * - memory waste
 */
const MAX_OCR_TEXT_LENGTH = 4000;

/**
 * OCR timeout duration
 *
 * Prevents hanging OCR workers
 */
const OCR_TIMEOUT_MS = 20000;

/**
 * ---------------------------------------------------
 * Clean OCR Extracted Text
 * ---------------------------------------------------
 *
 * Removes:
 * - excessive whitespace
 * - malformed characters
 * - unnecessary prompt noise
 */

const cleanOCRText = (
    text = ""
) => {

    return text

        /**
         * Normalize whitespace
         */
        .replace(/\s+/g, " ")

        /**
         * Remove unsupported characters
         */
        .replace(
            /[^\x20-\x7E\n]/g,
            ""
        )

        /**
         * Trim surrounding spaces
         */
        .trim()

        /**
         * Limit prompt size
         */
        .slice(
            0,
            MAX_OCR_TEXT_LENGTH
        );
};

/**
 * ---------------------------------------------------
 * Promise Timeout Wrapper
 * ---------------------------------------------------
 *
 * Prevents OCR from hanging forever
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
                            new AppError(
                                "OCR timeout exceeded",
                                408
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
 * Main OCR orchestration function
 */

export const extractTextFromImage =
    async (
        imageBuffer
    ) => {

        try {

            /**
             * Empty image protection
             */
            if (!imageBuffer) {

                return "";
            }

            /**
             * OCR recognition promise
             */
            const ocrPromise =
                Tesseract.recognize(

                    imageBuffer,

                    /**
                     * OCR language
                     */
                    "eng",

                    {

                        /**
                         * Disable verbose OCR logs
                         */
                        logger: () => {},
                    }
                );

            /**
             * Timeout-protected OCR execution
             */
            const result =
                await withTimeout(
                    ocrPromise,
                    OCR_TIMEOUT_MS
                );

            /**
             * Extract raw OCR text
             */
            const rawText =
                result?.data?.text || "";

            /**
             * Clean extracted text
             */
            const cleanedText =
                cleanOCRText(
                    rawText
                );

            return cleanedText;

        } catch (error) {

            /**
             * OCR failure logging
             */
            console.error(
                "[OCR_EXTRACTION_ERROR]",
                {
                    message:
                        error.message,

                    stack:
                        process.env.NODE_ENV ===
                        "development"
                            ? error.stack
                            : undefined,
                }
            );

            /**
             * Never crash AI orchestration
             *
             * OCR is treated as
             * optional enhancement layer.
             */
            return "";
        }
    };