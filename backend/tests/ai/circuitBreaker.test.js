import {

  isProviderAvailable,

  recordProviderFailure,

  recordProviderSuccess,

  getProviderState,

} from "../../utils/circuitBreaker.js";

/**
 * ---------------------------------------------------
 * Circuit Breaker Tests
 * ---------------------------------------------------
 */

describe(
  "Circuit Breaker",

  () => {

    test(
      "should open breaker after failures",

      () => {

        const provider =
          "groq-test";

        /**
         * Trigger failures
         */
        recordProviderFailure(
          provider
        );

        recordProviderFailure(
          provider
        );

        recordProviderFailure(
          provider
        );

        const state =
          getProviderState(
            provider
          );

        expect(
          state.status
        ).toBe(
          "OPEN"
        );

        expect(
          isProviderAvailable(
            provider
          )
        ).toBe(false);
      }
    );

    test(
      "should reset on success",

      () => {

        const provider =
          "openrouter-test";

        recordProviderFailure(
          provider
        );

        recordProviderSuccess(
          provider
        );

        const state =
          getProviderState(
            provider
          );

        expect(
          state.status
        ).toBe(
          "CLOSED"
        );

        expect(
          state.failures
        ).toBe(0);
      }
    );
  }
);