import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';

import { Movie } from '../../models/movie';
import { WatchlistService } from '../../services/watchlist.service';
import { AuthService } from '../../services/auth.service';
import { LanguageService, Lang } from '../../services/language.service';

const TRANSLATIONS: Record<Lang, Record<string, string>> = {
  EN: {
    movies: 'Movies', watchlist: 'Watchlist', account: 'Account', history: 'History', logout: 'Logout', login: 'Login',
    savedMovies: 'Saved Movies', watchedMovies: 'Watched Movies',
    open: 'Open', remove: 'Remove',
    emptyWatchlist: 'Your watchlist is empty',
    emptyWatchlistText: 'You have not saved any movies yet. Start exploring and add some favorites.',
    emptyWatched: 'No watched movies yet',
    emptyWatchedText: 'Mark movies as watched to see them here.',
    browseMovies: 'Browse Movies',
    moviesCount: 'movies',
  },
  RU: {
    movies: 'Фильмы', watchlist: 'Список', account: 'Аккаунт', history: 'История', logout: 'Выйти', login: 'Войти',
    savedMovies: 'Сохранённые фильмы', watchedMovies: 'Просмотренные фильмы',
    open: 'Открыть', remove: 'Удалить',
    emptyWatchlist: 'Список пуст',
    emptyWatchlistText: 'Вы ещё не сохранили ни одного фильма. Начните просматривать и добавляйте избранное.',
    emptyWatched: 'Нет просмотренных фильмов',
    emptyWatchedText: 'Отмечайте фильмы как просмотренные, чтобы они появились здесь.',
    browseMovies: 'Смотреть фильмы',
    moviesCount: 'фильмов',
  },
  KZ: {
    movies: 'Фильмдер', watchlist: 'Тізім', account: 'Аккаунт', history: 'Тарих', logout: 'Шығу', login: 'Кіру',
    savedMovies: 'Сақталған фильмдер', watchedMovies: 'Көрілген фильмдер',
    open: 'Ашу', remove: 'Жою',
    emptyWatchlist: 'Тізім бос',
    emptyWatchlistText: 'Сіз әлі бірде-бір фильм сақтамадыңыз. Шолуды бастаңыз.',
    emptyWatched: 'Көрілген фильмдер жоқ',
    emptyWatchedText: 'Фильмдерді көрілді деп белгілеңіз, олар осында пайда болады.',
    browseMovies: 'Фильмдерді шолу',
    moviesCount: 'фильм',
  }
};

@Component({
  selector: 'app-watchlist',
  imports: [CommonModule, RouterLink],
  templateUrl: './watchlist.html',
  styleUrl: './watchlist.css',
})
export class Watchlist implements OnInit {
  watchlistMovies: Movie[] = [];
  watchedMovies: Movie[] = [];
  activeTab: 'saved' | 'watched' = 'saved';
  showAccountMenu = false;
  langs: Lang[] = ['EN', 'RU', 'KZ'];

  constructor(
    private watchlistService: WatchlistService,
    private authService: AuthService,
    private langService: LanguageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMovies();
  }

  loadMovies(): void {
    this.watchlistService.getWatchlist().subscribe(items => {
      this.watchlistMovies = items.map((i: any) => i.movie);
    });
    this.watchlistService.getWatched().subscribe(items => {
      this.watchedMovies = items.map((i: any) => i.movie);
    });
  }

  removeMovie(movieId: number): void {
    this.watchlistService.removeFromWatchlist(movieId).subscribe(() => {
      this.loadMovies();
    });
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/']);
    });
  }

  get currentLang(): Lang { return this.langService.getLang(); }
  setLang(lang: Lang): void { this.langService.setLang(lang); }
  t(key: string): string { return TRANSLATIONS[this.currentLang][key] || key; }
  setTab(tab: 'saved' | 'watched'): void { this.activeTab = tab; }
  isLoggedIn(): boolean { return this.authService.isLoggedIn(); }

  getAvatarLetter(): string {
    const user = this.authService.getCurrentUser();
    return user ? user[0].toUpperCase() : '?';
  }

  getAvatarUrl(): string {
    const user = this.authService.getCurrentUser();
    return user ? localStorage.getItem(`avatar_${user}`) || '' : '';
  }

  getCurrentUsername(): string {
    return this.authService.getCurrentUser() || '';
  }

  toggleAccountMenu(): void { this.showAccountMenu = !this.showAccountMenu; }
  closeAccountMenu(): void { this.showAccountMenu = false; }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.account-dropdown-wrap')) {
      this.showAccountMenu = false;
    }
  }

  getMovieTitle(movie: Movie): string {
    if (this.currentLang === 'RU') return movie.titleRu || movie.title;
    if (this.currentLang === 'KZ') return movie.titleKz || movie.title;
    return movie.title;
  }
}