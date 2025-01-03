export interface TvShowResults {
  score: number;
  show: TvShow;
}

// TODO: change this
export enum ShowStatus {
  'Ended',
  'To Be Determined',
  'Running'
}

export interface TvShow {
  id: number;
  externals: {
    tvrage: number | null;
    thetvdb: number;
    imdb: string;
  };
  url: string;
  name: string;
  status: ShowStatus;
  summary: string;
  image: {
    medium: string;
    original: string;
  };
  ended: string; // TODO: maybe make into date
  schedule: {
    time: string;
    days: string[];
  };
  network: {
    name: string;
  };
  _embedded: {
    episodes: Episode[];
    cast: Cast[];
  };
}

export interface PopularTvShow {
  id: number;
  name: string;
  overview: string;
  image_path: string;
  vote_average: number;
  first_air_date: string;
  // cacheExpiration: string; // TODO: determine correct type
}

export interface FullTvShowInfo extends TvShow {
  cast: Cast;
  episodes: Episode[];
}

export interface Cast {
  // id: number;
  // name: string;
  // image: {
  // 	medium: string;
  // 	original: string;
  // }
  person: {
    id: number;
    url: string;
    name: string;
    image: string;
  };
  character: {
    id: number;
    url: string;
    name: string;
    image: string;
  };
}

export interface Episode {
  id: number;
  name: string;
  url: string;
  season: number;
  number: number;
  airdate: string; // TODO: should this be a date?
  summary: string;
}

export interface PopularShows {
  results: Show[];
}

// type backdrop_path = string;

export interface Show {
  overview: string;
  id: number;
  name: string;
  // image_path: backdrop_path;
  poster_path: string;
  vote_average: number;
  first_air_date: string; // TODO: another type?
}

export interface TransformedShow {
  overview: string;
  id: number;
  name: string;
  image_path: string;
  vote_average: number;
  first_air_date: string; // TODO: another type?
}
