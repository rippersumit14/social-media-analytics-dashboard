import AppError from "../utils/AppError.js";

const formatPath = (path = []) => {
    if (!Array.isArray(path) || path.length === 0) {
        return "body";
    }

    return path
        .map((part) => String(part))
        .join(".");
};

//centralized request validation middleware
const validateRequest = (schema) => {
    return (req, res, next) => {
        //Validate request body using Zod schema
        const result = schema.safeParse(req.body);

        //validation failed
        if(!result.success){
            //Extract readable error messages from Zod v4 issues.
            const errors = result.error.issues.map((err) => ({
                field: formatPath(err.path),
                message: err.message,
            }));

            const message = errors.length
                ? `Validation failed: ${errors
                    .map((err) => `${err.field}: ${err.message}`)
                    .join("; ")}`
                : "Validation failed";

            return next(
                new AppError(
                    message,
                    400
                )
            );
        }

        //Replace request body with sanitized validate data
        req.body = result.data;

        next();
    }
}

export default validateRequest
