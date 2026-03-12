type Props = {
  onResume: () => void;
  onDiscard: () => void;
};

export default function DraftToast({ onResume, onDiscard }: Props) {
  return (
    <div className="fixed bottom-24 left-0 right-0 z-50 flex justify-center px-5 pointer-events-none">
      <div className="
        pointer-events-auto
        w-full max-w-[360px]
        bg-white/90 dark:bg-gray-800/90
        backdrop-blur-md
        rounded-2xl
        shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]
        border border-white/60 dark:border-gray-700/60
        px-5 py-4
        animate-slide-up-toast
      ">
        {/* 아이콘 + 텍스트 */}
        <div className="flex items-center gap-3 mb-3.5">
          <div className="w-9 h-9 rounded-xl bg-[#4A90D9]/10 dark:bg-[#4A90D9]/20 flex items-center justify-center flex-shrink-0">
            <span className="text-lg">📝</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-tight">
              이전 작성 내용이 있어요
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              이어쓸까요, 아니면 새로 시작할까요?
            </p>
          </div>
        </div>

        {/* 버튼 행 */}
        <div className="flex gap-2">
          <button
            onClick={onDiscard}
            className="
              flex-1 py-2.5 rounded-xl
              text-sm font-medium
              text-gray-500 dark:text-gray-400
              bg-gray-100 dark:bg-gray-700
              hover:bg-gray-200 dark:hover:bg-gray-600
              transition-colors
            "
          >
            새로쓰기
          </button>
          <button
            onClick={onResume}
            className="
              flex-[1.6] py-2.5 rounded-xl
              text-sm font-semibold
              text-white
              bg-[#4A90D9]
              hover:bg-[#3A7FC9]
              active:scale-95
              transition-all
              shadow-sm shadow-[#4A90D9]/30
            "
          >
            이어쓰기
          </button>
        </div>
      </div>
    </div>
  );
}
