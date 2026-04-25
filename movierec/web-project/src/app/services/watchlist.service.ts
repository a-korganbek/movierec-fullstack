import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API = 'http://localhost:8000/api';

@Injectable({ providedIn: 'root' })
export class WatchlistService {
  constructor(private http: HttpClient) {}

  getWatchlist(): Observable<any[]> {
    return this.http.get<any[]>(`${API}/watchlist/?status=watchlist`);
  }

  getWatched(): Observable<any[]> {
    return this.http.get<any[]>(`${API}/watchlist/?status=watched`);
  }

  getStatus(movieId: number): Observable<{ status: string }> {
    return this.http.get<{ status: string }>(`${API}/watchlist/${movieId}/status/`);
  }

  addToWatchlist(movieId: number): Observable<any> {
    return this.http.post(`${API}/watchlist/`, { movie_id: movieId, status: 'watchlist' });
  }

  markAsWatched(movieId: number): Observable<any> {
    return this.http.patch(`${API}/watchlist/${movieId}/`, { status: 'watched' });
  }

  removeFromWatchlist(movieId: number): Observable<any> {
    return this.http.delete(`${API}/watchlist/${movieId}/`);
  }
}