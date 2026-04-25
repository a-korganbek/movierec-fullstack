from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Movie, Review, WatchlistItem, Genre


class RegisterSerializer(serializers.Serializer):
    """Plain Serializer #1 — user registration"""
    username = serializers.CharField(max_length=150)
    email = serializers.CharField(max_length=254)
    password = serializers.CharField(write_only=True, min_length=6)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already taken.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered.")
        return value

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
        )


class LoginSerializer(serializers.Serializer):
    """Plain Serializer #2 — login (identifier = username or email)"""
    identifier = serializers.CharField()
    password = serializers.CharField(write_only=True)


#  2 ModelSerializer 

class ReviewModelSerializer(serializers.ModelSerializer):
    """ModelSerializer #1 — Review CRUD"""
    user = serializers.SerializerMethodField()
    movie_id = serializers.PrimaryKeyRelatedField(
        queryset=Movie.objects.all(), source='movie', write_only=True
    )

    class Meta:
        model = Review
        fields = ['id', 'movie_id', 'user', 'rating', 'comment', 'date']
        read_only_fields = ['id', 'user', 'date']

    def get_user(self, obj):
        return obj.user.username

    def validate_rating(self, value):
        if not (1 <= value <= 10):
            raise serializers.ValidationError("Rating must be between 1 and 10.")
        return value

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class MovieModelSerializer(serializers.ModelSerializer):
    """ModelSerializer #2 — Movie with genres"""
    genres = serializers.SlugRelatedField(
        many=True, slug_field='name',
        queryset=Genre.objects.all()
    )

    class Meta:
        model = Movie
        fields = [
            'id', 'title', 'title_ru', 'title_kz',
            'genres', 'year', 'description', 'description_ru', 'description_kz',
            'rating', 'poster', 'trailer_id',
        ]


class WatchlistItemModelSerializer(serializers.ModelSerializer):
    movie = MovieModelSerializer(read_only=True)
    movie_id = serializers.PrimaryKeyRelatedField(
        queryset=Movie.objects.all(), source='movie', write_only=True
    )

    class Meta:
        model = WatchlistItem
        fields = ['id', 'user', 'movie', 'movie_id', 'status', 'added_at']
        read_only_fields = ['id', 'user', 'added_at']
