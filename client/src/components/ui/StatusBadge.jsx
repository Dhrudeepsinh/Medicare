const STATUS_STYLES = {
  // Patient status
  Active: 'bg-green-100 text-green-700',
  Inactive: 'bg-gray-100 text-gray-600',
  Archived: 'bg-gray-100 text-gray-500',

  // Disease status
  Resolved: 'bg-green-100 text-green-700',
  Chronic: 'bg-purple-100 text-purple-700',
  'In Treatment': 'bg-blue-100 text-blue-700',
  Monitoring: 'bg-yellow-100 text-yellow-700',

  // Appointment status
  Scheduled: 'bg-blue-100 text-blue-700',
  Completed: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
  'No Show': 'bg-orange-100 text-orange-700',

  // Infection status
  Yes: 'bg-red-100 text-red-700',
  No: 'bg-green-100 text-green-700',
  Unknown: 'bg-gray-100 text-gray-600',
  Suspected: 'bg-yellow-100 text-yellow-700',

  // Test status
  Normal: 'bg-green-100 text-green-700',
  Abnormal: 'bg-red-100 text-red-700',
  Borderline: 'bg-yellow-100 text-yellow-700',
  Pending: 'bg-gray-100 text-gray-600',

  // Follow-up status
  Missed: 'bg-red-100 text-red-700',
};

export default function StatusBadge({ status, className = '' }) {
  if (!status) return null;
  const style = STATUS_STYLES[status] || 'bg-gray-100 text-gray-600';
  return (
    <span className={`badge ${style} ${className}`}>
      {status}
    </span>
  );
}
