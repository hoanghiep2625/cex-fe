interface ConnectionStatusProps {
  connected: boolean;
  className?: string;
}

export default function ConnectionStatus({
  connected,
  className = "",
}: ConnectionStatusProps) {
  return (
    <div className={`text-xs ml-2 absolute right-1 top-0 ${className}`}>
      {connected ? (
        <span className="text-green-400">●</span>
      ) : (
        <span className="text-red-400">●</span>
      )}
    </div>
  );
}
