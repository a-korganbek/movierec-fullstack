from django.urls import path
from . import views

urlpatterns = [
    # Auth
    path('auth/register/', views.register, name='register'),
    path('auth/login/', views.login_view, name='login'),
    path('auth/logout/', views.logout_view, name='logout'),

    # Movies
    path('movies/', views.MovieListView.as_view(), name='movie-list'),
    path('movies/<int:pk>/', views.MovieDetailView.as_view(), name='movie-detail'),

    # Reviews
    path('movies/<int:movie_id>/reviews/', views.ReviewListCreateView.as_view(), name='review-list'),
    path('reviews/<int:pk>/', views.ReviewDetailView.as_view(), name='review-detail'),

    # Watchlist
    path('watchlist/', views.WatchlistView.as_view(), name='watchlist'),
    path('watchlist/<int:movie_id>/', views.WatchlistItemView.as_view(), name='watchlist-item'),
    path('watchlist/<int:movie_id>/status/', views.watchlist_status, name='watchlist-status'),
]
