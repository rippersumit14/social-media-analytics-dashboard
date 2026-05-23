import AppError from "../utils/AppError.js";

//centralized request validationg middleware 
const validateRequest = (schema) => {
    return (req, res, next) => {
        //Validate request body using Zod schema 
        const result = schema.safeParse(req.body);

        //validation failed
        if(!result.success){
            //Extract readable error messages 
            const errors = result.errors.errors.map((err) => ({
                field: err.path.join("."),
                message: err.message,
            }));

            return next(
                new AppError(
                    errors[0]?.message || "Validation failed",
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