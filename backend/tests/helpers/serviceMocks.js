/**
 * --------------------------------------------------
 * Service Mock Registry
 * --------------------------------------------------
 *
 * Central place for reusable Jest mocks
 * used by service layer tests.
 *
 * NOTE:
 * This file DOES NOT mock modules.
 *
 * Each service test will use
 * jest.unstable_mockModule(...)
 * with these mock functions.
 */

import { jest } from "@jest/globals";

/**
 * --------------------------------------------------
 * Email Service
 * --------------------------------------------------
 */

export const sendVerificationEmailMock =
  jest.fn();

/**
 * --------------------------------------------------
 * Cloudinary
 * --------------------------------------------------
 */

export const uploadImageMock =
  jest.fn();

export const deleteImageMock =
  jest.fn();

/**
 * --------------------------------------------------
 * Instagram Graph API
 * --------------------------------------------------
 */

export const exchangeCodeForTokenMock =
  jest.fn();

export const fetchInstagramProfileMock =
  jest.fn();

export const fetchInstagramMediaMock =
  jest.fn();

export const fetchInstagramInsightsMock =
  jest.fn();

/**
 * --------------------------------------------------
 * AI Providers
 * --------------------------------------------------
 */

export const groqChatMock =
  jest.fn();

export const geminiChatMock =
  jest.fn();

export const togetherChatMock =
  jest.fn();

export const openRouterChatMock =
  jest.fn();

/**
 * --------------------------------------------------
 * OCR
 * --------------------------------------------------
 */

export const extractTextMock =
  jest.fn();

/**
 * --------------------------------------------------
 * Queue
 * --------------------------------------------------
 */

export const addJobMock =
  jest.fn();

/**
 * --------------------------------------------------
 * Redis
 * --------------------------------------------------
 */

export const redisGetMock =
  jest.fn();

export const redisSetMock =
  jest.fn();

export const redisDeleteMock =
  jest.fn();

/**
 * --------------------------------------------------
 * Helper
 * --------------------------------------------------
 *
 * Clears every mock before a test.
 */

export const resetServiceMocks =
  () => {

    jest.resetAllMocks();

  };