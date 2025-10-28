// src/components/icons/AdjustIcon.tsx
import * as React from "react";

export type IconProps = React.SVGProps<SVGSVGElement> & {
  /** Kích thước icon (áp cho cả width/height) */
  size?: number | string;
  /** Dùng cho a11y: mô tả icon */
  title?: string;
};

const AdjustIcon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ size = 16, title = "Adjust", className = "", ...props }, ref) => {
    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        role="img"
        aria-label={title}
        xmlns="http://www.w3.org/2000/svg"
        className={`bn-svg cursor-pointer text-IconNormal hover:text-SecondaryText ${className}`}
        {...props}
      >
        <path
          d="M6.5 6.1l.092.004a.9.9 0 010 1.792L6.5 7.9H3a.9.9 0 010-1.8h3.5zM21 6.1l.092.004a.9.9 0 010 1.792L21 7.9h-8.5a.9.9 0 010-1.8H21zM21 16.1l.092.005a.9.9 0 010 1.79L21 17.9h-3.5a.9.9 0 010-1.8H21zM11.5 16.1l.092.005a.9.9 0 010 1.79l-.092.005H3a.9.9 0 010-1.8h8.5z"
          fill="currentColor"
        />
        <path
          d="M11.2 7a1.7 1.7 0 10-1.7 1.7v1.8a3.5 3.5 0 110-7 3.5 3.5 0 010 7V8.7A1.7 1.7 0 0011.2 7zM16.2 17a1.7 1.7 0 10-1.7 1.7v1.8a3.5 3.5 0 110-7 3.5 3.5 0 010 7v-1.8a1.7 1.7 0 001.7-1.7z"
          fill="currentColor"
        />
      </svg>
    );
  }
);

AdjustIcon.displayName = "AdjustIcon";
export default AdjustIcon;
