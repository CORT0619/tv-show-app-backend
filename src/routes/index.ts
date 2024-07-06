import express, { NextFunction, Request, Response } from 'express';
import logger from '../utils/logger';
import userRouter from './user-routes';
import showRouter from './show-routes';
import { AxiosError } from 'axios';
import cookieParser from 'cookie-parser';
import * as config from '../../config.json';
import cors = require('cors');
import authRouter from './auth-routes';

const app = express();
const version = '/' + config.apiVersion;

app.use(cors<Request>());
app.use(express.json());
app.use(cookieParser());

app.use('/api' + version, authRouter);
app.use('/api' + version + '/users', userRouter);
app.use('/api' + version + '/shows', showRouter);

app.use('*', (req, res) => {
  res.status(404).json({ error: `route: ${req.url} does not exist.` });
});

app.use(errorHandler);

function errorHandler(
  err: AxiosError,
  req: Request,
  res: Response,
  next: NextFunction // eslint-disable-line @typescript-eslint/no-unused-vars
) {
  // console.log('error handler ', err.toJSON());
  if (err) {
    logger.log('error', err);
    const code = parseInt(err.code);
    if (code >= 400 && code < 500) {
      const message = err.message || 'There was an error with the request.';
      return res.status(code).json({ error: message });
    }

    if (code >= 500) {
      const message = err?.message || 'There was an error on the server.';
      return res.status(code).json({ error: message });
    }

    return res.status(code).json({ error: 'An error has occurred.' });
  }
}

export default app;
