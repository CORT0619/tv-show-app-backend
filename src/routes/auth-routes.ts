import express, { RequestHandler } from 'express';
import { body } from 'express-validator';
import { Login, User } from '../models/user';
import * as db from '../db';
import { ErrorWithStatusCode } from '../models/errorwithstatuscode';
import * as user from '../user';

const authRouter = express.Router();

/* Account Registration */
authRouter.post(
  '/register',
  body('email').isEmail().notEmpty().trim().escape(),
  body('name').isString().notEmpty().trim().escape(),
  body('password').notEmpty().isString(),
  (async (req, res, next) => {
    const { name, email, password } = req.body as User;

    if (name && email && password) {
      try {
        const userFound = await db.locateUser(email);

        // no user found
        if (userFound && Object.values(userFound).length > 0) {
          throw new ErrorWithStatusCode(
            400,
            'this email address already exists.'
          );
        }

        const userId = user.generateId();

        const hashedPassword = await user.hashPassword(password);

        const newUser = await db.registerUser(
          userId,
          name,
          email,
          hashedPassword.hashed,
          hashedPassword.salt
        );
        console.log({ newUser });

        return res.status(200).json({ message: 'User created successfully!' });
      } catch (err) {
        next(err);
      }
    }

    return res
      .status(500)
      .json({ error: 'please include an email, name and password.' });
  }) as RequestHandler
);

/* Login */
authRouter.post(
  '/login',
  body('email').isEmail().notEmpty().trim().escape(),
  body('password').notEmpty().isString(),
  (async (req, res, next) => {
    const { email, password } = req.body as Login;

    if (email && password) {
      try {
        const userFound = await db.locateUser(email, {
          password: true,
          role: true
        });

        if (userFound && Object.keys(userFound).length > 0) {
          const dbPassword = userFound.password;

          // compare passwords
          const isValidPassword = await user.verifyPassword(
            password,
            dbPassword
          );

          if (!isValidPassword) {
            return res
              .status(404)
              .json({ error: 'Incorrect username or password.' });
          }

          const accessToken = user.signToken(
            'access',
            userFound.userId,
            '10m',
            userFound.role
          );

          const refreshToken = user.signToken(
            'refresh',
            userFound.userId,
            '1d'
          );

          return res
            .cookie('refresh_token', refreshToken, {
              httpOnly: true,
              sameSite: 'strict',
              maxAge: 24 * 60 * 60 * 1000
            })
            .status(201)
            .json({ accessToken, message: 'login successful!' });
        }
        return res
          .status(404)
          .json({ message: 'Incorrect username or password.' });
      } catch (err) {
        next(err);
      }
    }

    return res
      .status(400)
      .json({ error: 'please include an email and password.' });
  }) as RequestHandler
);

/* Logout */
// authRouter.post('/logout', async (req, res, next) => {});

export default authRouter;
