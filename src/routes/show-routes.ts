import express, { RequestHandler } from 'express';
import { param, query, validationResult } from 'express-validator';
import { escape } from 'node:querystring';
import * as showApi from '../tvshow/tvshowapi';
import { paginateRecords } from '../utils';
import { TransformedShow } from '../models/tvshow';
import * as redis from '../redis';

const showRouter = express.Router();

/* Search for tv shows */
showRouter.get('/', query('name').notEmpty(), (async (req, res, next) => {
  // TODO: need to handle errors better - 404
  const validated = validationResult(req);

  const { size, page, name } = req.query as {
    size: string;
    page: string;
    name: string;
  };

  if (name) {
    const recordSize = parseInt(size) ?? 10;
    const requestedPage = parseInt(page);

    if (validated.array().length) {
      return res.json({ error: 'Please supply the name of a tvshow.' });
    }

    const escapedShow = escape(name.trim());

    try {
      const results = await showApi.searchTvShows(escapedShow);

      const paginatedResponse = paginateRecords(
        results,
        recordSize,
        requestedPage
      );

      return res.status(200).json(paginatedResponse);
    } catch (err) {
      next(err);
    }
  }

  res.status(400).json({ error: 'Please supply the name of a tvshow.' });
}) as RequestHandler);

/* Get Popular Shows */
showRouter.get('/popular', (async (req, res, next) => {
  let response: TransformedShow[];
  const { size, page } = req.query as { size: string; page: string };

  const recordSize = (size ? parseInt(size) : undefined) ?? 10;
  const requestedPage = parseInt(page);

  try {
    const shows = await redis.getPopularShows();
    if (shows) {
      response = shows;
    } else {
      response = await showApi.getPopularShows();
      await redis.setPopularShows(response);
    }

    const paginatedResponse = paginateRecords(
      response,
      recordSize,
      requestedPage
    );
    return res.status(200).send(paginatedResponse);
  } catch (err) {
    next(err);
  }
}) as RequestHandler);

/* Retrieve Individual Show Information */
showRouter.get('/:showId', param('showId').notEmpty().escape().isInt(), (async (
  req,
  res,
  next
) => {
  const validated = validationResult(req);

  if (validated.array().length) {
    return res.json({
      error:
        'an error occurred with the showId. Please ensure you enter a valid numeric showId.'
    });
  }

  const { showId } = req.params;

  try {
    const response = await showApi.retrieveShowInformation(showId);
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}) as RequestHandler);

/* Retrieve all episodes for a particular show series */
showRouter.get(
  '/:showId/series/:seriesId/episodes',
  param('seriesId').notEmpty().escape().isInt(),
  (async (req, res, next) => {
    const validated = validationResult(req);

    if (validated.array().length) {
      return res.json({
        error:
          'an error occurred with the seriesId. Please make sure you enter a valid numeric seriesId.'
      });
    }

    const { seriesId } = req.params;
    const { size, page } = req.query as { size: string; page: string };
    const recordSize = (size ? parseInt(size) : undefined) ?? 10;
    const requestedPage = parseInt(page);

    try {
      const episodes = await showApi.retrieveShowEpisodes(seriesId);
      const paginatedResponse = paginateRecords(
        episodes,
        recordSize,
        requestedPage
      );
      res.status(200).json({ episodes: paginatedResponse });
    } catch (err) {
      // console.log('err ', err.toJSON());
      next(err);
    }
  }) as RequestHandler
);

export default showRouter;
