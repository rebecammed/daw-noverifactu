import { S3Client } from "@aws-sdk/client-s3";

export const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});
console.log("R2 endpoint:", process.env.R2_ENDPOINT);
console.log("R2 key:", process.env.R2_ACCESS_KEY_ID);
console.log("R2 secret:", process.env.R2_SECRET_ACCESS_KEY ? "OK" : "MISSING");
