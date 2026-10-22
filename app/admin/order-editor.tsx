"use client";

import { Button } from "@mui/material";
import { useState } from "react";

export function OrderEditor({ title, items, onMove }: {
  title: string;
  items: Array<{ id: string; label: string }>;
  onMove: (index: number, direction: -1 | 1) => void;
}) {
  const [announcement, setAnnouncement] = useState("");
  function move(index: number, direction: -1 | 1) {
    onMove(index, direction);
    setAnnouncement(`${items[index].label} moved to position ${index + direction + 1} of ${items.length}.`);
  }
  return <section className="order-editor" aria-label={title}>
    <h3>{title}</h3>
    <ol>{items.map((item, index) => <li key={item.id}>
      <span><span className="order-position">{index + 1}.</span> {item.label}</span>
      <div className="order-buttons">
        <Button type="button" disabled={index === 0} onClick={() => move(index, -1)} aria-label={`Move ${item.label} up`}>↑ Up</Button>
        <Button type="button" disabled={index === items.length - 1} onClick={() => move(index, 1)} aria-label={`Move ${item.label} down`}>↓ Down</Button>
      </div>
    </li>)}</ol>
    <p className="order-announcement" role="status">{announcement}</p>
  </section>;
}
