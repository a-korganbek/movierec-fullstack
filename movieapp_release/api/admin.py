from django.contrib import admin
from .models import Genre, Movie, Review, WatchlistItem

@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):
    list_display = ['id', 'name']

@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'year', 'rating']
    filter_horizontal = ['genres']

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['id', 'movie', 'user', 'rating', 'date']

@admin.register(WatchlistItem)
class WatchlistItemAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'movie', 'status', 'added_at']
