import User from "../../models/User.js";
import { randomEmail } from "./testUtils.js";

export const createTestUser = async (
  overrides = {}
) => {
  const defaultUser = {
    name: "Test User",
    email: randomEmail(),
    password: "Password@123",
    ...overrides,
  };

  return User.create(defaultUser);
};
