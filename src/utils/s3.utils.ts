import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3, BUCKET_NAME } from "../middlewares/upload.middleware";

// Extract S3 key dari full URL
// https://sporton-media.s3.ap-southeast-1.amazonaws.com/uploads/123.jpg
// → uploads/123.jpg
const extractKeyFromUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname.substring(1); // hilangkan leading "/"
  } catch {
    return url; // kalau udah berupa key langsung
  }
};

// Generate presigned URL (default 1 jam, sama kayak Django kamu)
export const generatePresignedUrl = async (
  fileUrl: string,
  expiresIn: number = 3600,
): Promise<string> => {
  const key = extractKeyFromUrl(fileUrl);

  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return await getSignedUrl(s3, command, { expiresIn });
};