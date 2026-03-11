export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-[#FAF8F4] dark:bg-gray-900">
      <div className="text-6xl mb-6">📴</div>
      <h1 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
        오프라인 상태입니다
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
        인터넷 연결을 확인해주세요.<br />
        이전에 저장된 기록은 계속 사용할 수 있습니다.
      </p>
      <a
        href="/"
        className="px-6 py-3 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition-colors"
      >
        다시 시도
      </a>
    </div>
  );
}
