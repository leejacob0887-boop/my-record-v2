import Link from 'next/link';

interface RecordTypeCardProps {
  type: 'diary' | 'moment' | 'idea';
  label: string;
  icon: string;
  count: number;
  href: string;
  description: string;
}

export default function RecordTypeCard({
  label,
  icon,
  count,
  href,
  description,
}: RecordTypeCardProps) {
  return (
    <Link
      href={href}
      className="block bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all active:scale-95"
    >
      <div className="flex items-start justify-between">
        <span className="text-3xl">{icon}</span>
        <span className="text-xs text-gray-400 bg-gray-50 rounded-full px-2 py-0.5">
          {count}개
        </span>
      </div>
      <h2 className="mt-3 text-base font-semibold text-gray-800">{label}</h2>
      <p className="mt-1 text-xs text-gray-400">{description}</p>
    </Link>
  );
}
