import { Component, ElementRef, ViewChild, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { Movie } from '../../models/movie';
import { Review } from '../../models/review';

import { MovieService } from '../../services/movie.service';
import { ReviewService } from '../../services/review.service';
import { WatchlistService } from '../../services/watchlist.service';
import { AuthService } from '../../services/auth.service';
import { LanguageService, Lang } from '../../services/language.service';

export interface Comment {
  id: number;
  movieId: number;
  user: string;
  text: string;
  date: string;
  replyTo?: string;
}

const GENRE_TRANSLATIONS: Record<Lang, Record<string, string>> = {
  EN: {
    Action: 'Action', Adventure: 'Adventure', Comedy: 'Comedy', Crime: 'Crime',
    Drama: 'Drama', Mystery: 'Mystery', Romance: 'Romance', 'Sci-Fi': 'Sci-Fi', Thriller: 'Thriller'
  },
  RU: {
    Action: 'Боевик', Adventure: 'Приключения', Comedy: 'Комедия', Crime: 'Криминал',
    Drama: 'Драма', Mystery: 'Мистика', Romance: 'Романтика', 'Sci-Fi': 'Фантастика', Thriller: 'Триллер'
  },
  KZ: {
    Action: 'Боевик', Adventure: 'Приключение', Comedy: 'Комедия', Crime: 'Қылмыс',
    Drama: 'Драма', Mystery: 'Жұмбақ', Romance: 'Романтика', 'Sci-Fi': 'Фантастика', Thriller: 'Триллер'
  }
};

const TRANSLATIONS: Record<Lang, Record<string, string>> = {
  EN: {
    movies: 'Movies', watchlist: 'Watchlist', account: 'Account', history: 'History', logout: 'Logout',
    addToWatchlist: '+ Add to Watchlist', inWatchlist: 'In Watchlist', watched: 'Watched',
    watchTrailer: '▶ Watch Trailer', addReview: 'Add Review', yourReview: 'Your Review',
    submitReview: 'Submit Review', deleteReview: '🗑 Delete my review',
    trailer: 'Trailer', reviews: 'Reviews', noReviews: 'No reviews yet. Be the first!',
    viewAll: 'View all', showLess: 'Show less', discussion: 'Discussion',
    noComments: 'No comments yet. Start the discussion!', postComment: 'Post a Comment',
    shareThoughts: 'Share your thoughts about this movie...', post: 'Post Comment',
    replyingTo: 'Replying to', similarMovies: 'Similar Movies',
    edit: 'Edit', remove: 'Remove', reply: 'Reply', report: 'Report',
    save: 'Save', cancel: 'Cancel', movieNotFound: 'Movie not found',
    removeFromList: 'Remove from list',
    deleteConfirm: 'Are you sure you want to delete your review?',
    noCancel: 'No, cancel', yesDelete: 'Yes, delete',
    reportWhy: 'Why are you reporting this comment?',
    harassment: 'Harassment or hate speech', spam: 'Spam',
    misinformation: 'Fake information', other: 'Other',
    reportSuccess: 'Report submitted. Thank you for keeping the community safe!',
    close: 'Close',
  },
  RU: {
    movies: 'Фильмы', watchlist: 'Список', account: 'Аккаунт', history: 'История', logout: 'Выйти',
    addToWatchlist: '+ В список', inWatchlist: 'В списке', watched: 'Просмотрено',
    watchTrailer: '▶ Смотреть трейлер', addReview: 'Добавить отзыв', yourReview: 'Ваш отзыв',
    submitReview: 'Отправить', deleteReview: '🗑 Удалить отзыв',
    trailer: 'Трейлер', reviews: 'Отзывы', noReviews: 'Нет отзывов. Будьте первым!',
    viewAll: 'Показать все', showLess: 'Скрыть', discussion: 'Обсуждение',
    noComments: 'Нет комментариев. Начните обсуждение!', postComment: 'Оставить комментарий',
    shareThoughts: 'Поделитесь мнением о фильме...', post: 'Отправить',
    replyingTo: 'Ответ для', similarMovies: 'Похожие фильмы',
    edit: 'Редактировать', remove: 'Удалить', reply: 'Ответить', report: 'Пожаловаться',
    save: 'Сохранить', cancel: 'Отмена', movieNotFound: 'Фильм не найден',
    removeFromList: 'Убрать из списка',
    deleteConfirm: 'Вы уверены, что хотите удалить отзыв?',
    noCancel: 'Нет, отмена', yesDelete: 'Да, удалить',
    reportWhy: 'Почему вы жалуетесь на этот комментарий?',
    harassment: 'Оскорбление или язык ненависти', spam: 'Спам',
    misinformation: 'Ложная информация', other: 'Другое',
    reportSuccess: 'Жалоба отправлена. Спасибо за помощь!',
    close: 'Закрыть',
  },
  KZ: {
    movies: 'Фильмдер', watchlist: 'Тізім', account: 'Аккаунт', history: 'Тарих', logout: 'Шығу',
    addToWatchlist: '+ Тізімге қосу', inWatchlist: 'Тізімде', watched: 'Көрілді',
    watchTrailer: '▶ Трейлер көру', addReview: 'Пікір қалдыру', yourReview: 'Сіздің пікіріңіз',
    submitReview: 'Жіберу', deleteReview: '🗑 Пікірді жою',
    trailer: 'Трейлер', reviews: 'Пікірлер', noReviews: 'Пікір жоқ. Бірінші болыңыз!',
    viewAll: 'Барлығын көру', showLess: 'Жасыру', discussion: 'Талқылау',
    noComments: 'Комментарий жоқ. Талқылауды бастаңыз!', postComment: 'Комментарий қалдыру',
    shareThoughts: 'Фильм туралы пікіріңізді бөлісіңіз...', post: 'Жіберу',
    replyingTo: 'Жауап:', similarMovies: 'Ұқсас фильмдер',
    edit: 'Өңдеу', remove: 'Жою', reply: 'Жауап', report: 'Шағым',
    save: 'Сақтау', cancel: 'Болдырмау', movieNotFound: 'Фильм табылмады',
    removeFromList: 'Тізімнен алу',
    deleteConfirm: 'Пікіріңізді жойғыңыз келе ме?',
    noCancel: 'Жоқ, болдырмау', yesDelete: 'Иә, жою',
    reportWhy: 'Неліктен шағым жасайсыз?',
    harassment: 'Қорлау немесе жек көрушілік', spam: 'Спам',
    misinformation: 'Жалған ақпарат', other: 'Басқа',
    reportSuccess: 'Шағым жіберілді. Рахмет!',
    close: 'Жабу',
  }
};

@Component({
  selector: 'app-movie-detail',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './movie-detail.html',
  styleUrl: './movie-detail.css',
})
export class MovieDetail implements OnInit {

  @ViewChild('trailerSection') trailerSection!: ElementRef;

  movie?: Movie;
  reviews: Review[] = [];
  similarMovies: Movie[] = [];
  comments: Comment[] = [];
  movieStatus: 'none' | 'watchlist' | 'watched' = 'none';

  newRating: number = 0;
  newComment: string = '';
  newCommentText: string = '';

  showWatchlistMenu = false;
  showAllReviews = false;
  replyingTo: Comment | null = null;
  openMenuCommentId: number | null = null;
  showDeleteModal = false;
  showAccountMenu = false;

  editingCommentId: number | null = null;
  editingText: string = '';

  showReportModal = false;
  reportingCommentId: number | null = null;
  selectedReason: string = '';
  reportSent = false;

  reportReasons = [
    { key: 'harassment' },
    { key: 'spam' },
    { key: 'misinformation' },
    { key: 'other' },
  ];

  langs: Lang[] = ['EN', 'RU', 'KZ'];
  cachedTrailerUrl: SafeResourceUrl = '';
  private reviewsStorageKey = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private movieService: MovieService,
    private reviewService: ReviewService,
    private watchlistService: WatchlistService,
    private authService: AuthService,
    private sanitizer: DomSanitizer,
    public langService: LanguageService
  ) {}

  get currentLang(): Lang { return this.langService.getLang(); }
  t(key: string): string { return TRANSLATIONS[this.currentLang][key] || key; }
  setLang(lang: Lang): void { this.langService.setLang(lang); }

  getMovieTitle(): string {
    if (!this.movie) return '';
    if (this.currentLang === 'RU') return this.movie.titleRu || this.movie.title;
    if (this.currentLang === 'KZ') return this.movie.titleKz || this.movie.title;
    return this.movie.title;
  }

  getMovieDescription(): string {
    if (!this.movie) return '';
    if (this.currentLang === 'RU') return (this.movie as any).descriptionRu || this.movie.description;
    if (this.currentLang === 'KZ') return (this.movie as any).descriptionKz || this.movie.description;
    return this.movie.description;
  }

  tGenre(genre: string): string {
    return GENRE_TRANSLATIONS[this.currentLang][genre] || genre;
  }

  getSimilarMovieTitle(m: Movie): string {
    if (this.currentLang === 'RU') return m.titleRu || m.title;
    if (this.currentLang === 'KZ') return m.titleKz || m.title;
    return m.title;
  }

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

  getUserAvatar(username: string): string {
    return localStorage.getItem(`avatar_${username}`) || '';
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.account-dropdown-wrap')) {
      this.showAccountMenu = false;
    }
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.reviewsStorageKey = `reviews_${id}`;
    this.loadComments(id);
    this.loadMovieData(id);
    window.scrollTo({ top: 0 });
  }

  loadMovieData(id: number): void {
    this.movieService.getMovieById(id).subscribe(movie => {
      this.movie = movie;
      this.cachedTrailerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        `https://www.youtube.com/embed/${movie.trailerId}`
      );
      this.movieService.getMovies().subscribe(movies => {
        this.similarMovies = movies
          .filter(m => m.id !== id && m.genres.some(g => movie.genres.includes(g)))
          .slice(0, 3);
      });
      const user = this.authService.getCurrentUser();
      if (user) {
        const key = `history_${user}`;
        const raw = localStorage.getItem(key);
        const items = raw ? JSON.parse(raw) : [];
        items.push({
          movieId: movie.id,
          visitedAt: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
        });
        localStorage.setItem(key, JSON.stringify(items));
      }
      if (this.authService.isLoggedIn()) {
        this.watchlistService.getStatus(id).subscribe(res => {
          this.movieStatus = res.status as 'none' | 'watchlist' | 'watched';
        });
      }
    });
    this.loadReviews(id);
  }

  loadReviews(movieId: number): void {
    this.reviewService.getReviewsByMovieId(movieId).subscribe(reviews => {
      this.reviews = reviews;
    });
  }

  get myReview(): Review | null {
    const user = this.authService.getCurrentUser();
    if (!user) return null;
    return this.reviews.find(r => r.user === user) || null;
  }

  get hasReviewed(): boolean { return !!this.myReview; }

  get displayedReviews(): Review[] {
    const reversed = [...this.reviews].reverse();
    return this.showAllReviews ? reversed : reversed.slice(0, 3);
  }

  toggleViewAll(): void { this.showAllReviews = !this.showAllReviews; }
  setRating(value: number): void { this.newRating = value; }

  submitReview(): void {
    if (!this.movie || !this.newRating || !this.newComment.trim()) return;
    if (this.hasReviewed) return;
    this.reviewService.addReview(this.movie.id, this.newRating, this.newComment).subscribe(review => {
      this.reviews.push(review);
      this.newRating = 0;
      this.newComment = '';
    });
  }

  openDeleteModal(): void { this.showDeleteModal = true; }
  closeDeleteModal(): void { this.showDeleteModal = false; }

  confirmDeleteReview(): void {
    if (!this.myReview) return;
    this.reviewService.deleteReview(this.myReview.id).subscribe(() => {
      this.reviews = this.reviews.filter(r => r.id !== this.myReview!.id);
      this.showDeleteModal = false;
    });
  }

  openReportModal(commentId: number): void {
    this.reportingCommentId = commentId;
    this.selectedReason = '';
    this.reportSent = false;
    this.showReportModal = true;
    this.openMenuCommentId = null;
  }

  closeReportModal(): void {
    this.showReportModal = false;
    this.reportingCommentId = null;
    this.selectedReason = '';
    this.reportSent = false;
  }

  selectReason(key: string): void { this.selectedReason = key; }
  submitReport(): void { if (!this.selectedReason) return; this.reportSent = true; }

  loadComments(movieId: number): void {
    const raw = localStorage.getItem(`comments_${movieId}`);
    this.comments = raw ? JSON.parse(raw) : [];
  }

  saveComments(): void {
    if (!this.movie) return;
    localStorage.setItem(`comments_${this.movie.id}`, JSON.stringify(this.comments));
  }

  submitComment(): void {
    if (!this.newCommentText.trim()) return;
    const comment: Comment = {
      id: Date.now(),
      movieId: this.movie!.id,
      user: this.authService.getCurrentUser() || 'Guest',
      text: this.newCommentText.trim(),
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      replyTo: this.replyingTo ? this.replyingTo.user : undefined
    };
    this.comments.push(comment);
    this.saveComments();
    this.newCommentText = '';
    this.replyingTo = null;
  }

  deleteComment(commentId: number): void {
    this.comments = this.comments.filter(c => c.id !== commentId);
    this.saveComments();
    this.openMenuCommentId = null;
  }

  startEditing(comment: Comment): void {
    this.editingCommentId = comment.id;
    this.editingText = comment.text;
    this.openMenuCommentId = null;
  }

  saveEdit(commentId: number): void {
    if (!this.editingText.trim()) return;
    const comment = this.comments.find(c => c.id === commentId);
    if (comment) { comment.text = this.editingText.trim(); this.saveComments(); }
    this.editingCommentId = null;
    this.editingText = '';
  }

  cancelEdit(): void { this.editingCommentId = null; this.editingText = ''; }
  isEditing(commentId: number): boolean { return this.editingCommentId === commentId; }

  canDeleteComment(comment: Comment): boolean {
    const user = this.authService.getCurrentUser();
    return !!user && comment.user === user;
  }

  isMyComment(comment: Comment): boolean {
    const user = this.authService.getCurrentUser();
    return !!user && comment.user === user;
  }

  setReplyTo(comment: Comment): void {
    this.replyingTo = comment;
    this.newCommentText = '';
    this.openMenuCommentId = null;
  }

  cancelReply(): void { this.replyingTo = null; }

  toggleCommentMenu(commentId: number): void {
    this.openMenuCommentId = this.openMenuCommentId === commentId ? null : commentId;
  }

  isLoggedIn(): boolean { return this.authService.isLoggedIn(); }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/']);
    });
  }

  scrollToTrailer(): void {
    this.trailerSection.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }

  getMovieStatus(): 'none' | 'watchlist' | 'watched' {
    return this.movieStatus;
  }

  toggleWatchlistMenu(): void { this.showWatchlistMenu = !this.showWatchlistMenu; }

  addToWatchlist(): void {
    if (!this.movie) return;
    this.watchlistService.addToWatchlist(this.movie.id).subscribe(() => {
      this.movieStatus = 'watchlist';
      this.showWatchlistMenu = false;
    });
  }

  markAsWatched(): void {
    if (!this.movie) return;
    this.watchlistService.markAsWatched(this.movie.id).subscribe(() => {
      this.movieStatus = 'watched';
      this.showWatchlistMenu = false;
    });
  }

  removeFromWatchlist(): void {
    if (!this.movie) return;
    this.watchlistService.removeFromWatchlist(this.movie.id).subscribe(() => {
      this.movieStatus = 'none';
      this.showWatchlistMenu = false;
    });
  }

  navigateToMovie(id: number): void {
    this.router.navigate(['/movie', id]).then(() => {
      window.scrollTo({ top: 0 });
      this.reviewsStorageKey = `reviews_${id}`;
      this.loadComments(id);
      this.loadMovieData(id);
    });
  }
}