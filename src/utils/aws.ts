import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Readable } from 'node:stream';
import 'dotenv/config';

const client = new S3Client({ region: process.env.aws_region });

export async function uploadUserPhoto(
  s3bucket: string,
  imageName: string,
  image: string | Uint8Array | Buffer | Readable
) {
  const put = new PutObjectCommand({
    Bucket: s3bucket,
    Key: imageName, // should be associated with the user, need to return something to insert in the database
    Body: image // the image
  });

  try {
    const uploadResponse = await client.send(put);
    console.log('uploadResponse ', uploadResponse);
    return uploadResponse;
  } catch (error) {
    throw new Error(
      'An error has occurred uploading the photo to the s3 bucket. ' +
        JSON.stringify(error)
    );
  }
}
