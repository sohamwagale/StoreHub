export function formatRatingResponse(saved: any) {
  return {
    id: saved._id.toString(),
    _id: saved._id.toString(),
    storeId: saved.storeId.toString(),
    userId: saved.userId.toString(),
    rating: saved.rating,
    review: saved.review || '',
    photos: saved.photos || [],
    createdAt: saved.createdAt,
    updatedAt: saved.updatedAt,
  };
}

export function formatStoreReviews(ratings: any[], currentUserId?: string) {
  return ratings.map((r: any) => {
    const likes = (r.likes || []).map((id: any) => id.toString());
    const dislikes = (r.dislikes || []).map((id: any) => id.toString());

    let userVote: 'LIKE' | 'DISLIKE' | null = null;
    if (currentUserId) {
      if (likes.includes(currentUserId)) {
        userVote = 'LIKE';
      } else if (dislikes.includes(currentUserId)) {
        userVote = 'DISLIKE';
      }
    }

    return {
      id: r._id.toString(),
      _id: r._id.toString(),
      rating: r.rating,
      review: r.review || '',
      photos: r.photos || [],
      likesCount: likes.length,
      dislikesCount: dislikes.length,
      userVote,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      user: {
        id: r.userId?._id ? r.userId._id.toString() : (r.userId?.toString() || 'anonymous'),
        name: r.userId?.name || 'Verified Shopper',
      },
    };
  });
}

export function formatMyRatings(ratings: any[]) {
  return ratings.map((r: any) => ({
    id: r._id.toString(),
    _id: r._id.toString(),
    rating: r.rating,
    review: r.review || '',
    photos: r.photos || [],
    likesCount: Array.isArray(r.likes) ? r.likes.length : 0,
    dislikesCount: Array.isArray(r.dislikes) ? r.dislikes.length : 0,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    store: r.storeId
      ? {
          id: r.storeId._id ? r.storeId._id.toString() : r.storeId.toString(),
          name: r.storeId.name,
          address: r.storeId.address,
          category: r.storeId.category || 'General',
          photos: r.storeId.photos || [],
        }
      : null,
  }));
}
