import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config as configDotenv } from "dotenv";

configDotenv();

const BUCKET_NAME = process.env.BUCKET_NAME;
const BUCKET_REGION = process.env.BUCKET_REGION;
const ACCESS_KEY_ID = process.env.ACCESS_KEY;
const SECRET_ACCESS_KEY = process.env.SECRET_ACCESS_KEY;

const s3 = new S3Client({
    region: BUCKET_REGION,
    credentials: {
        accessKeyId: ACCESS_KEY_ID,
        secretAccessKey: SECRET_ACCESS_KEY,
    },
});

export async function generatePresignedUrl(user) {
    const GetObjectParams = {
        Bucket: BUCKET_NAME,
        Key: user.imageName,
    };
    const command = new GetObjectCommand(GetObjectParams);

    try {
        const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
        return { userId: user._id, imageUrl: url };
    } catch (error) {
        console.error(`Error generating pre-signed URL for user ${user._id}:`, error);
        return null;
    }
}