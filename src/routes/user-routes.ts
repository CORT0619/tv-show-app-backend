import express, { Request, RequestHandler } from 'express';
import multer from 'multer';
import 'dotenv/config';
import * as user from '../user';
import * as db from '../db';
import * as fs from 'node:fs';
import { v4 as uuidv4 } from 'uuid';
import { uploadUserPhoto } from '../utils/aws';

const userRouter = express.Router();
const options = {
  fileSize: 20 * 1024 * 1024,
  files: 1
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/uploads/');
  },
  filename: (req, file, cb) => {
    const ext = file.originalname.split('.')[1];
    cb(null, `${uuidv4()}.${ext}`);
  }
});

const upload = multer({
  storage,
  limits: options,
  fileFilter: user.photoFilter
});

/* Upload user photo */
userRouter.post('/:userId/photo-upload', upload.single('likeness'), (async (
  req,
  res,
  next
) => {
  try {
    const { userId }: { userId: string } = req.params as { userId: string }; // TODO: add validation for userId
    const stream = fs.createReadStream(req.file?.path);
    const bucket = process.env?.S3BucketName;

    const response = await uploadUserPhoto(bucket, req.file.filename, stream);
    console.log('response ', response);

    if (response?.$metadata?.httpStatusCode === 200) {
      const url = `https://${bucket}.s3.amazonaws.com/${req.file?.filename}`;
      const imageResponse = await db.addUserImage(userId, url);
      console.log('imageResponse ', imageResponse);
    } //TODO: need to figure out s3 permissions for website access only

    return res.status(200).json('file upload successful!');
  } catch (err) {
    if (err instanceof multer.MulterError) {
      console.log('there was an error uploading the file!');
    }
    next(err);
  }
}) as RequestHandler);

/* Retrieve Refresh Token */
userRouter.post('/refresh', ((req: Request, res) => {
  // verify refresh token
  if (!(req.cookies as Record<string, string>).refresh_token)
    return res.status(403).json({ error: 'invalid token.' });
  const refreshToken = (req.cookies as Record<string, string>).refresh_token;
  const isValidRefreshToken = user.verifyToken(refreshToken, 'refresh');
  console.log('isValidRefreshToken ', isValidRefreshToken);
  // if () // TODO: need to make sure that payload is valid and make sure no errors for verify token
  // set new assess token
  // send new access token
}) as RequestHandler);

/* Add TvShow to User */

/* Update Episode Status */

/* Update User Profile */

export default userRouter;
