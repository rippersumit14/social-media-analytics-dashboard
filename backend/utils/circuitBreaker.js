/**
 * ---------------------------------------------------
 * Circuit Breaker Configuration
 * ---------------------------------------------------
 */

/**
 * Failures before provider disabled
 */
const FAILURE_THRESHOLD =
  3;

/**
 * Cooldown duration
 * 2 minutes
 */
const COOLDOWN_MS =
  2 * 60 * 1000;

/**
 * ---------------------------------------------------
 * Provider States
 * ---------------------------------------------------
 */

const providerStates =
  new Map();

/**
 * ---------------------------------------------------
 * Initialize Provider State
 * ---------------------------------------------------
 */

const initializeProvider =
  (providerName) => {

    if (
      !providerStates.has(
        providerName
      )
    ) {

      providerStates.set(

        providerName,

        {
          failures: 0,

          status: "CLOSED",

          lastFailureTime: null,
        }
      );
    }

    return providerStates.get(
      providerName
    );
  };

/**
 * ---------------------------------------------------
 * Check Provider Availability
 * ---------------------------------------------------
 */

export const isProviderAvailable =
  (providerName) => {

    const state =
      initializeProvider(
        providerName
      );

    /**
     * CLOSED
     * Provider healthy
     */
    if (
      state.status ===
      "CLOSED"
    ) {

      return true;
    }

    /**
     * OPEN
     * Provider temporarily disabled
     */
    if (
      state.status ===
      "OPEN"
    ) {

      const now =
        Date.now();

      const cooldownExpired =

        now -
        state.lastFailureTime >=
        COOLDOWN_MS;

      /**
       * Cooldown complete
       */
      if (
        cooldownExpired
      ) {

        state.status =
          "HALF_OPEN";

        return true;
      }

      return false;
    }

    /**
     * HALF_OPEN
     * Testing provider recovery
     */
    return true;
  };

/**
 * ---------------------------------------------------
 * Record Provider Success
 * ---------------------------------------------------
 */

export const recordProviderSuccess =
  (providerName) => {

    const state =
      initializeProvider(
        providerName
      );

    state.failures = 0;

    state.status =
      "CLOSED";

    state.lastFailureTime =
      null;
  };

/**
 * ---------------------------------------------------
 * Record Provider Failure
 * ---------------------------------------------------
 */

export const recordProviderFailure =
  (providerName) => {

    const state =
      initializeProvider(
        providerName
      );

    state.failures += 1;

    state.lastFailureTime =
      Date.now();

    /**
     * Open breaker
     */
    if (
      state.failures >=
      FAILURE_THRESHOLD
    ) {

      state.status =
        "OPEN";

      console.warn(

        `[CIRCUIT_BREAKER] Provider disabled: ${providerName}`
      );
    }
  };

/**
 * ---------------------------------------------------
 * Get Provider State
 * ---------------------------------------------------
 */

export const getProviderState =
  (providerName) => {

    return initializeProvider(
      providerName
    );
  };