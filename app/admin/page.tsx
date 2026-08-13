"use client";

import { Button, Container, TextField } from "@mui/material";
import { FormEvent, useEffect, useState } from "react";
import { defaultContent, SiteContent } from "../../lib/site-content";

const fields: Array<{ key: Exclude<keyof SiteContent, "services">; label: string; multiline?: boolean }> = [
  { key: "bookingUrl", label: "SPRY booking link" }, { key: "paymentUrl", label: "Clover payment link" }, { key: "phone", label: "Phone" },
  { key: "topbar", label: "Top bar message" }, { key: "heroTitle", label: "Hero headline" }, { key: "heroEmphasis", label: "Hero emphasis" },
  { key: "heroIntro", label: "Hero introduction", multiline: true }, { key: "heroNote", label: "Insurance note" }, { key: "trustStrip", label: "Trust-strip message", multiline: true },
  { key: "tmjAnswer", label: "TMJ answer", multiline: true }, { key: "tmjExpectTitle", label: "TMJ preparation box title" }, { key: "tmjExpectBody", label: "TMJ preparation box text", multiline: true },
  { key: "schrothAnswer", label: "Schroth answer", multiline: true }, { key: "schrothBring", label: "Schroth — what to bring", multiline: true }, { key: "schrothImagingDetails", label: "Schroth — imaging details", multiline: true }, { key: "schrothWear", label: "Schroth — what to wear", multiline: true }, { key: "schrothExpect", label: "Schroth — what to expect", multiline: true }, { key: "firstVisitAnswer", label: "First visit answer", multiline: true },
  { key: "aboutLead", label: "About Dalton — lead", multiline: true }, { key: "aboutBody", label: "About Dalton — body", multiline: true },
  { key: "visitIntro", label: "Visit intro" }, { key: "addressLine1", label: "Address line 1" }, { key: "addressLine2", label: "Address line 2" }, { key: "hours", label: "Hours" },
  { key: "visitActionTitle", label: "Visit callout title" }, { key: "visitActionText", label: "Visit callout text" }, { key: "footerNote", label: "Footer note" },
];

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [content, setContent] = useState<SiteContent>(defaultContent);
  const [servicesText, setServicesText] = useState(JSON.stringify(defaultContent.services, null, 2));
  const [status, setStatus] = useState("Enter the editor password to publish changes.");

  useEffect(() => { fetch("/api/content").then(r => r.json()).then((value: SiteContent) => { setContent(value); setServicesText(JSON.stringify(value.services, null, 2)); }).catch(() => undefined); }, []);
  const update = (key: Exclude<keyof SiteContent, "services">, value: string) => setContent(current => ({ ...current, [key]: value }));
  async function save(event: FormEvent) {
    event.preventDefault(); setStatus("Publishing…");
    try {
      const services = JSON.parse(servicesText);
      const response = await fetch("/api/content", { method: "PUT", headers: { "Content-Type": "application/json", "x-dgpt-admin-password": password }, body: JSON.stringify({ ...content, services }) });
      if (!response.ok) throw new Error(response.status === 401 ? "That password was not accepted." : "The change could not be saved.");
      setContent(await response.json()); setStatus("Published. The public site now has your changes.");
    } catch (error) { setStatus(error instanceof Error ? error.message : "The change could not be saved."); }
  }
  return <main className="admin-page"><Container maxWidth="md"><a className="admin-back" href="/">← View public site</a><h1>DGPT Content Studio</h1><p className="admin-lede">Edit public website content only. Do not enter patient, clinical, or payment details here.</p><form onSubmit={save}><TextField label="Editor password" type="password" value={password} onChange={e => setPassword(e.target.value)} fullWidth required margin="normal" autoComplete="current-password" />{fields.map(field => <TextField key={field.key} label={field.label} value={content[field.key]} onChange={e => update(field.key, e.target.value)} fullWidth multiline={field.multiline} minRows={field.multiline ? 3 : undefined} margin="normal" />)}<TextField label="Services (advanced)" helperText="Keep this as a valid list of service objects. Ask for help before changing the format." value={servicesText} onChange={e => setServicesText(e.target.value)} fullWidth multiline minRows={13} margin="normal" /><Button type="submit" variant="contained" className="admin-save">Publish changes</Button><p className="admin-status" role="status">{status}</p></form></Container></main>;
}
