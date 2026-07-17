import Secrets from "@/app/secrets";
import { S3 } from "aws-sdk";

const s3 = new S3({
  region: "auto",
  endpoint: Secrets.S3_API_ENDPOINT,
  accessKeyId: Secrets.S3_ACCESS_KEY_ID,
  secretAccessKey: Secrets.S3_SECRET_ACCESS_KEY,
});


export default s3;
