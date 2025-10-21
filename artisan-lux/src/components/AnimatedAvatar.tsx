"use client";
import React from "react";

type Props = { size?: number };

export default function AnimatedAvatar({ size = 160 }: Props) {
  const s = size;
  return (
    <figure className="mascot-float" aria-label="Friendly mascot waving hello">
      <svg
        width={s}
        height={s}
        viewBox="0 0 200 200"
        role="img"
        aria-hidden="true"
        className="mascot"
      >
        {/* Face */}
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
        </defs>
        <circle cx="100" cy="100" r="70" fill="url(#g)" stroke="#111827" strokeWidth="3" />

        {/* Eyes */}
        <g>
          <circle cx="75" cy="95" r="8" fill="#111827" />
          <circle cx="125" cy="95" r="8" fill="#111827" />
          {/* eyelids */}
          <rect x="67" y="90" width="16" height="10" fill="#93c5fd" className="mascot-eye" />
          <rect x="117" y="90" width="16" height="10" fill="#93c5fd" className="mascot-eye" />
        </g>

        {/* Smile */}
        <path d="M70 120 C 90 140, 110 140, 130 120" fill="none" stroke="#111827" strokeWidth="4" strokeLinecap="round" />

        {/* Hand */}
        <g className="mascot-hand">
          <circle cx="155" cy="65" r="16" fill="#93c5fd" stroke="#111827" strokeWidth="3" />
          <rect x="140" y="70" width="32" height="8" rx="4" fill="#111827" />
        </g>

        {/* Stars */}
        <g opacity="0.6">
          <circle cx="40" cy="60" r="3" fill="#93c5fd" />
          <circle cx="170" cy="120" r="2" fill="#93c5fd" />
          <circle cx="45" cy="140" r="2.5" fill="#93c5fd" />
        </g>
      </svg>
      <figcaption className="sr-only">A cheerful round avatar gently floating and waving.</figcaption>
    </figure>
  );
}