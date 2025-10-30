import { RxDotFilled } from "react-icons/rx";

interface ConnectionStatusProps {
  connected: boolean;
  className?: string;
}

export default function ConnectionStatus({
  connected,
  className = "",
}: ConnectionStatusProps) {
  return (
    <div className={`ml-2 absolute z-999 right-0.5 top-0.5 ${className}`}>
      {connected ? (
        <span className="text-green-400" title="Connection">
          <RxDotFilled />
        </span>
      ) : (
        <span className="text-red-400" title="Disconnected">
          <RxDotFilled />
        </span>
      )}
    </div>
  );
}
