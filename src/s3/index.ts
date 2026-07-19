import { S3 } from "aws-sdk";
import serverSecrets from "@/app/secrets/server";
const s3 = new S3({
  region: "auto",
  endpoint: serverSecrets.S3_API_ENDPOINT,
  accessKeyId: serverSecrets.S3_ACCESS_KEY_ID,
  secretAccessKey: serverSecrets.S3_SECRET_ACCESS_KEY,
});


export default s3;
