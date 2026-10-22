"use client";

import { Button, Container, TextField } from "@mui/material";
import { FormEvent, useEffect, useState } from "react";
import { defaultContent, normalizeContent, orderOptions, OrderGroup, SiteContent } from "../../lib/site-content";

import { changedFields } from "../../lib/content-edits";

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
  const [baseline, setBaseline] = useState<SiteContent>(defaultContent);
  const [revision, setRevision] = useState<number | null>(null);
  const [conflict, setConflict] = useState(false);
  const [history, setHistory] = useState<Array<{ id: number; revision: number; savedAt: string; content: SiteContent }>>([]);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("Enter the editor password to publish changes.");

  async function loadLatest(preserveDraft = false) {
    const response = await fetch("/api/content");
    const version = response.headers.get("X-Content-Revision");
    if (!response.ok || version === null || !Number.isSafeInteger(Number(version))) throw new Error("Content could not be loaded. Refresh to try again; saving is disabled to protect existing edits.");
    const latest = normalizeContent(await response.json());
    const edits = preserveDraft ? changedFields(baseline, content) : {};
    setContent({ ...latest, ...edits }); setBaseline(latest); setRevision(Number(version)); setLoaded(true); setConflict(false);
    if (preserveDraft) setStatus("Latest content loaded with your changed fields kept in the draft. Review them carefully, then publish when ready.");
  }
  useEffect(() => { loadLatest().catch(error => setStatus(error.message)); }, []);
  async function loadHistory(older = false) {
    try {
      const before = older && history.length ? `&before=${history[history.length - 1].id}` : "";
      const response = await fetch(`/api/content?history=1${before}`, { headers: { "x-dgpt-admin-password": password } });
      if (!response.ok) throw new Error("Enter the editor password to load saved versions.");
      const versions = await response.json(); setHistory(current => older ? [...current, ...versions] : versions);
      setStatus(versions.length ? "Choose a version to load into the draft. Nothing changes publicly until you publish." : "No more saved versions. History begins with the first protected save.");
    } catch (error) { setStatus(error instanceof Error ? error.message : "History could not be loaded."); }
  }
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
    event.preventDefault(); if (!loaded || saving || conflict || revision === null) return; setSaving(true); setStatus("Publishing…");
    try {
      const response = await fetch("/api/content", { method: "PATCH", headers: { "Content-Type": "application/json", "x-dgpt-admin-password": password }, body: JSON.stringify({ revision, changes: changedFields(baseline, content) }) });
      if (!response.ok) {
        if (response.status === 409 || response.status === 503) setConflict(true);
        const error = await response.json(); throw new Error(error.error || "The change could not be saved.");
      }
      const saved = normalizeContent(await response.json());
      setContent(saved); setBaseline(saved); setRevision(Number(response.headers.get("X-Content-Revision"))); setStatus("Published. The public site now has your changes.");
    } catch (error) { setStatus(error instanceof Error ? error.message : "The change could not be saved."); } finally { setSaving(false); }
  }
  return <main className="admin-page"><Container maxWidth="md"><a className="admin-back" href="/">← View public site</a><h1>DGPT Content Studio</h1><p className="admin-lede">Edit public website content only. Do not enter patient, clinical, or payment details here.</p><form onSubmit={save}><fieldset disabled={!loaded || saving} className="admin-fields"><section className="layout-editor"><h2>Page layout</h2><p>Move sections up or down, then publish to apply the order. Items within a section stay together. The header and footer stay in place.</p>
      {(Object.keys(orderOptions) as OrderGroup[]).map(group => <OrderEditor key={group} title={{ sections: "Page sections", specialties: "Within specialized care", schrothGuide: "Within the scoliosis visit guide" }[group]} items={content.layoutOrder[group].map(id => ({ id, label: (orderOptions[group] as Record<string, string>)[id] }))} onMove={(index, direction) => moveGroup(group, index, direction)} />)}
      <OrderEditor title="Service cards" items={content.services.map(service => ({ id: service.number, label: service.title }))} onMove={(index, direction) => setContent(current => ({ ...current, services: moveItem(current.services, index, direction) }))} />
    </section><h2>Website content</h2><TextField label="Editor password" type="password" value={password} onChange={e => setPassword(e.target.value)} fullWidth required margin="normal" autoComplete="current-password" />{fields.map(field => <TextField key={field.key} label={field.label} value={content[field.key]} onChange={e => update(field.key, e.target.value)} fullWidth multiline={field.multiline} minRows={field.multiline ? 3 : undefined} margin="normal" />)}<section className="service-editor"><h3>Service descriptions</h3>{content.services.map((service, index) => <div key={service.number}><TextField label={`Service ${index + 1} title`} value={service.title} fullWidth margin="normal" onChange={e => setContent(current => ({ ...current, services: current.services.map((item, i) => i === index ? { ...item, title: e.target.value } : item) }))} /><TextField label={`Service ${index + 1} description`} value={service.detail} multiline minRows={2} fullWidth margin="normal" onChange={e => setContent(current => ({ ...current, services: current.services.map((item, i) => i === index ? { ...item, detail: e.target.value } : item) }))} /></div>)}</section><Button type="submit" disabled={conflict} variant="contained" className="admin-save">Publish changes</Button></fieldset><p className="admin-status" role="status">{status}</p>{conflict && <div className="content-conflict" role="alert"><p>Another save may have changed this page. Your draft is still here.</p><Button type="button" onClick={() => loadLatest(true).catch(error => setStatus(error.message))}>Load latest and keep my changed fields for review</Button></div>}
      <section className="content-history"><h2>Saved versions</h2><p>Load a previous version into your draft to review it. Publish only when you are ready to restore it.</p><Button type="button" disabled={!loaded || saving} onClick={() => loadHistory()}>Load saved versions</Button>
      <ul>{history.map(item => <li key={item.id}>Version {item.revision} · {new Date(item.savedAt.replace(" ", "T") + "Z").toLocaleString()} <Button type="button" disabled={!loaded || saving} onClick={() => { setContent(item.content); setStatus(`Version ${item.revision} loaded into your draft. Review before publishing.`); }}>Use as draft</Button></li>)}</ul>
      {history.length > 0 && <Button type="button" disabled={saving} onClick={() => loadHistory(true)}>Load older versions</Button>}</section>
    </form></Container></main>;
}
