import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';

export function formatDate(date, fmt = 'MMM d, yyyy') {
  if (!date) return '—';
  const d = typeof date === 'string' ? parseISO(date) : new Date(date);
  if (!isValid(d)) return '—';
  return format(d, fmt);
}

export function formatDateTime(date) {
  return formatDate(date, 'MMM d, yyyy h:mm a');
}

export function formatRelative(date) {
  if (!date) return '—';
  const d = typeof date === 'string' ? parseISO(date) : new Date(date);
  if (!isValid(d)) return '—';
  return formatDistanceToNow(d, { addSuffix: true });
}

export function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return null;
  const birth = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export function formatAge(dateOfBirth) {
  const age = calculateAge(dateOfBirth);
  return age !== null ? `${age} yrs` : '—';
}

export function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');
}

export function formatPhone(phone) {
  if (!phone) return '—';
  return phone;
}

export function truncate(str, max = 40) {
  if (!str) return '';
  return str.length > max ? str.slice(0, max) + '…' : str;
}

export function toInputDate(date) {
  if (!date) return '';
  const d = new Date(date);
  if (!isValid(d)) return '';
  return format(d, 'yyyy-MM-dd');
}
