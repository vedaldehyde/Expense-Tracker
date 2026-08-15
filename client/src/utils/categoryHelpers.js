export const PREDEFINED_COLORS = {
  food: '#f59e0b',
  utilities: '#3b82f6',
  entertainment: '#ec4899',
  transport: '#10b981',
  health: '#ef4444',
  medicals: '#ef4444',
  others: '#9ca3af'
};

export const getCategoryColor = (categoryName) => {
  if (!categoryName) return '#9ca3af';
  const lower = categoryName.toLowerCase().trim();
  if (PREDEFINED_COLORS[lower]) {
    return PREDEFINED_COLORS[lower];
  }
  let hash = 0;
  for (let i = 0; i < lower.length; i++) {
    hash = lower.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 65%, 55%)`;
};

export const getCategoryIcon = (categoryName) => {
  if (!categoryName) return '📦';
  const lower = categoryName.toLowerCase().trim();
  if (lower.includes('food') || lower.includes('dine') || lower.includes('restaurant')) return '🍔';
  if (lower.includes('bill') || lower.includes('util') || lower.includes('electricity') || lower.includes('water')) return '💡';
  if (lower.includes('entertainment') || lower.includes('movie') || lower.includes('fun') || lower.includes('play')) return '🎬';
  if (lower.includes('travel') || lower.includes('transport') || lower.includes('cab') || lower.includes('flight') || lower.includes('car')) return '🚗';
  if (lower.includes('health') || lower.includes('med')) return '🏥';
  if (lower.includes('salary') || lower.includes('income')) return '💰';
  return '📦';
};
