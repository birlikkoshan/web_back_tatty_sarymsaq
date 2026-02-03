/**
 * Calculate course enrollment statistics
 * @param {Object} item - Course item with enrolled and capacity
 * @returns {Object} Object with percentage and spotsRemaining
 */
function calculateStats(item) {
  if (!item || !item.capacity) return { percentage: 0, spotsRemaining: 0 };
  const percentage = Math.round((item.enrolled / item.capacity) * 100) || 0;
  const spotsRemaining = Math.max(0, item.capacity - item.enrolled);
  return { percentage, spotsRemaining };
}

module.exports = { calculateStats };
