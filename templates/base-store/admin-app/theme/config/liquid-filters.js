/**
 * Liquid Filter Implementations for Admin
 */

export function assetUrlFilter(value) {
  const baseUrl = process.env.ASSET_BASE_URL || '/assets';
  return `${baseUrl}/${value}`;
}

export function moneyFilter(value, currency = 'USD') {
  if (typeof value !== 'number') {
    value = parseFloat(value) || 0;
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(value);
}

export function dateFilter(value, format) {
  const date = value === 'now' ? new Date() : new Date(value);
  
  if (!format) {
    return date.toLocaleDateString();
  }
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
  const hour12 = date.getHours() % 12 || 12;
  
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return format
    .replace('%Y', year)
    .replace('%m', month)
    .replace('%d', day)
    .replace('%b', monthNames[date.getMonth()])
    .replace('%I', String(hour12).padStart(2, '0'))
    .replace('%M', minutes)
    .replace('%p', ampm);
}

export function jsonFilter(value) {
  return JSON.stringify(value);
}

export function defaultFilter(value, defaultValue) {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }
  return value;
}

export function sliceFilter(value, start, end) {
  if (Array.isArray(value)) {
    return value.slice(start, end);
  }
  if (typeof value === 'string') {
    return value.slice(start, end);
  }
  return value;
}

export function plusFilter(value, addend) {
  return (parseFloat(value) || 0) + (parseFloat(addend) || 0);
}

export function moduloFilter(value, divisor) {
  return (parseFloat(value) || 0) % (parseFloat(divisor) || 1);
}

export function splitFilter(value, delimiter) {
  if (typeof value === 'string') {
    return value.split(delimiter);
  }
  return [value];
}

export function timesFilter(value, multiplier) {
  return (parseFloat(value) || 0) * (parseFloat(multiplier) || 0);
}
