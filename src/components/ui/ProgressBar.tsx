interface ProgressBarProps {
  progress: number;
  isScanning: boolean;
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
}

export const ProgressBar = ({
  progress,
  isScanning,
  isPaused,
  onPause,
  onResume,
}: ProgressBarProps) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center">
        <div className="text-sm font-medium text-gray-700">
          {isScanning ? (
            isPaused ? 'Paused' : 'Scanning...'
          ) : (
            progress === 100 ? 'Complete' : 'Ready'
          )}
        </div>
        <div className="text-sm text-gray-500">
          {clampedProgress.toFixed(1)}%
        </div>
      </div>

      <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`absolute left-0 top-0 h-full rounded-full transition-all duration-300 ${
            isPaused
              ? 'bg-yellow-500'
              : progress === 100
              ? 'bg-green-500'
              : 'bg-blue-500'
          }`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>

      {isScanning && (
        <button
          onClick={isPaused ? onResume : onPause}
          className={`mt-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            isPaused
              ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
              : 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
          }`}
        >
          {isPaused ? 'Resume Scan' : 'Pause Scan'}
        </button>
      )}
    </div>
  );
}; 