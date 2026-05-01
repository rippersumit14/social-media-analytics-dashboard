import multer from "multer";

/**
 * Multer upload middleware for AI Chat image uploads.
 *
 * We use memoryStorage because:
 * - We do not need to permanently store the image yet.
 * - The image will be available as req.file.buffer.
 * - Later we can convert this buffer to base64 and send it to a vision model.
 */

const storage = multer.memoryStorage();

//allowing only the images files 

const fileFilter = (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
        return cb(new Error("only the image files are allowed"), false);
    }

    cb(null, true);
}

//upload config
//image size limit: 5MB
//single image upload only

export const uploadImage = multer({
    storage,
    fileFilter,
    limits:{
        fileSize: 5 * 1024 * 1024,
    },

});