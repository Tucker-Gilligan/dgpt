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

const phone = "973-396-7694";
const bookingUrl = "#booking-placeholder";

function ActionButtons({ compact = false }: { compact?: boolean }) {
  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} className={compact ? "actions compact" : "actions"}>
      <Button href={bookingUrl} variant="contained" className="button-primary" startIcon={<CalendarMonthOutlinedIcon />}>
        Book online
      </Button>
      <Button href={`tel:${phone.replace(/\D/g, "")}`} variant="outlined" className="button-secondary" startIcon={<PhoneRoundedIcon />}>
        Call {phone}
      </Button>
    </Stack>
  );
}

export default function Home() {
  return (
    <main>
      <div className="topbar">
        <Container className="topbar-inner">
          <span>Now accepting new patients in Denville</span>
          <a href={`tel:${phone.replace(/\D/g, "")}`}>Call {phone}</a>
        </Container>
      </div>

      <header className="site-header">
        <Container className="header-inner">
          <a className="brand" href="#top" aria-label="Dynamic Gains Physical Therapy home">
            <span className="brand-mark">DG</span>
            <span><strong>Dynamic Gains</strong><small>Physical Therapy</small></span>
          </a>
          <nav aria-label="Main navigation">
            <a href="#services">Services</a><a href="#specialties">Specialties</a><a href="#about">About</a><a href="#visit">Visit us</a>
          </nav>
          <a className="header-book" href={bookingUrl}>Book now <ArrowOutwardRoundedIcon fontSize="small" /></a>
        </Container>
      </header>

      <section className="hero" id="top">
        <Container className="hero-grid">
          <div className="hero-copy">
            <Chip label="PHYSICAL THERAPY • DENVILLE, NJ" className="eyebrow" />
            <h1>Move better.<br /><em>Feel like yourself.</em></h1>
            <p>Thoughtful, one-on-one physical therapy for the way you live, work, train, and recover.</p>
            <ActionButtons />
            <div className="hero-note"><span>✓</span> In-network with Blue Cross Blue Shield</div>
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
        <Container><p>Care that connects the dots — from today&apos;s symptoms to the confidence to keep moving.</p><span>ORTHOPEDIC · TMJ · VESTIBULAR · SCOLIOSIS</span></Container>
      </section>

      <section className="section" id="services">
        <Container>
          <div className="section-intro"><span className="kicker">HOW WE CAN HELP</span><h2>Care that meets you<br />where you are.</h2><p>Whether pain is holding you back or you&apos;re ready to return to the things you love, your plan starts with listening.</p></div>
          <div className="service-grid">
            {[
              ["01", "Orthopedic physical therapy", "Pain, injury, post-surgical recovery, strength, and return to activity."],
              ["02", "TMJ therapy", "A whole-person approach to jaw pain, headaches, clenching, and comfortable movement."],
              ["03", "Vestibular rehabilitation", "Support for dizziness, balance concerns, vertigo, and confidence on your feet."],
              ["04", "Schroth & scoliosis care", "Scoliosis-specific exercise and education tailored to your unique curve pattern."],
            ].map(([number, title, detail]) => <article className="service-card" key={number}><span>{number}</span><h3>{title}</h3><p>{detail}</p><a href="#specialties" aria-label={`Learn about ${title}`}>Explore <ArrowOutwardRoundedIcon fontSize="small" /></a></article>)}
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
              <AccordionDetails>TMJ symptoms can be influenced by the jaw, neck, posture, breathing, and daily movement habits. Physical therapy can help assess these connected areas and build a personalized plan to improve mobility, reduce sensitivity, and support more comfortable function.</AccordionDetails>
            </Accordion>
            <Accordion className="info-accordion" disableGutters>
              <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}><strong>What is the Schroth Method?</strong></AccordionSummary>
              <AccordionDetails>The Schroth Method is a scoliosis-specific exercise approach that uses individualized posture, breathing, and strengthening strategies. Dalton holds PSSE–Schroth Level 1 certification and tailors care to each patient&apos;s curve pattern and goals.</AccordionDetails>
            </Accordion>
            <Accordion className="info-accordion" disableGutters>
              <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}><strong>What happens at my first visit?</strong></AccordionSummary>
              <AccordionDetails>We&apos;ll start with a conversation about what matters to you, then complete a focused movement assessment. You&apos;ll leave with clarity about your plan and practical next steps.</AccordionDetails>
            </Accordion>
          </div>
        </Container>
      </section>

      <section className="about section" id="about"><Container className="about-grid"><div><span className="kicker">MEET YOUR THERAPIST</span><h2>Expert guidance.<br /><em>Human care.</em></h2></div><div className="about-copy"><p className="lead">Dalton Gilligan, DPT brings a whole-body perspective to every plan of care—helping people understand what&apos;s happening, move with less fear, and build lasting confidence.</p><p>With extensive training in TMJ and vestibular rehabilitation and PSSE–Schroth Level 1 certification, Dalton combines specialized knowledge with practical, patient-centered treatment.</p><a href="#visit" className="text-link">Meet Dalton <ArrowOutwardRoundedIcon fontSize="small" /></a></div></Container></section>

      <section className="visit" id="visit"><Container className="visit-grid"><div><span className="kicker">VISIT DYNAMIC GAINS</span><h2>Your next step<br />starts here.</h2><p>Conveniently located on Route 10 East in Denville.</p><div className="visit-details"><p><LocationOnOutlinedIcon />3175 Route 10 East<br /><span>Denville, NJ 07834</span></p><p><PhoneRoundedIcon /><a href={`tel:${phone.replace(/\D/g, "")}`}>{phone}</a><br /><span>Hours: [coming soon]</span></p></div></div><div className="visit-actions"><h3>Ready when you are.</h3><p>Book online, give us a call, or make a secure payment.</p><ActionButtons compact /><Button href="#payment-placeholder" variant="text" className="payment-link" startIcon={<PaymentsOutlinedIcon />}>Make a payment</Button><small>Secure Clover payment link coming soon.</small></div></Container></section>

      <footer><Container className="footer-inner"><a className="brand footer-brand" href="#top"><span className="brand-mark">DG</span><span><strong>Dynamic Gains</strong><small>Physical Therapy</small></span></a><p>© {new Date().getFullYear()} Dynamic Gains Physical Therapy. All rights reserved.</p><p className="placeholder">Logo, email, hours & patient links coming soon.</p></Container></footer>
      <div className="mobile-actions"><a href={`tel:${phone.replace(/\D/g, "")}`}><PhoneRoundedIcon /> Call</a><a href={bookingUrl}><CalendarMonthOutlinedIcon /> Book online</a></div>
    </main>
  );
}
