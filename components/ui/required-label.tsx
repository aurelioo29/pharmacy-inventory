import type { ReactNode } from "react";

type RequiredLabelProps = {
  children: ReactNode;
  required?: boolean;
  className?: string;
};

export default function RequiredLabel({
  children,
  required = false,
  className = "",
}: RequiredLabelProps) {
  return (
    <label className={`mb-1 block text-md text-black ${className}`}>
      {children}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  );
}
