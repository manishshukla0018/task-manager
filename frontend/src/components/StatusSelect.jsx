import { STATUS_OPTIONS } from '../utils/taskHelpers';

const statusStyles = {
  'To Do': 'bg-gray-100 text-gray-800 border-gray-300',
  'In Progress': 'bg-blue-50 text-blue-800 border-blue-300',
  Done: 'bg-green-50 text-green-800 border-green-300',
};

export function StatusBadge({ status }) {
  const value = status || 'To Do';
  return (
    <span
      className={`inline-flex items-center text-xs font-semibold rounded-full px-3 py-1 border ${statusStyles[value] || statusStyles['To Do']}`}
    >
      {value}
    </span>
  );
}

export default function StatusSelect({ status, onChange, disabled }) {
  const value = status || 'To Do';

  if (disabled) {
    return <StatusBadge status={value} />;
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`text-xs font-semibold rounded-lg px-2 py-1.5 border cursor-pointer min-w-[120px] ${statusStyles[value] || statusStyles['To Do']}`}
    >
      {STATUS_OPTIONS.map((s) => (
        <option key={s} value={s} className="text-gray-900 bg-white">
          {s}
        </option>
      ))}
    </select>
  );
}
