import Link from 'next/link';

interface RecordItemProps {
  id: string;
  title: string;
  date: string;
  imageBase64?: string;
  href: string;
}

export default function RecordItem({ title, date, imageBase64, href }: RecordItemProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 bg-white rounded-xl p-4 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all active:scale-95"
    >
      {imageBase64 && (
        <img
          src={imageBase64}
          alt=""
          className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{title}</p>
        <p className="text-xs text-gray-400 mt-0.5">{date}</p>
      </div>
      <span className="text-gray-300 flex-shrink-0">›</span>
    </Link>
  );
}
