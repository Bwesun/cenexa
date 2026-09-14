import multer from "multer";
import path from "path";
import fs from "fs";

// Upload directory
const uploadDir = path.join(process.cwd(), "uploads");

// Create uploads folder if it doesn't exist
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, uploadDir);
    },

    filename(req, file, cb) {
        const ext = path.extname(file.originalname);

        const filename =
            `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

        cb(null, filename);
    },
});

// Only allow CSV files
const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    if (ext !== ".csv") {
        return cb(new Error("Only CSV (.csv) files are allowed."), false);
    }

    cb(null, true);
};

// Export upload middleware
const upload = multer({

    storage,

    fileFilter,

    limits: {

        // Maximum upload size = 5MB
        fileSize: 5 * 1024 * 1024,

        // Only one file
        files: 1,
    },

});

export default upload;