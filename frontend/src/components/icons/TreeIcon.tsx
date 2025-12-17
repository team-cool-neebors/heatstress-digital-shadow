import React from "react";

export const TreeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
   <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 2L7 9h10L12 2z" />
    <path d="M12 6L6 14h12L12 6z" />
    <path d="M12 11L5 20h14L12 11z" />

    <line x1="12" y1="20" x2="12" y2="23" />
  </svg>
);