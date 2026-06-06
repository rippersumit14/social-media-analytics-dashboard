import crypto from "crypto";
import redis from "../config/redis.js";
import AppError from "../utils/AppError.js";

/**
 * --------------------------------------------------
 * OAuth State Configuration
 * --------------------------------------------------
 *
 * Purpose:
 * Securely map an OAuth request
 * back to the authenticated user.
 *
 * Example:
 *
 * UUID
 *   ↓
 * Redis
 *   ↓
 * UserId
 *
 * TTL:
 * 10 minutes
 *
 */

const OAUTH_STATE_TTL = 600; //600 => 600 seconds -> 10 min

/**
 * --------------------------------------------------
 * Create OAuth State
 * --------------------------------------------------
 *
 * Generates:
 * Random UUID
 *
 * Stores:
 * oauth:<uuid> -> userId
 *
 * Expires:
 * 10 minutes
 *
 */

export const createOAuthState = 
  async (userId) => {

    /**
     * Generate cryptographically
     * secure UUID
     */

    const state = crypto.randomUUID();

    /**
     * Store mapping
     * 
     * oauth: uuid -> userId
     * 
     * EX = expiration in seconds
     */

    await redis.set(
        `oauth:${state}`,
        userId,
        "EX",
        OAUTH_STATE_TTL
    );

    return state;
  };

  /**
   * 
   * Get user from oatuh state
   * 
   * used during:
   * Instagram callback
   * 
   * state _> Redis _> UserId
   */

export const getUserIdFromState = 
  async (state) => {

    const userId = 
      await redis.get(
        `oauth:${state}`
      );

    if(!userId){
        throw new AppError(
            "Invalid or expired OAuth state",
            400
        );
    }

    return userId;
  }


/**
 * Delete oauth state
 * 
 * called after:
 * Successful OAuth completion
 * 
 * Prevents state reuse attacks
 */

export const deleteOAuthState = 
  async (state) => {

    await redis.del(
        `oauth:${state}`
    );
  };



