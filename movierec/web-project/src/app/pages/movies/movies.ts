import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { Movie } from '../../models/movie';
import { MovieService } from '../../services/movie.service';
import { WatchlistService } from '../../services/watchlist.service';
import { AuthService } from '../../services/auth.service';
import { LanguageService, Lang } from '../../services/language.service';

const TRANSLATIONS: Record<Lang, Record<string, string>> = {
  EN: {
    movies: 'Movies', watchlist: 'Watchlist', login: 'Login', logout: 'Logout',
    searchTitle: 'Find your next favorite movie', searchPlaceholder: 'Search for a movie...',
    filters: 'Filters', genres: 'Genres', minRating: 'Minimum rating',
    apply: 'Apply', reset: 'Reset', recommendations: 'Recommendations',
    ratingAbove9: 'Rating above 9', searchResults: 'Search Results',
    noMovies: 'No movies found', noMoviesHint: 'Try another title or reset filters.',
    open: 'Open', addToWatchlist: 'Add to Watchlist', inWatchlist: 'In Watchlist',
    watched: 'Watched', removeFromList: 'Remove from list', movies_count: 'movies',
    genre_Action: 'Action', genre_Adventure: 'Adventure', genre_Comedy: 'Comedy',
    genre_Crime: 'Crime', genre_Drama: 'Drama', genre_Mystery: 'Mystery',
    genre_Romance: 'Romance', genre_SciFi: 'Sci-Fi', genre_Thriller: 'Thriller',
    account: 'Account', history: 'History',
  },
  RU: {
    movies: 'Фильмы', watchlist: 'Список', login: 'Войти', logout: 'Выйти',
    searchTitle: 'Найди свой следующий любимый фильм', searchPlaceholder: 'Поиск фильма...',
    filters: 'Фильтры', genres: 'Жанры', minRating: 'Минимальный рейтинг',
    apply: 'Применить', reset: 'Сбросить', recommendations: 'Рекомендации',
    ratingAbove9: 'Рейтинг выше 9', searchResults: 'Результаты поиска',
    noMovies: 'Фильмы не найдены', noMoviesHint: 'Попробуйте другое название или сбросьте фильтры.',
    open: 'Открыть', addToWatchlist: 'Добавить в список', inWatchlist: 'В списке',
    watched: 'Просмотрено', removeFromList: 'Убрать из списка', movies_count: 'фильмов',
    genre_Action: 'Боевик', genre_Adventure: 'Приключения', genre_Comedy: 'Комедия',
    genre_Crime: 'Криминал', genre_Drama: 'Драма', genre_Mystery: 'Мистика',
    genre_Romance: 'Романтика', genre_SciFi: 'Фантастика', genre_Thriller: 'Триллер',
    account: 'Аккаунт', history: 'История',
  },
  KZ: {
    movies: 'Фильмдер', watchlist: 'Тізім', login: 'Кіру', logout: 'Шығу',
    searchTitle: 'Келесі сүйікті фильміңді тап', searchPlaceholder: 'Фильм іздеу...',
    filters: 'Сүзгілер', genres: 'Жанрлар', minRating: 'Ең төменгі рейтинг',
    apply: 'Қолдану', reset: 'Тазалау', recommendations: 'Ұсыныстар',
    ratingAbove9: 'Рейтинг 9-дан жоғары', searchResults: 'Іздеу нәтижелері',
    noMovies: 'Фильмдер табылмады', noMoviesHint: 'Басқа атауды немесе сүзгіні қолданып көріңіз.',
    open: 'Ашу', addToWatchlist: 'Тізімге қосу', inWatchlist: 'Тізімде',
    watched: 'Көрілді', removeFromList: 'Тізімнен алу', movies_count: 'фильм',
    genre_Action: 'Боевик', genre_Adventure: 'Приключение', genre_Comedy: 'Комедия',
    genre_Crime: 'Қылмыс', genre_Drama: 'Драма', genre_Mystery: 'Жұмбақ',
    genre_Romance: 'Романтика', genre_SciFi: 'Фантастика', genre_Thriller: 'Триллер',
    account: 'Аккаунт', history: 'Тарих',
  }
};

@Component({
  selector: 'app-movies',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './movies.html',
  styleUrl: './movies.css',
})
export class Movies implements OnInit {
  openMenuMovieId: number | null = null;
  showAccountMenu = false;

  movies: Movie[] = [];
  filteredMovies: Movie[] = [];
  recommendedMovies: Movie[] = [];
  movieStatuses: Record<number, 'none' | 'watchlist' | 'watched'> = {};

  searchTerm = '';
  selectedGenres: string[] = [];
  selectedMinRating = 1;

  hasAppliedFilters = false;
  isFilterOpen = false;
  isFilterPinned = false;

  langs: Lang[] = ['EN', 'RU', 'KZ'];

  allGenres: string[] = [
    'Action', 'Adventure', 'Comedy', 'Crime',
    'Drama', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller'
  ];

  constructor(
    private movieService: MovieService,
    private watchlistService: WatchlistService,
    private authService: AuthService,
    private router: Router,
    private langService: LanguageService
  ) {}

  ngOnInit(): void {
    this.movieService.getMovies().subscribe(movies => {
      this.movies = movies;
      this.filteredMovies = movies;
      this.recommendedMovies = movies;
      if (this.authService.isLoggedIn()) {
        this.loadStatuses();
      }
    });
  }

  loadStatuses(): void {
    // Грузим статусы для всех фильмов через watchlist
    this.watchlistService.getWatchlist().subscribe(items => {
      items.forEach((i: any) => {
        this.movieStatuses[i.movie.id] = 'watchlist';
      });
    });
    this.watchlistService.getWatched().subscribe(items => {
      items.forEach((i: any) => {
        this.movieStatuses[i.movie.id] = 'watched';
      });
    });
  }

  get currentLang(): Lang { return this.langService.getLang(); }
  t(key: string): string { return TRANSLATIONS[this.currentLang][key] || key; }
  setLang(lang: Lang): void { this.langService.setLang(lang); }

  toggleAccountMenu(): void { this.showAccountMenu = !this.showAccountMenu; }
  closeAccountMenu(): void { this.showAccountMenu = false; }

  getAvatarLetter(): string {
    const user = this.authService.getCurrentUser();
    return user ? user[0].toUpperCase() : '?';
  }

  getAvatarUrl(): string {
    const user = this.authService.getCurrentUser();
    return user ? localStorage.getItem(`avatar_${user}`) || '' : '';
  }

  getCurrentUsername(): string { return this.authService.getCurrentUser() || ''; }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.account-dropdown-wrap')) {
      this.showAccountMenu = false;
    }
  }

  isLoggedIn(): boolean { return this.authService.isLoggedIn(); }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.showAccountMenu = false;
      this.router.navigate(['/']);
    });
  }

  openFilterHover(): void { if (!this.isFilterPinned) this.isFilterOpen = true; }
  closeFilterHover(): void { if (!this.isFilterPinned) this.isFilterOpen = false; }
  pinFilter(): void { this.isFilterPinned = true; this.isFilterOpen = true; }

  toggleGenre(genre: string, checked: boolean): void {
    if (checked) {
      if (!this.selectedGenres.includes(genre)) this.selectedGenres.push(genre);
    } else {
      this.selectedGenres = this.selectedGenres.filter(g => g !== genre);
    }
  }

  isGenreSelected(genre: string): boolean { return this.selectedGenres.includes(genre); }

  applyFilters(): void {
    const term = this.searchTerm.trim().toLowerCase();
    this.filteredMovies = this.movies.filter(movie => {
      const matchesTitle = !term || movie.title.toLowerCase().includes(term);
      const matchesGenres = this.selectedGenres.length === 0 ||
        this.selectedGenres.every(genre => movie.genres.includes(genre));
      const matchesRating = movie.rating >= this.selectedMinRating;
      return matchesTitle && matchesGenres && matchesRating;
    });
    this.hasAppliedFilters = true;
    this.isFilterPinned = false;
    this.isFilterOpen = false;
  }

  onSearchEnter(): void { this.applyFilters(); }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedGenres = [];
    this.selectedMinRating = 1;
    this.filteredMovies = this.movies;
    this.hasAppliedFilters = false;
    this.isFilterPinned = false;
    this.isFilterOpen = false;
  }

  getRatingLabel(value: number): string { return value === 10 ? '10' : `${value}+`; }

  getMovieStatus(movieId: number): 'none' | 'watchlist' | 'watched' {
    return this.movieStatuses[movieId] || 'none';
  }

  toggleMovieMenu(movieId: number): void {
    this.openMenuMovieId = this.openMenuMovieId === movieId ? null : movieId;
  }

  setWatchlist(movieId: number): void {
    this.watchlistService.addToWatchlist(movieId).subscribe(() => {
      this.movieStatuses[movieId] = 'watchlist';
      this.openMenuMovieId = null;
    });
  }

  setWatched(movieId: number): void {
    this.watchlistService.markAsWatched(movieId).subscribe(() => {
      this.movieStatuses[movieId] = 'watched';
      this.openMenuMovieId = null;
    });
  }

  removeFromList(movieId: number): void {
    this.watchlistService.removeFromWatchlist(movieId).subscribe(() => {
      this.movieStatuses[movieId] = 'none';
      this.openMenuMovieId = null;
    });
  }

  tGenre(genre: string): string {
    const key = 'genre_' + genre.replace('-', '').replace(' ', '');
    return this.t(key);
  }

  getMovieTitle(movie: Movie): string {
    if (this.currentLang === 'RU') return movie.titleRu || movie.title;
    if (this.currentLang === 'KZ') return movie.titleKz || movie.title;
    return movie.title;
  }
}