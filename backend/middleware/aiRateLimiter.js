import rateLimit from "express-rate-limit";

//Ai rate limiter 
//Restricts how often AI inshights can be requested 

const aiRateLimiter = rateLimit({
    windowMs: 60 * 100, //1 minute
    max: 5, //5 requests per minute
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Too many Ai requests, Please wait a miunte and try again.",
    },
});

export default aiRateLimiter;
