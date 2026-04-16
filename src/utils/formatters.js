const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const compactNumberFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

export function formatCurrency(value) {
  return currencyFormatter.format(value ?? 0);
}

export function formatCompactNumber(value) {
  return compactNumberFormatter.format(value ?? 0);
}

export function formatDateTime(value) {
  if (!value) {
    return 'Just now';
  }

  const date = value instanceof Date ? value : new Date(value);
  return dateTimeFormatter.format(date);
}

export function formatRelativeTime(value) {
  if (!value) {
    return 'just now';
  }

  const date = value instanceof Date ? value : new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.round(diffMs / 60000);

  if (diffMinutes < 1) {
    return 'just now';
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.round(diffHours / 24);

  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  return formatDateTime(date);
}

export function formatTags(tags = []) {
  return tags.filter(Boolean).join(', ');
}

