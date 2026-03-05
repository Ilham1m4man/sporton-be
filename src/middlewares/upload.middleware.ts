import multer, { FileFilterCallback } from "multer";
import multerS3 from "multer-s3";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

// Setup S3 Client
export const s3 = new S3Client({
  region: process.env.AWS_S3_REGION || "ap-southeast-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || "";

// Storage: S3
const storage = multerS3({
  s3: s3,
  bucket: BUCKET_NAME,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileName = `uploads/${uniqueSuffix}${path.extname(file.originalname)}`;
    cb(null, fileName);
  },
});

// File filter (tetap sama)
const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed"));
  }
};

// Multer upload
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Helper: Delete file dari S3
export const deleteFromS3 = async (fileUrl: string) => {
  try {
    // Extract key dari URL
    // URL format: https://bucket.s3.region.amazonaws.com/uploads/xxx.jpg
    const url = new URL(fileUrl);
    const key = url.pathname.substring(1); // hilangkan leading "/"

    await s3.send(
      new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      })
    );
    console.log(`Deleted from S3: ${key}`);
  } catch (error) {
    console.error("Error deleting from S3:", error);
  }
};