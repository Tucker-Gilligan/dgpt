"use client";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Chip,
  Container,
  Stack,
} from "@mui/material";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import { useEffect, useState } from "react";
import { defaultContent, SiteContent } from "../lib/site-content";

function ActionButtons({ compact = false, content }: { compact?: boolean; content: SiteContent }) {
  const phoneDigits = content.phone.replace(/\D/g, "");
  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} className={compact ? "actions compact" : "actions"}>
      <Button href={content.bookingUrl} variant="contained" className="button-primary" startIcon={<CalendarMonthOutlinedIcon />}>
        Book online
      </Button>
      <Button href={`tel:${phoneDigits}`} variant="outlined" className="button-secondary" startIcon={<PhoneRoundedIcon />}>
        Call {content.phone}
      </Button>
    </Stack>
  );
}

export default function Home() {
  const [content, setContent] = useState<SiteContent>(defaultContent);
  useEffect(() => { fetch("/api/content").then(response => response.ok ? response.json() : null).then(value => value && setContent(value)).catch(() => undefined); }, []);
  const phoneDigits = content.phone.replace(/\D/g, "");
  return (
    <main>
      <div className="topbar">
        <Container className="topbar-inner">
          <span>{content.topbar}</span>
          <a href={`tel:${phoneDigits}`}>Call {content.phone}</a>
        </Container>
      </div>

      <header className="site-header">
        <Container className="header-inner">
          <a className="brand" href="#top" aria-label="Dynamic Gains Physical Therapy home">
            <span className="brand-mark"><img src="/dgpt-logo.svg" alt="DGPT Physical Therapy" /></span>
            <span className="brand-wordmark"><strong>Dynamic Gains</strong><small>Physical Therapy</small></span>
          </a>
          <nav aria-label="Main navigation">
            <a href="#services">Services</a><a href="#specialties">Specialties</a><a href="#about">About</a><a href="#visit">Visit us</a>
          </nav>
          <a className="header-book" href={content.bookingUrl}>Book now <ArrowOutwardRoundedIcon fontSize="small" /></a>
        </Container>
      </header>

      <section className="hero" id="top">
        <Container className="hero-grid">
          <div className="hero-copy">
            <Chip label="PHYSICAL THERAPY • DENVILLE, NJ" className="eyebrow" />
            <h1>{content.heroTitle}<br /><em>{content.heroEmphasis}</em></h1>
            <p>{content.heroIntro}</p>
            <ActionButtons content={content} />
            <div className="hero-note"><span>✓</span> {content.heroNote}</div>
          </div>
          <div className="hero-art" aria-label="Dynamic Gains Physical Therapy visual placeholder">
            <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" /><div className="art-card">
              <span>Individualized care</span><strong>Built around your goals.</strong>
            </div>
            <div className="art-dots">●<br />●<br />●</div>
          </div>
        </Container>
      </section>

      <section className="trust-strip">
        <Container><p>{content.trustStrip}</p><span>ORTHOPEDIC · TMJ · VESTIBULAR · SCOLIOSIS</span></Container>
      </section>

      <section className="section" id="services">
        <Container>
          <div className="section-intro"><span className="kicker">HOW WE CAN HELP</span><h2>Care that meets you<br />where you are.</h2><p>Whether pain is holding you back or you&apos;re ready to return to the things you love, your plan starts with listening.</p></div>
          <div className="service-grid">
            {content.services.map(({ number, title, detail }) => <article className="service-card" key={number}><span>{number}</span><h3>{title}</h3><p>{detail}</p><a href="#specialties" aria-label={`Learn about ${title}`}>Explore <ArrowOutwardRoundedIcon fontSize="small" /></a></article>)}
          </div>
        </Container>
      </section>

      <section className="specialties" id="specialties">
        <Container className="specialties-grid">
          <div className="specialty-visual"><div className="s-curve" /><div className="specialty-label">Specialized<br />care</div></div>
          <div className="specialty-copy">
            <span className="kicker">A DEEPER LOOK</span><h2>Specialized care,<br /><em>clearly explained.</em></h2>
            <Accordion className="info-accordion" disableGutters>
              <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}><strong>How can physical therapy help TMJ?</strong></AccordionSummary>
              <AccordionDetails>{content.tmjAnswer}</AccordionDetails>
            </Accordion>
            <aside className="care-prep tmj-prep">
              <span>TMJ VISIT GUIDE</span><h3>{content.tmjExpectTitle}</h3><p>{content.tmjExpectBody}</p>
            </aside>
            <Accordion className="info-accordion" disableGutters>
              <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}><strong>What is the Schroth Method?</strong></AccordionSummary>
              <AccordionDetails>{content.schrothAnswer}</AccordionDetails>
            </Accordion>
            <aside className="care-prep scoliosis-prep">
              <span>SCOLIOSIS VISIT GUIDE</span><h3>Come prepared to learn.</h3>
              <div><strong>What to bring</strong><p>{content.schrothBring}</p></div>
              <div><strong>What to wear</strong><p>{content.schrothWear}</p></div>
              <div><strong>What to expect</strong><p>{content.schrothExpect}</p></div>
            </aside>
            <Accordion className="info-accordion" disableGutters>
              <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}><strong>What happens at my first visit?</strong></AccordionSummary>
              <AccordionDetails>{content.firstVisitAnswer}</AccordionDetails>
            </Accordion>
          </div>
        </Container>
      </section>

      <section className="about section" id="about"><Container className="about-grid"><div><span className="kicker">MEET YOUR THERAPIST</span><h2>Expert guidance.<br /><em>Human care.</em></h2></div><div className="about-copy"><p className="lead">{content.aboutLead}</p><p>{content.aboutBody}</p><a href="#visit" className="text-link">Meet Dalton <ArrowOutwardRoundedIcon fontSize="small" /></a></div></Container></section>

      <section className="visit" id="visit"><Container className="visit-grid"><div><span className="kicker">VISIT DYNAMIC GAINS</span><h2>Your next step<br />starts here.</h2><p>{content.visitIntro}</p><div className="visit-details"><p><LocationOnOutlinedIcon />{content.addressLine1}<br /><span>{content.addressLine2}</span></p><p><PhoneRoundedIcon /><a href={`tel:${phoneDigits}`}>{content.phone}</a><br /><span>{content.hours}</span></p></div></div><div className="visit-actions"><h3>{content.visitActionTitle}</h3><p>{content.visitActionText}</p><ActionButtons compact content={content} /><Button href={content.paymentUrl} variant="text" className="payment-link" startIcon={<PaymentsOutlinedIcon />}>Make a payment</Button><small>Secure Clover payment link coming soon.</small></div></Container></section>

      <footer><Container className="footer-inner"><a className="brand footer-brand" href="#top"><span className="brand-mark"><img src="/dgpt-logo.svg" alt="DGPT Physical Therapy" /></span><span className="brand-wordmark"><strong>Dynamic Gains</strong><small>Physical Therapy</small></span></a><p>© {new Date().getFullYear()} Dynamic Gains Physical Therapy. All rights reserved.</p><p className="placeholder">{content.footerNote}</p></Container></footer>
      <div className="mobile-actions"><a href={`tel:${phoneDigits}`}><PhoneRoundedIcon /> Call</a><a href={content.bookingUrl}><CalendarMonthOutlinedIcon /> Book online</a></div>
    </main>
  );
}
