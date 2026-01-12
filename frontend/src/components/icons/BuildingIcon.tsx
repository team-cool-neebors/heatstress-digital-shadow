import React from "react";

export const BuildingIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <rect x="6" y="2" width="12" height="20" rx="1" />

    <line x1="9" y1="5" x2="9" y2="5" />
    <line x1="12" y1="5" x2="12" y2="5" />
    <line x1="15" y1="5" x2="15" y2="5" />

    <line x1="9" y1="8" x2="9" y2="8" />
    <line x1="12" y1="8" x2="12" y2="8" />
    <line x1="15" y1="8" x2="15" y2="8" />

    <line x1="9" y1="11" x2="9" y2="11" />
    <line x1="12" y1="11" x2="12" y2="11" />
    <line x1="15" y1="11" x2="15" y2="11" />

    <line x1="9" y1="14" x2="9" y2="14" />
    <line x1="12" y1="14" x2="12" y2="14" />
    <line x1="15" y1="14" x2="15" y2="14" />

    <rect x="11" y="18" width="2" height="4" />
  </svg>
);
