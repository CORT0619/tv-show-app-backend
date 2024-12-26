import request from 'supertest';
import router from '../routes';
import * as showApi from '../tvshow/tvshowapi';
import { Episode, /*Show, */ ShowStatus, TvShow } from '../models/tvshow';
import { AxiosError } from 'axios';

const app = router;
const req = request(app);

describe('GET api/v1/shows ', () => {
  it('should return an array of tv show results', async () => {
    const tvShows1 = {} as unknown as TvShow,
      tvshows2 = {} as unknown as TvShow;
    tvShows1.id = 1234;
    tvShows1.name = 'Superman';
    tvshows2.id = 4567;
    tvshows2.name = 'Lois and Superman';
    const response = [tvShows1, tvshows2];

    const objResponse = new Object();
    objResponse['shows'] = response;

    const spy = jest.spyOn(showApi, 'searchTvShows');
    spy.mockResolvedValue(response);

    try {
      const res = await req.get('/api/v1/shows').query({ name: 'superman' });
      expect(res.status).toBe(200);
      expect(res.body).toStrictEqual(objResponse);
    } catch (err) {
      console.log('err ', err);
    }
  });

  it('should throw an error ', async () => {
    const spy = jest
      .spyOn(showApi, 'searchTvShows')
      .mockRejectedValue(new AxiosError('an error has occurred.', '400'));

    try {
      const res = await req.get('/api/v1/shows').query({ name: 1232 });
      expect(res.status).toEqual(400);
      expect(spy).toHaveBeenCalled();
      expect(res.text).toStrictEqual('There was an error with the request.');
    } catch (err) {
      // console.log('err ', err)
    }
  });

  // it('should return only page 1 of results', async () => {});
});

describe('GET api/v1/shows/popular', () => {
  // it('should return an array of popular tvshows', async () => {
  //   const resArray = [
  //     {
  //       id: 1234,
  //       name: 'NCIS',
  //       overview:
  //         'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse hendrerit consequat nibh gravida mollis. Praesent semper urna purus, vitae iaculis turpis euismod eu. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  //       poster_path: 'https://picsum.photos/seed/picsum/200/300',
  //       vote_average: 7.6,
  //       first_air_date: '2024-01-01'
  //     },
  //     {
  //       id: 4567,
  //       name: 'The Blacklist',
  //       overview:
  //         'hasellus hendrerit elementum sagittis. Fusce sed suscipit lorem, sit amet sollicitudin urna. Curabitur massa ipsum, efficitur quis consequat ut, laoreet ac magna. Donec dictum viverra dolor eget sollicitudin.',
  //       poster_path: 'https://picsum.photos/200/300?grayscale',
  //       vote_average: 7.6,
  //       first_air_date: '2024-01-02'
  //     }
  //   ] as any as Show[];
  //   const spy = jest
  //     .spyOn(showApi, 'getPopularShows')
  //     .mockResolvedValue(resArray);

  //   try {
  //     const response = await req.get('/api/v1/shows/popular');

  //     expect(spy).toHaveBeenCalled();
  //     expect(response.status).toEqual(200);
  //     expect(response.body).toStrictEqual(resArray);
  //   } catch (error) {
  //     console.log('error ', error);
  //   }
  // });

  it('should return an error ', async () => {
    const spy = jest
      .spyOn(showApi, 'getPopularShows')
      .mockRejectedValue(new AxiosError('an error occured.', '500'));

    try {
      const errResponse = await req.get('/api/v1/shows/popular');

      expect(spy).toHaveBeenCalled();
      expect(errResponse.status).toEqual(500);
      expect(errResponse.text).toStrictEqual(
        'There was an error on the server.'
      );
    } catch (err) {
      // console.log('error ', err);
    }
  });
});

describe('GET /api/v1/shows/:showId', () => {
  it('should return an object with full show information', async () => {
    const mockedResponse = {
      id: 12345,
      name: 'Cold Case',
      status: ShowStatus.Running
    } as unknown as TvShow;

    const spy = jest
      .spyOn(showApi, 'retrieveShowInformation')
      .mockResolvedValue(mockedResponse);

    try {
      const res = await req.get('/api/v1/shows/:showId');
      expect(res.status).toEqual(200);
      expect(res.body).toStrictEqual(mockedResponse);
      expect(spy).toHaveBeenCalled();
    } catch (error) {
      console.log('test err ', error);
    }
  });

  it('should return a 404 with an error message', async () => {
    const spy = jest
      .spyOn(showApi, 'retrieveShowInformation')
      .mockRejectedValue(
        new AxiosError('There was some weird error on your end.', '404')
      );

    try {
      const res = await req.get('/api/v1/shows/:showId');
      expect(res.status).toEqual(404);
      expect(res.text).toStrictEqual('There was an error with the request.');
      expect(spy).toHaveBeenCalled();
    } catch (error) {
      // console.log('test err ', error);
    }
  });
});

describe('GET api/v1/shows/:showId/series/:seriesId/episodes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return an array of episodes of a tvshow', async () => {
    const mocked = [
      {
        id: 949393,
        name: 'All Rise',
        url: 'https://www.tvmaze.com/episodes/1669455/all-rise-1x01-pilot',
        summary:
          'Integer egestas pellentesque tellus ac commodo. Nulla ut ornare sem. In scelerisque mauris quis dui ultricies sagittis. Morbi faucibus suscipit iaculis. Curabitur at volutpat enim. In semper sapien sit amet mattis cursus. Vivamus a imperdiet mauris.'
      }
    ] as unknown as Episode[];
    const spy = jest
      .spyOn(showApi, 'retrieveShowEpisodes')
      .mockResolvedValue(mocked);

    const obj = new Object();
    obj['episodes'] = mocked;

    try {
      const res = await req.get(
        '/api/v1/shows/:showId/series/:seriesId/episodes'
      );
      expect(spy).toHaveBeenCalled();
      expect(res.status).toEqual(200);
      expect(res.body).toStrictEqual(obj);
    } catch (err) {
      console.log('err ', err);
    }
  });

  it('should return an error message with an error status code ', async () => {
    const spy = jest
      .spyOn(showApi, 'retrieveShowEpisodes')
      .mockRejectedValue(new AxiosError('You typed something weirdly.', '400'));

    try {
      const res = await req.get(
        '/api/v1/shows/:showId/series/:seriesId/episodes'
      );
      expect(res.status).toEqual(400);
      expect(res.text).toStrictEqual('There was an error with the request.');
      expect(spy).toHaveBeenCalledTimes(1);
    } catch (err) {
      // console.log('error ', err);
    }
  });
});
