import Redis from 'ioredis';
import 'dotenv/config';
import { PopularTvShow } from '../models/tvshow';

const connectionUrl = process.env.CACHE_DB_URL;

const renderRedis = new Redis(connectionUrl);

/**
 * Sets the popular tv shows in cache
 * @param shows PopularTvShow[]
 * @returns Promise<void>
 */
export async function setPopularShows(shows) {
  await renderRedis.set(
    'popularShows',
    JSON.stringify(shows),
    'EX',
    60 * 60 * 24
  );
}

/**
 * Retrieves the popular tv shows from the cache
 * @returns Promise<PopularTvShow[]>
 */
export async function getPopularShows(): Promise<PopularTvShow[]> {
  const shows = await renderRedis.get('popularShows');
  console.log('shows ', shows);
  return JSON.parse(shows) as PopularTvShow[];
}
