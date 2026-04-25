# Movie Backend — Django + DRF

## Quick Start

```bash
pip install django djangorestframework django-cors-headers
python manage.py migrate
python manage.py seed          # optional: load test data
python manage.py runserver
```

Test credentials: `user1 / password123`, `user2 / password123`

---

## Architecture

| Requirement | Implementation |
|---|---|
| 4+ models | `Genre`, `Movie`, `Review`, `WatchlistItem` |
| 2+ ForeignKey | `Review→Movie`, `Review→User`, `WatchlistItem→Movie`, `WatchlistItem→User` |
| 2 plain Serializer | `RegisterSerializer`, `LoginSerializer` |
| 2 ModelSerializer | `ReviewModelSerializer`, `MovieModelSerializer` |
| 2 FBV | `register()`, `login_view()` + `logout_view()` |
| 2 CBV | `MovieListView/DetailView` (generics), `ReviewListCreateView/DetailView`, `WatchlistView` |
| Token auth | DRF TokenAuthentication |
| Full CRUD | `Review` — list/create/retrieve/update/delete |
| Linked to user | Reviews & Watchlist items owned by `request.user` |
| CORS | `django-cors-headers`, `CORS_ALLOW_ALL_ORIGINS = True` |

---

## API Endpoints

### Auth
| Method | URL | Auth | Body |
|---|---|---|---|
| POST | `/api/auth/register/` | — | `{username, email, password}` |
| POST | `/api/auth/login/` | — | `{identifier, password}` (email or username) |
| POST | `/api/auth/logout/` | ✓ Token | — |

All auth responses return: `{token, user_id, username, email}`

### Movies (read-only public, write = admin)
| Method | URL | Auth |
|---|---|---|
| GET | `/api/movies/` | — |
| GET | `/api/movies/<id>/` | — |
| POST | `/api/movies/` | Admin |
| PATCH/DELETE | `/api/movies/<id>/` | Admin |

### Reviews (Full CRUD)
| Method | URL | Auth | Notes |
|---|---|---|---|
| GET | `/api/movies/<movie_id>/reviews/` | — | All reviews for a movie |
| POST | `/api/movies/<movie_id>/reviews/` | ✓ | `{rating, comment}` |
| GET | `/api/reviews/<id>/` | ✓ | Owner only |
| PATCH | `/api/reviews/<id>/` | ✓ | Owner only |
| DELETE | `/api/reviews/<id>/` | ✓ | Owner only |

### Watchlist
| Method | URL | Auth | Notes |
|---|---|---|---|
| GET | `/api/watchlist/` | ✓ | All items; `?status=watchlist\|watched` to filter |
| POST | `/api/watchlist/` | ✓ | `{movie_id, status}` |
| PATCH | `/api/watchlist/<movie_id>/` | ✓ | `{status: "watched"\|"watchlist"}` |
| DELETE | `/api/watchlist/<movie_id>/` | ✓ | Remove from list |
| GET | `/api/watchlist/<movie_id>/status/` | ✓ | `{status: "none"\|"watchlist"\|"watched"}` |

---

## Frontend Integration

```typescript
const BASE = 'http://localhost:8000/api'
const headers = (token?: string) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Token ${token}` } : {})
})

// Map frontend ↔ backend field names
// Movie.titleRu   → title_ru
// Movie.titleKz   → title_kz
// Movie.trailerId → trailer_id
// Review.movieId  → movie_id (POST body)
// WatchlistItem.userId → derived from token (not sent)
// WatchlistItem.movieId → movie_id (POST body)
```

### Field name mapping (camelCase → snake_case)
| Frontend | Backend |
|---|---|
| `titleRu` | `title_ru` |
| `titleKz` | `title_kz` |
| `trailerId` | `trailer_id` |
| `movieId` | route param or `movie_id` |
