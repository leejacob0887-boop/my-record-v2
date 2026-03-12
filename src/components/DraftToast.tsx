type Props = {
  onResume: () => void;
  onDiscard: () => void;
};

export default function DraftToast({ onResume, onDiscard }: Props) {
  return (
    <div className="
      fixed top-0 left-0 right-0 z-50
      flex items-center justify-between
      px-4 py-3
      bg-white dark:bg-gray-800
      border-b border-gray-100 dark:border-gray-700
      shadow-md
      animate-slide-down
    ">
      <span className="text-sm text-gray-700 dark:text-gray-200">
        📝 이전 작성 내용이 있어요
      </span>
      <div className="flex gap-2">
        <button
          onClick={onResume}
          className="text-sm font-semibold text-[#4A90D9] hover:text-[#3A7FC9] transition-colors"
        >
          이어쓰기
        </button>
        <span className="text-gray-300">|</span>
        <button
          onClick={onDiscard}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          새로쓰기
        </button>
      </div>
    </div>
  );
}
