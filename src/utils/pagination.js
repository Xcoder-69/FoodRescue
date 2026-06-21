/**
 * Firestore cursor-based pagination helper
 * Firestore doesn't support OFFSET, so we use document snapshots as cursors
 */

/**
 * Paginate a Firestore query
 * @param {FirebaseFirestore.Query} query - Base Firestore query (with filters/orderBy)
 * @param {object} options
 * @param {number} options.limit - Items per page (default 10, max 50)
 * @param {string} options.cursor - Last document ID from previous page
 * @param {FirebaseFirestore.CollectionReference} options.collection - Collection ref for cursor lookup
 * @returns {{ data: Array, nextCursor: string|null, hasMore: boolean }}
 */
const paginateQuery = async (query, { limit = 10, cursor = null, collection = null } = {}) => {
  const pageSize = Math.min(parseInt(limit) || 10, 50);

  let paginatedQuery = query.limit(pageSize + 1); // Fetch one extra to check hasMore

  if (cursor && collection) {
    try {
      const cursorDoc = await collection.doc(cursor).get();
      if (cursorDoc.exists) {
        paginatedQuery = paginatedQuery.startAfter(cursorDoc);
      }
    } catch (err) {
      // Invalid cursor — ignore and start from beginning
    }
  }

  const snapshot = await paginatedQuery.get();
  const docs = snapshot.docs;

  const hasMore = docs.length > pageSize;
  if (hasMore) docs.pop(); // Remove the extra doc

  const data = docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  const nextCursor = hasMore ? docs[docs.length - 1].id : null;

  return { data, nextCursor, hasMore, count: data.length };
};

/**
 * Parse pagination params from request query
 */
const getPaginationParams = (query) => ({
  limit: parseInt(query.limit) || 10,
  cursor: query.cursor || null,
});

module.exports = { paginateQuery, getPaginationParams };
