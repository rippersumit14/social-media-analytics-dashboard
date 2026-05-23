/**
 * ---------------------------------------------------
 * Retry Async Operation
 * ---------------------------------------------------
 */

export const retryAsyncOperation =
  async (

    operation,

    retries = 2,

    delayMs = 1000
  ) => {

    let lastError;

    for (
      let attempt = 1;
      attempt <= retries + 1;
      attempt++
    ) {

      try {

        return await operation();

      } catch (error) {

        lastError = error;

        /**
         * Last attempt failed
         */
        if (
          attempt ===
          retries + 1
        ) {
          break;
        }

        /**
         * Retry delay
         */
        await new Promise(

          (resolve) =>

            setTimeout(
              resolve,
              delayMs
            )
        );
      }
    }

    throw lastError;
  };