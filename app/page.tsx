"use client";

import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import { useEffect, useState } from "react";
import { defaultContent, SiteContent } from "../lib/site-content";

export default function Home() {
  const [content, setContent] = useState<SiteContent>(defaultContent);
  useEffect(() => {
    fetch("/api/content").then((response) => (response.ok ? response.json() : null)).then((value) => value && setContent(value)).catch(() => undefined);
  }, []);
  const phoneDigits = content.phone.replace(/\D/g, "");

  return <main>
    <header className="site-header"><div className="shell header-inner">
      <a className="brand" href="#top" aria-label="Dynamic Gains Physical Therapy home"><img src="/dgpt-logo.svg" alt="Dynamic Gains Physical Therapy" /><span>Dynamic Gains<small>Physical Therapy</small></span></a>
      <a className="quiet-link" href={`tel:${phoneDigits}`}>{content.phone}</a>
    </div></header>

    <section className="hero" id="top"><div className="shell hero-inner">
      <p className="eyebrow">PHYSICAL THERAPY · DENVILLE, NJ</p>
      <h1>{content.heroTitle} <em>{content.heroEmphasis}</em></h1>
      <p className="lede">{content.heroIntro}</p>
      <div className="actions"><a className="button" href={content.bookingUrl}>Book an appointment <ArrowOutwardRoundedIcon /></a><a className="text-action" href={`tel:${phoneDigits}`}><PhoneRoundedIcon /> Call {content.phone}</a></div>
      <p className="insurance-note">{content.heroNote}</p>
    </div></section>

    <section className="section" id="services"><div className="shell">
      <p className="eyebrow">WHAT WE TREAT</p>
      <div className="section-heading"><h2>Focused care for how you move.</h2><p>One-on-one treatment, designed around your goals.</p></div>
      <div className="services">{content.services.map((service) => <article key={service.number}><span>{service.number}</span><h3>{service.title}</h3><p>{service.detail}</p></article>)}</div>
    </div></section>

    <section className="about" id="about"><div className="shell about-inner"><p className="eyebrow">YOUR THERAPIST</p><div><h2>Expert guidance. <em>Human care.</em></h2><p>{content.aboutLead}</p><p>{content.aboutBody}</p></div></div></section>

    <section className="contact" id="contact"><div className="shell contact-inner"><div><p className="eyebrow">DYNAMIC GAINS PHYSICAL THERAPY</p><h2>Ready when you are.</h2><p>{content.addressLine1}<br />{content.addressLine2}</p></div><div className="contact-actions"><a className="button light" href={content.bookingUrl}>Book an appointment <ArrowOutwardRoundedIcon /></a><a href={`tel:${phoneDigits}`}>{content.phone}</a></div></div></section>
    <footer><div className="shell">© {new Date().getFullYear()} Dynamic Gains Physical Therapy</div></footer>
  </main>;
}
