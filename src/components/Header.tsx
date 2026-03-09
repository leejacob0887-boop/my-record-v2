import Link from 'next/link';

interface HeaderProps {
  title: string;
  backHref?: string;
}

export default function Header({ title, backHref }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
      {backHref && (
        <Link href={backHref} className="text-gray-500 hover:text-gray-800 text-lg leading-none">
          ←
        </Link>
      )}
      <h1 className="text-base font-semibold text-gray-800">{title}</h1>
    </header>
  );
}
