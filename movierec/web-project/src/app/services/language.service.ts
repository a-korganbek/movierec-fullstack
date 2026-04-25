import { Injectable } from '@angular/core';

export type Lang = 'EN' | 'RU' | 'KZ';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private lang: Lang = (localStorage.getItem('lang') as Lang) || 'EN';

  getLang(): Lang { return this.lang; }

  setLang(lang: Lang): void {
    this.lang = lang;
    localStorage.setItem('lang', lang);
  }
}