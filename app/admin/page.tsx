"use client";

import { Button, Container, TextField } from "@mui/material";
import { FormEvent, useEffect, useState } from "react";
import { defaultContent, normalizeContent, orderOptions, OrderGroup, SiteContent } from "../../lib/site-content";

import { OrderEditor } from "./order-editor";

const fields: Array<{ key: Exclude<keyof SiteContent, "services" | "layoutOrder">; label: string; multiline?: boolean }> = [
  { key: "paymentDetails", label: "Payment details — public instructions", multiline: true },
  { key: "bookingUrl", label: "SPRY booking link" }, { key: "paymentUrl", label: "Clover payment link" }, { key: "phone", label: "Phone" },
  { key: "topbar", label: "Top bar message" }, { key: "heroTitle", label: "Hero headline" }, { key: "heroEmphasis", label: "Hero emphasis" },
  { key: "heroIntro", label: "Hero introduction", multiline: true }, { key: "heroNote", label: "Insurance note" }, { key: "trustStrip", label: "Trust-strip message", multiline: true },
  { key: "tmjAnswer", label: "TMJ answer", multiline: true }, { key: "tmjExpectTitle", label: "TMJ preparation box title" }, { key: "tmjExpectBody", label: "TMJ preparation box text", multiline: true },
  { key: "schrothAnswer", label: "Schroth answer", multiline: true }, { key: "schrothBring", label: "Schroth — what to bring", multiline: true }, { key: "schrothImagingDetails", label: "Schroth — imaging details", multiline: true }, { key: "schrothWear", label: "Schroth — what to wear", multiline: true }, { key: "schrothExpect", label: "Schroth — what to expect", multiline: true }, { key: "firstVisitAnswer", label: "First visit answer", multiline: true },
  { key: "aboutLead", label: "About Dalton — lead", multiline: true }, { key: "aboutBody", label: "About Dalton — body", multiline: true },
  { key: "visitIntro", label: "Visit intro" }, { key: "addressLine1", label: "Address line 1" }, { key: "addressLine2", label: "Address line 2" }, { key: "hours", label: "Hours" },
  { key: "visitActionTitle", label: "Visit callout title" }, { key: "visitActionText", label: "Visit callout text" },
];

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [content, setContent] = useState<SiteContent>(defaultContent);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("Enter the editor password to publish changes.");

  useEffect(() => { fetch("/api/content").then(r => { if (!r.ok) throw new Error(); return r.json(); }).then(value => { setContent(normalizeContent(value)); setLoaded(true); }).catch(() => setStatus("Content could not be loaded. Refresh to try again; saving is disabled to protect existing edits.")); }, []);
  function moveItem<T>(items: T[], index: number, direction: -1 | 1): T[] {
    const next = [...items]; const destination = index + direction;
    if (destination < 0 || destination >= next.length) return next;
    [next[index], next[destination]] = [next[destination], next[index]];
    return next;
  }
  function moveGroup(group: OrderGroup, index: number, direction: -1 | 1) {
    setContent(current => ({ ...current, layoutOrder: { ...current.layoutOrder, [group]: moveItem<string>(current.layoutOrder[group], index, direction) } }));
  }
  const update = (key: Exclude<keyof SiteContent, "services" | "layoutOrder">, value: string) => setContent(current => ({ ...current, [key]: value }));
  async function save(event: FormEvent) {
    event.preventDefault(); if (!loaded || saving) return; setSaving(true); setStatus("Publishing…");
    try {
      const response = await fetch("/api/content", { method: "PUT", headers: { "Content-Type": "application/json", "x-dgpt-admin-password": password }, body: JSON.stringify(content) });
      if (!response.ok) throw new Error(response.status === 401 ? "That password was not accepted." : "The change could not be saved.");
      setContent(normalizeContent(await response.json())); setStatus("Published. The public site now has your changes.");
    } catch (error) { setStatus(error instanceof Error ? error.message : "The change could not be saved."); } finally { setSaving(false); }
  }
  return <main className="admin-page"><Container maxWidth="md"><a className="admin-back" href="/">← View public site</a><h1>DGPT Content Studio</h1><p className="admin-lede">Edit public website content only. Do not enter patient, clinical, or payment details here.</p><form onSubmit={save}><fieldset disabled={!loaded || saving} className="admin-fields"><section className="layout-editor"><h2>Page layout</h2><p>Move sections up or down, then publish to apply the order. Items within a section stay together. The header and footer stay in place.</p>
      {(Object.keys(orderOptions) as OrderGroup[]).map(group => <OrderEditor key={group} title={{ sections: "Page sections", specialties: "Within specialized care", schrothGuide: "Within the scoliosis visit guide" }[group]} items={content.layoutOrder[group].map(id => ({ id, label: (orderOptions[group] as Record<string, string>)[id] }))} onMove={(index, direction) => moveGroup(group, index, direction)} />)}
      <OrderEditor title="Service cards" items={content.services.map(service => ({ id: service.number, label: service.title }))} onMove={(index, direction) => setContent(current => ({ ...current, services: moveItem(current.services, index, direction) }))} />
    </section><h2>Website content</h2><TextField label="Editor password" type="password" value={password} onChange={e => setPassword(e.target.value)} fullWidth required margin="normal" autoComplete="current-password" />{fields.map(field => <TextField key={field.key} label={field.label} value={content[field.key]} onChange={e => update(field.key, e.target.value)} fullWidth multiline={field.multiline} minRows={field.multiline ? 3 : undefined} margin="normal" />)}<section className="service-editor"><h3>Service descriptions</h3>{content.services.map((service, index) => <div key={service.number}><TextField label={`Service ${index + 1} title`} value={service.title} fullWidth margin="normal" onChange={e => setContent(current => ({ ...current, services: current.services.map((item, i) => i === index ? { ...item, title: e.target.value } : item) }))} /><TextField label={`Service ${index + 1} description`} value={service.detail} multiline minRows={2} fullWidth margin="normal" onChange={e => setContent(current => ({ ...current, services: current.services.map((item, i) => i === index ? { ...item, detail: e.target.value } : item) }))} /></div>)}</section><Button type="submit" variant="contained" className="admin-save">Publish changes</Button></fieldset><p className="admin-status" role="status">{status}</p></form></Container></main>;
}
