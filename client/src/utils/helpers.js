import { format, parseISO, isValid } from 'date-fns';

export const formatDate = (date, fmt = 'MMM dd, yyyy') => {
  if (!date) return 'N/A';
  try {
    const d = typeof date === 'string' ? parseISO(date) : new Date(date);
    if (!isValid(d)) return 'Invalid date';
    return format(d, fmt);
  } catch {
    return 'Invalid date';
  }
};

export const formatDateInput = (date) => {
  if (!date) return '';
  try {
    const d = typeof date === 'string' ? parseISO(date) : new Date(date);
    if (!isValid(d)) return '';
    return format(d, 'yyyy-MM-dd');
  } catch {
    return '';
  }
};

export const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
};

export const getInitials = (firstName, lastName) => {
  const f = firstName?.charAt(0)?.toUpperCase() || '';
  const l = lastName?.charAt(0)?.toUpperCase() || '';
  return `${f}${l}` || '??';
};

export const truncate = (str, length = 50) => {
  if (!str) return '';
  return str.length > length ? `${str.substring(0, length)}...` : str;
};

export const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

export const getStatusColor = (status) => {
  const colors = {
    Active: 'bg-green-100 text-green-800',
    Inactive: 'bg-gray-100 text-gray-800',
    Archived: 'bg-gray-100 text-gray-600',
    Scheduled: 'bg-blue-100 text-blue-800',
    Completed: 'bg-green-100 text-green-800',
    Cancelled: 'bg-red-100 text-red-800',
    'No Show': 'bg-yellow-100 text-yellow-800',
    Pending: 'bg-amber-100 text-amber-800',
    Resolved: 'bg-blue-100 text-blue-800',
    Yes: 'bg-red-100 text-red-800',
    No: 'bg-green-100 text-green-800',
    Unknown: 'bg-gray-100 text-gray-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getInfectionColor = (status) => {
  if (status === 'Yes') return 'text-red-600 bg-red-50';
  if (status === 'No') return 'text-green-600 bg-green-50';
  return 'text-gray-500 bg-gray-50';
};

export const debounce = (fn, delay = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  return phone;
};

export const isToday = (date) => {
  if (!date) return false;
  const d = new Date(date);
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
};
