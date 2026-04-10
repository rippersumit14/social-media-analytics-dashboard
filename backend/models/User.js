import moongose from "mongoose";
import byrypt from "bcryptjs";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

/**
 * User schema for authentication and user management
 * Stores Basic user information and hashed password
 */

const userSchema = new moongose.Schema(
    {
        name:{
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },
        //user-email
        email:{
            type: String,
            required: [true, "Email is required"],
            unique: true,
            trim: true,
            lowercase: true,
            index: true,
        },
        //password
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: 6,
        }
    },
    {
        timestamps: true,
    }
);


/**
 * Hash password before saving user document.
 * This runs only when the password field is modified.
 */

userSchema.pre("save", async function (next){
    if (!this.isModified("password")){
        next();
        return;
    }
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

/**
 * Compare entered password with hashed password stored in database.
 * @param {string} enteredPassword - Raw password entered by user
 * @returns {Promise<boolean>}
 */

userSchema.methods.matchPassword = async function name (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
    
};

const User = mongoose("User", userSchema);

//export the user 
export default User;

