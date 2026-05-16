import multer from "multer";

/**
 * memoryStorage stores uploaded file in RAM
 * Then we upload that buffer directly to cloudinary
 */

const storage = multer.memoryStorage();

const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];

const imageFileFilter = (req, file, cb) => {
    if(!allowedImageTypes.includes(file.mimetype)) {
        const error = new Error(
            "Invalid image type. Only JPG, PNG and WEBP are allowed"
        );
        error.statusCode = 400;
        return cb(error, false);
    }

    cb(null, true);
};

export const uploadImage = multer({
    storage,
    fileFilter: imageFileFilter,
    limits:{
        fileSize: 5 * 1024 * 1024,
    },
});
