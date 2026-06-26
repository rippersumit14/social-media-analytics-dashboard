import request from "supertest";
import app from "../config/testServer.js";
import { createTestUser } from "./factory.js";

/**
 * Create Authenticated user 
 * 
 * - Creates a test user 
 * - Login using the API
 * - Returned authenticated user 
 * - Return JWT token
 */

export const createAuthenticatedUser = async(
    overrides = {}
) => {
    //-Create User 
    const {
        user,
        password,
    } = await createTestUser(
        overrides
    );

    //Login

    const response = 
      await request(app)

       .post("/api/auth/login")

       .send({
        email: 
          user.email,

        password,
       });

    //Verify Login

    if(
        response.status !== 200
    ){
        throw new Error(
            "Unable to authenticate test user."
        );
    }

    //Extract JWT 

    const token = 
      response.body 
        ?.data
        ?.token;

    /**
     * Return authentication
     */

    return {
        user,

        token,

        password,
    };
};

