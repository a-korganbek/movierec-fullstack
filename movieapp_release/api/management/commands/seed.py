from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import Genre, Movie, Review, WatchlistItem


class Command(BaseCommand):
    help = 'Seed database with sample data'

    def handle(self, *args, **kwargs):
        genres_data = ['Action', 'Drama', 'Comedy', 'Sci-Fi', 'Thriller', 'Romance', 'Horror', 'Animation']
        genres = {name: Genre.objects.get_or_create(name=name)[0] for name in genres_data}

        movies_data = [
            {'title': 'Inception', 'title_ru': 'Начало', 'title_kz': 'Бастама', 'year': 2010,
             'description': 'A thief who steals secrets through dreams.', 'rating': 8.8,
             'poster': 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
             'trailer_id': 'YoHD9XEInc0', 'genres': ['Action', 'Sci-Fi', 'Thriller']},
            {'title': 'The Shawshank Redemption', 'title_ru': 'Побег из Шоушенка', 'title_kz': 'Шоушенктен қашу', 'year': 1994,
             'description': 'Two imprisoned men bond over years.', 'rating': 9.3,
             'poster': 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
             'trailer_id': '6hB3S9bIaco', 'genres': ['Drama']},
            {'title': 'Interstellar', 'title_ru': 'Интерстеллар', 'title_kz': 'Жұлдызаралық', 'year': 2014,
             'description': 'A team travels through a wormhole in space.', 'rating': 8.6,
             'poster': 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
             'trailer_id': 'zSWdZVtXT7E', 'genres': ['Sci-Fi', 'Drama']},
        ]

        movies = []
        for md in movies_data:
            movie_genres = md.pop('genres')
            movie, _ = Movie.objects.get_or_create(title=md['title'], defaults=md)
            movie.genres.set([genres[g] for g in movie_genres])
            movies.append(movie)

        users = []
        for i in range(1, 3):
            user, _ = User.objects.get_or_create(username=f'user{i}', defaults={'email': f'user{i}@example.com'})
            user.set_password('password123')
            user.save()
            users.append(user)

        for movie in movies[:2]:
            for user in users:
                Review.objects.get_or_create(movie=movie, user=user,
                    defaults={'rating': 8, 'comment': f'Great movie! By {user.username}'})

        WatchlistItem.objects.get_or_create(user=users[0], movie=movies[0], defaults={'status': 'watched'})
        WatchlistItem.objects.get_or_create(user=users[0], movie=movies[1], defaults={'status': 'watchlist'})

        self.stdout.write(self.style.SUCCESS('Seeded! Test users: user1/password123, user2/password123'))
