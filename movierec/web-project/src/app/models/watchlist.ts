export interface WatchlistItem {
  id: number;
  userId: number;
  movieId: number;
  status: 'watchlist' | 'watched';
}