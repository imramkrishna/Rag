import serverSecrets from "@/app/secrets/server";
import s3 from ".";

function buildFileKey(file: File) {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    return `${Date.now()}-${safeName}`;
}

async function uploadFile(file: File) {
    const bucket = serverSecrets.S3_BUCKET_NAME;
    if (!bucket) {
        throw new Error("S3 bucket name is not configured");
    }

    const key = buildFileKey(file);
    const body = Buffer.from(await file.arrayBuffer());

    const uploaded = await s3
        .upload({
            Bucket: bucket,
            Key: key,
            Body: body,
            ContentType: file.type || "application/octet-stream",
        })
        .promise();

    return uploaded.Location;
}

export default uploadFile;