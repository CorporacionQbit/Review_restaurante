export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number,
) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}
