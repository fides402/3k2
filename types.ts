export enum Genre {
  SOUL = 'Soul',
  JAZZ = 'Jazz',
  OST = 'OST',
  FUNK = 'Funk',
  LIBRARY = 'Library Music',
  PSYCH = 'Psych Rock'
}

export enum Decade {
  D1960 = '1960-1969',
  D1970 = '1970-1979',
  D1980 = '1980-1989',
  DANY = 'Any Era'
}

export interface TrackData {
  artist: string;
  title: string;
  year: string;
  label: string;
  genre: string;
  description: string;
  youtubeId: string | null;
  youtubeUrl: string;
  country?: string;
  catalogNumber?: string;
}

export interface DigParams {
  genre: Genre;
  decade: Decade;
}