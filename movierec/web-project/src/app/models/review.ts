export interface Review {
  id: number;
  movieId: number;
  user: string;
  rating: number;
  comment: string;
  date?: string;
}