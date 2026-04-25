import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Movie } from '../models/movie';

const API = 'http://localhost:8000/api';

@Injectable({ providedIn: 'root' })
export class MovieService {
  constructor(private http: HttpClient) {}

  private mapMovie(m: any): Movie {
    return {
      id: m.id,
      title: m.title,
      titleRu: m.title_ru,
      titleKz: m.title_kz,
      genres: m.genres,
      year: m.year,
      description: m.description,
      descriptionRu: m.description_ru,
      descriptionKz: m.description_kz,
      rating: m.rating,
      poster: m.poster,
      trailerId: m.trailer_id,
    };
  }

  getMovies(): Observable<Movie[]> {
    return this.http.get<any[]>(`${API}/movies/`).pipe(
      map(movies => movies.map(m => this.mapMovie(m)))
    );
  }

  getMovieById(id: number): Observable<Movie> {
    return this.http.get<any>(`${API}/movies/${id}/`).pipe(
      map(m => this.mapMovie(m))
    );
  }
}