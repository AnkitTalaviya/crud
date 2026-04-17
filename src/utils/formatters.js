const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const compactNumberFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

const dateOnlyFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

function coerceDateValue(value) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const parsedDate = new Date(`${value}T00:00:00`);
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

export function formatCurrency(value) {
  return currencyFormatter.format(value ?? 0);
}

export function formatCompactNumber(value) {
  return compactNumberFormatter.format(value ?? 0);
}

export function formatDateTime(value) {
  const date = coerceDateValue(value);

  if (!date) {
    return 'Just now';
  }

  return dateTimeFormatter.format(date);
}

export function formatDateOnly(value, fallback = 'Not scheduled') {
  const date = coerceDateValue(value);
  return date ? dateOnlyFormatter.format(date) : fallback;
}

export function formatRelativeTime(value) {
  const date = coerceDateValue(value);

  if (!date) {
    return 'just now';
  }

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
