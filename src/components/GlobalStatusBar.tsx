"use client";

export default function GlobalStatusBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#181A20] w-full overflow-hidden py-2 z-50">
      <div className="animate-marquee px-4 flex justify-center h-[12px] items-center whitespace-nowrap text-white">
        Global Status Bar
      </div>
    </div>
  );
}
