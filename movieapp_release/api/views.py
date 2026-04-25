from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView

from .models import Movie, Review, WatchlistItem
from .serializers import (
    RegisterSerializer, LoginSerializer,
    MovieModelSerializer, ReviewModelSerializer, WatchlistItemModelSerializer,
)


#  FBV  #1 — Register

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """POST /api/auth/register/"""
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        return Response(
            {'token': token.key, 'user_id': user.id, 'username': user.username, 'email': user.email},
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



#  FBV  #2 — Login / Logout
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """POST /api/auth/login/  - identifier can be username OR email"""
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    identifier = serializer.validated_data['identifier']
    password = serializer.validated_data['password']

    # Try by username first, then by email
    user = authenticate(username=identifier, password=password)
    if user is None:
        try:
            u = User.objects.get(email=identifier)
            user = authenticate(username=u.username, password=password)
        except User.DoesNotExist:
            pass

    if user is None:
        return Response({'detail': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)

    token, _ = Token.objects.get_or_create(user=user)
    return Response({'token': token.key, 'user_id': user.id, 'username': user.username, 'email': user.email})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """POST /api/auth/logout/"""
    request.user.auth_token.delete()
    return Response({'detail': 'Logged out.'}, status=status.HTTP_200_OK)


#  CBV  #1 — Movie list & detail  (read-only public)

class MovieListView(generics.ListCreateAPIView):
    """GET /api/movies/   POST /api/movies/ (admin only via IsAdminUser check)"""
    queryset = Movie.objects.prefetch_related('genres').all()
    serializer_class = MovieModelSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]


class MovieDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PUT/PATCH/DELETE /api/movies/<id>/"""
    queryset = Movie.objects.prefetch_related('genres').all()
    serializer_class = MovieModelSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]



#  CBV  #2 — Review (full CRUD linked to request.user)

class ReviewListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/movies/<movie_id>/reviews/  — public
    POST /api/movies/<movie_id>/reviews/  — auth required
    """
    serializer_class = ReviewModelSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        return Review.objects.filter(movie_id=self.kwargs['movie_id']).select_related('user')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, movie_id=self.kwargs['movie_id'])

    def create(self, request, *args, **kwargs):
        # Inject movie_id into request data transparently
        data = request.data.copy()
        data['movie_id'] = kwargs['movie_id']
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PUT/PATCH/DELETE /api/reviews/<id>/  — owner only for mutating"""
    serializer_class = ReviewModelSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Review.objects.filter(user=self.request.user)



#  Watchlist  (APIView — counts as a CBV)

class WatchlistView(APIView):
    """
    GET    /api/watchlist/?status=watchlist|watched  - get items by status
    POST   /api/watchlist/                            — add movie
    DELETE /api/watchlist/<movie_id>/                 — remove
    PATCH  /api/watchlist/<movie_id>/                 — update status
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        status_filter = request.query_params.get('status')
        qs = WatchlistItem.objects.filter(user=request.user).select_related('movie')
        if status_filter:
            qs = qs.filter(status=status_filter)
        serializer = WatchlistItemModelSerializer(qs, many=True)
        return Response(serializer.data)

    def post(self, request):
        movie_id = request.data.get('movie_id')
        item_status = request.data.get('status', 'watchlist')
        try:
            movie = Movie.objects.get(pk=movie_id)
        except Movie.DoesNotExist:
            return Response({'detail': 'Movie not found.'}, status=status.HTTP_404_NOT_FOUND)

        item, created = WatchlistItem.objects.get_or_create(
            user=request.user, movie=movie,
            defaults={'status': item_status}
        )
        if not created:
            item.status = item_status
            item.save()

        serializer = WatchlistItemModelSerializer(item)
        code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        return Response(serializer.data, status=code)


class WatchlistItemView(APIView):
    """PATCH/DELETE /api/watchlist/<movie_id>/"""
    permission_classes = [IsAuthenticated]

    def _get_item(self, request, movie_id):
        try:
            return WatchlistItem.objects.get(user=request.user, movie_id=movie_id)
        except WatchlistItem.DoesNotExist:
            return None

    def patch(self, request, movie_id):
        item = self._get_item(request, movie_id)
        if not item:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        new_status = request.data.get('status')
        if new_status not in ('watchlist', 'watched'):
            return Response({'detail': 'Invalid status.'}, status=status.HTTP_400_BAD_REQUEST)
        item.status = new_status
        item.save()
        return Response(WatchlistItemModelSerializer(item).data)

    def delete(self, request, movie_id):
        item = self._get_item(request, movie_id)
        if not item:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# 
#  Watchlist status check
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def watchlist_status(request, movie_id):
    """GET /api/watchlist/<movie_id>/status/  - {status: 'none'|'watchlist'|'watched'}"""
    try:
        item = WatchlistItem.objects.get(user=request.user, movie_id=movie_id)
        return Response({'status': item.status})
    except WatchlistItem.DoesNotExist:
        return Response({'status': 'none'})
