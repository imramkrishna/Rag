import "dotenv/config"
export const serverSecrets={
    S3_BUCKET_NAME:process.env.S3_BUCKET_NAME,
    S3_API_ENDPOINT:process.env.S3_API_ENDPOINT,
    S3_ACCESS_KEY_ID:process.env.S3_ACCESS_KEY_ID,
    S3_SECRET_ACCESS_KEY:process.env.S3_SECRET_ACCESS_KEY,
    DATABASE_URL:process.env.DATABASE_URL,
    BETTER_AUTH_URL:process.env.BETTER_AUTH_URL,
    BETTER_AUTH_SECRET:process.env.BETTER_AUTH_SECRET,
    S3_PUBLIC_URL:process.env.S3_PUBLIC_URL
}

export default serverSecrets;