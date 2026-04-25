import { Routes } from '@angular/router';

import { Login } from './pages/login/login';
import { Movies } from './pages/movies/movies';
import { MovieDetail } from './pages/movie-detail/movie-detail';
import { Watchlist } from './pages/watchlist/watchlist';
import { Account } from './pages/account/account';

export const routes: Routes = [
  { path: '', component: Movies },
  { path: 'login', component: Login },
  { path: 'movie/:id', component: MovieDetail },
  { path: 'watchlist', component: Watchlist },
  { path: 'account', component: Account },
];