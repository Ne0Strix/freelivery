import { Request } from 'express';
import fs from 'fs';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';

const UPLOADS_DIR = './uploads/dishes';

// Ensure upload directory exists on module load
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, UPLOADS_DIR);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${uniqueSuffix}${ext}`);
    },
});

const fileFilter = (
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extValid = allowedTypes.test(
        path.extname(file.originalname).toLowerCase()
    );
    const mimeValid = allowedTypes.test(file.mimetype.split('/')[1]);

    if (extValid && mimeValid) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

/** Multer middleware for single dish photo upload */
export const uploadDishPhoto = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter,
}).single('photo');

/** Get the relative URL path for a stored file */
export function getImageUrl(filename: string): string {
    return `/uploads/dishes/${filename}`;
}
