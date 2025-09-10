"use client";

import { useState } from "react";

interface HamburgerProps {
  onClick: () => void;
}

export default function Hamburger({ onClick }: HamburgerProps) {
  return (
    <button onClick={onClick} style={{ fontSize: "1.5rem", cursor: "pointer" }}>
      &#9776; {/* Hamburger Icon */}
    </button>
  );
}
