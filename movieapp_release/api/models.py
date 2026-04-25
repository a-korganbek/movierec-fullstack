from django.db import models
from django.contrib.auth.models import User


class Genre(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class Movie(models.Model):
    title = models.CharField(max_length=255)
    title_ru = models.CharField(max_length=255, blank=True)
    title_kz = models.CharField(max_length=255, blank=True)
    genres = models.ManyToManyField(Genre, blank=True, related_name='movies')
    year = models.IntegerField()
    description = models.TextField(blank=True)
    description_ru = models.TextField(blank=True)
    description_kz = models.TextField(blank=True)
    rating = models.FloatField(default=0.0)
    poster = models.URLField(blank=True)
    trailer_id = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return self.title


class Review(models.Model):
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField()
    comment = models.TextField()
    date = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('movie', 'user')

    def __str__(self):
        return f"{self.user.username} → {self.movie.title}"


class WatchlistItem(models.Model):
    STATUS_CHOICES = [
        ('watchlist', 'Watchlist'),
        ('watched', 'Watched'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='watchlist')
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name='watchlist_items')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='watchlist')
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'movie')

    def __str__(self):
        return f"{self.user.username} - {self.movie.title} ({self.status})"
