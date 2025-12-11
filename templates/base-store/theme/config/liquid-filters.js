/**
 * Liquid Filter Implementations
 * Use these when setting up your Liquid renderer
 */

/**
 * Asset URL filter - converts asset filename to full URL
 * Usage: {{ 'index.css' | asset_url }}
 */
function assetUrlFilter(value) {
  // In production, this might be a CDN URL
  // In development, this might be a local path
  const baseUrl = process.env.ASSET_BASE_URL || '/assets';
  return `${baseUrl}/${value}`;
}

/**
 * Money filter - formats cents as currency
 * Usage: {{ product.priceCents | divided_by: 100.0 | money: 'USD' }}
 */
function moneyFilter(value, currency = 'USD') {
  if (typeof value !== 'number') {
    value = parseFloat(value) || 0;
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(value);
}

/**
 * Date filter - formats dates
 * Usage: {{ 'now' | date: '%Y' }}
 */
function dateFilter(value, format) {
  const date = value === 'now' ? new Date() : new Date(value);
  
  if (!format) {
    return date.toLocaleDateString();
  }
  
  // Simple format implementation
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return format
    .replace('%Y', year)
    .replace('%m', month)
    .replace('%d', day);
}

/**
 * JSON filter - converts object to JSON string
 * Usage: {{ store | json }}
 */
function jsonFilter(value) {
  return JSON.stringify(value);
}

/**
 * Default filter - provides default value if variable is empty
 * Usage: {{ product.description | default: 'No description' }}
 */
function defaultFilter(value, defaultValue) {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }
  return value;
}

/**
 * Slice filter - gets substring or array slice
 * Usage: {{ product.id | slice: -1 }}
 */
function sliceFilter(value, start, end) {
  if (Array.isArray(value)) {
    return value.slice(start, end);
  }
  if (typeof value === 'string') {
    return value.slice(start, end);
  }
  return value;
}

/**
 * Plus filter - adds numbers
 * Usage: {{ 5 | plus: 3 }} => 8
 */
function plusFilter(value, addend) {
  return (parseFloat(value) || 0) + (parseFloat(addend) || 0);
}

/**
 * Modulo filter - gets remainder
 * Usage: {{ 10 | modulo: 3 }} => 1
 */
function moduloFilter(value, divisor) {
  return (parseFloat(value) || 0) % (parseFloat(divisor) || 1);
}

/**
 * Split filter - splits string into array
 * Usage: {{ 'a,b,c' | split: ',' }}
 */
function splitFilter(value, delimiter) {
  if (typeof value === 'string') {
    return value.split(delimiter);
  }
  return [value];
}

export {
  assetUrlFilter,
  moneyFilter,
  dateFilter,
  jsonFilter,
  defaultFilter,
  sliceFilter,
  plusFilter,
  moduloFilter,
  splitFilter,
};
