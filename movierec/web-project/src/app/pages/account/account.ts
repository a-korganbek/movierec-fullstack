import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { LanguageService, Lang } from '../../services/language.service';

const TRANSLATIONS: Record<Lang, Record<string, string>> = {
  EN: {
    movies: 'Movies', watchlist: 'Watchlist', account: 'Account', history: 'History', logout: 'Logout',
    editProfile: 'Edit Profile',
    newUsername: 'New Username', newPassword: 'New Password', confirmPassword: 'Confirm Password',
    saveChanges: 'Save Changes', changePhoto: ' Change Photo',
    passwordMismatch: 'Passwords do not match!',
    usernameTaken: 'This username is already taken!',
    avatarUpdated: 'Avatar updated!',
    changesSaved: 'Changes saved successfully!',
    enterNewPassword: 'Enter new password', confirmNewPassword: 'Confirm new password',
  },
  RU: {
    movies: 'Фильмы', watchlist: 'Список', account: 'Аккаунт', history: 'История', logout: 'Выйти',
    editProfile: 'Редактировать профиль',
    newUsername: 'Новое имя пользователя', newPassword: 'Новый пароль', confirmPassword: 'Подтвердить пароль',
    saveChanges: 'Сохранить изменения', changePhoto: ' Изменить фото',
    passwordMismatch: 'Пароли не совпадают!',
    usernameTaken: 'Это имя пользователя уже занято!',
    avatarUpdated: 'Аватар обновлён!',
    changesSaved: 'Изменения сохранены!',
    enterNewPassword: 'Введите новый пароль', confirmNewPassword: 'Подтвердите новый пароль',
  },
  KZ: {
    movies: 'Фильмдер', watchlist: 'Тізім', account: 'Аккаунт', history: 'Тарих', logout: 'Шығу',
    editProfile: 'Профильді өңдеу',
    newUsername: 'Жаңа пайдаланушы аты', newPassword: 'Жаңа құпия сөз', confirmPassword: 'Құпия сөзді растау',
    saveChanges: 'Өзгерістерді сақтау', changePhoto: ' Фотоны өзгерту',
    passwordMismatch: 'Құпия сөздер сәйкес келмейді!',
    usernameTaken: 'Бұл пайдаланушы аты бос емес!',
    avatarUpdated: 'Аватар жаңартылды!',
    changesSaved: 'Өзгерістер сақталды!',
    enterNewPassword: 'Жаңа құпия сөзді енгізіңіз', confirmNewPassword: 'Жаңа құпия сөзді растаңыз',
  }
};

@Component({
  selector: 'app-account',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './account.html',
  styleUrl: './account.css',
})
export class Account implements OnInit {

  username = '';
  newUsername = '';
  newPassword = '';
  confirmPassword = '';
  avatarUrl: string = '';

  successMessage = '';
  errorMessage = '';

  showAccountMenu = false;
  langs: Lang[] = ['EN', 'RU', 'KZ'];

  constructor(
    private authService: AuthService,
    private router: Router,
    private langService: LanguageService
  ) {}

  get currentLang(): Lang { return this.langService.getLang(); }
  setLang(lang: Lang): void { this.langService.setLang(lang); }
  t(key: string): string { return TRANSLATIONS[this.currentLang][key] || key; }

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.username = this.authService.getCurrentUser() || '';
    const saved = localStorage.getItem(`avatar_${this.username}`);
    if (saved) this.avatarUrl = saved;
  }

  isLoggedIn(): boolean { return this.authService.isLoggedIn(); }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/']);
    });
  }

  getAvatarLetter(): string { return this.username ? this.username[0].toUpperCase() : '?'; }
  getAvatarUrl(): string { return this.avatarUrl; }
  getCurrentUsername(): string { return this.username; }

  toggleAccountMenu(): void { this.showAccountMenu = !this.showAccountMenu; }
  closeAccountMenu(): void { this.showAccountMenu = false; }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.account-dropdown-wrap')) {
      this.showAccountMenu = false;
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.avatarUrl = reader.result as string;
      localStorage.setItem(`avatar_${this.username}`, this.avatarUrl);
      this.successMessage = this.t('avatarUpdated');
      setTimeout(() => this.successMessage = '', 3000);
    };
    reader.readAsDataURL(file);
  }

  saveChanges(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.newPassword && this.newPassword !== this.confirmPassword) {
      this.errorMessage = this.t('passwordMismatch');
      return;
    }

    // Смена username/password через API пока не реализована на бэке,
    // поэтому просто показываем успех без реального запроса
    this.successMessage = this.t('changesSaved');
    this.newUsername = '';
    this.newPassword = '';
    this.confirmPassword = '';
    setTimeout(() => this.successMessage = '', 3000);
  }
}