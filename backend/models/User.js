import mongoose, { Mongoose } from "mongoose";
import bcrypt from "bcryptjs";
import { lowercase, minLength } from "zod";

//User plans 
export const USER_PLANS = {
    FREE: "FREE",
    PRO: "PRO",
};

//User schema

const userSchema = new mongoose.Schema(
    {
        //Full name 
        name:{
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minLength: 2,
            maxLength: 50,
        },

        //Email address
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
             match: [
        /^\S+@\S+\.\S+$/,
        "Please provide a valid email address",
      ],
        },


        //Hashed password
        password: {
            type: String,
            required: [true, "Password is required"],
            minLength: 6,
            select: false,
        },

        //User Profile Image
        avatar: {
            type: String,
            default: "",
            trim: true,
        },

        //Subscription plan
        plan: {
            type: String,
            enum: Object.values(USER_PLANS),
            default: USER_PLANS.FREE,
        },

        //Daily ai usage count 
        aiUsageCount: {
            type: Number,
            default: 0,
            min: 0,
        },

        //Daily Usage Reset Date
        aiUsageResetDate: {
            type: Date,
            default: Date.now,

        },

        //Soft delete support 
        isActive:{
            type: Boolean,
            default: true,
        },

        //Last logi tracking
        lastLoginAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,

    }
);


//adding the password hashing middleware
userSchema.pre("save", async function (params) {
    if(!this.isModified("password")) return;

    const salt = await bcrypt.genSalt(12);
    //the more higher the value, the larger the time get to be salted and more cpu operations performed

    this.password = await bcrypt.hash(
        this.password,
        salt
    );
});

//Compare passwords 
userSchema.methods.comparePassword = 
   async function (enteredPassword) {
    return bcrypt.compare(
        enteredPassword,
        this.password
    );
  };

//Reset AI Usage
userSchema.method.resetAIUsage = 
   function() {
    this.aiUsageCount = 0,
    this.aiUsageResetDate = new Date();
   }

//Hide internal fields 
userSchema.set("toJSON", {
    transform: (_, ret) => {
        delete ret.password;
        delete ret.__v;

        return ret;
    },
});

//Model export 

const User = mongoose.model(
    "User",
    userSchema
);

export default User;



