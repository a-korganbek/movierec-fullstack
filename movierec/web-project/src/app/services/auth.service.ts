import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

const API = 'http://localhost:8000/api';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'auth_token';
  private usernameKey = 'current_user';

  constructor(private http: HttpClient) {}

  register(username: string, email: string, password: string): Observable<any> {
    return this.http.post(`${API}/auth/register/`, { username, email, password }).pipe(
      tap((res: any) => this.saveSession(res))
    );
  }

  login(identifier: string, password: string): Observable<any> {
    return this.http.post(`${API}/auth/login/`, { identifier, password }).pipe(
      tap((res: any) => this.saveSession(res))
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${API}/auth/logout/`, {}).pipe(
      tap(() => this.clearSession())
    );
  }

  private saveSession(res: any): void {
    localStorage.setItem(this.tokenKey, res.token);
    localStorage.setItem(this.usernameKey, res.username);
  }

  private clearSession(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.usernameKey);
  }

  isLoggedIn(): boolean { return !!localStorage.getItem(this.tokenKey); }
  getToken(): string | null { return localStorage.getItem(this.tokenKey); }
  getCurrentUser(): string | null { return localStorage.getItem(this.usernameKey); }
}