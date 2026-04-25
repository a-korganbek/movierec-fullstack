import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Review } from '../models/review';

const API = 'http://localhost:8000/api';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  constructor(private http: HttpClient) {}

  getReviewsByMovieId(movieId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${API}/movies/${movieId}/reviews/`);
  }

  addReview(movieId: number, rating: number, comment: string): Observable<Review> {
    return this.http.post<Review>(`${API}/movies/${movieId}/reviews/`, { rating, comment });
  }

  deleteReview(reviewId: number): Observable<void> {
    return this.http.delete<void>(`${API}/reviews/${reviewId}/`);
  }
}