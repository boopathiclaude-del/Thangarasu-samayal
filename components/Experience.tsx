'use client';

import { useEffect, useRef, useState } from 'react';
import ChatWidget from './ChatWidget';

const V_INTRO = '/Create_video_for_food_intro_20260928191426.mp4';

const V_CHICKEN = '/Chettinad_chicken_tossed_in_wok_20260928131329.mp4';
const V_DOSA = '/Ghee_roast_dosa_steaming_20260928131336.mp4';
const V_COFFEE = '/Pouring_South_Indian_filter_coffee_20260928131309.mp4';

// Plays a muted loop only while it is on screen, so at most one video decodes per viewport.
function AutoVideo({ src, className }: { src: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) v.play().catch(() => {}); else v.pause(); }, { threshold: 0.2 });
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return <video ref={ref} className={className} src={src} muted loop playsInline preload="metadata" />;
}

const dishes = [
  { name: 'Mutton Sukka', text: 'A bold, slow-cooked signature with the warmth of freshly ground spices.', accent: '01', img: '/Mutton_chettinad_dish_image_20260928153954.jpg' },
  { name: 'Kongunadu Chicken', text: 'Deep, aromatic flavour rooted in the culinary character of Kongunadu.', accent: '02', img: '/Kongunadu_Chicken_preparation_20260928154001.jpg' },
  { name: 'Chettinad Biryani', text: 'Fragrant rice, tender meat and a layered spice profile made for celebrations.', accent: '03', img: '/Chettinad_biryani_dish_20260928154008.jpg' },
  { name: 'Erode Special Rasam', text: 'A bright, comforting finish that brings the feast back home.', accent: '04', img: '/Erode_Rasam_dish_photo_20260928154012.jpg' },
];

const gallery: { tag: string; title: string; note: string; media: { type: 'video' | 'image'; src: string } }[] = [
  { tag: 'THE SPREAD', title: 'Straight from the kitchen', note: 'Freshly cooked, plated and ready for the leaf.', media: { type: 'video', src: '/create_video_without_human_20260928193253.mp4' } },
  { tag: 'LIVE COUNTER', title: 'Filter coffee, poured tall', note: 'The frothy South Indian pour that closes every feast.', media: { type: 'video', src: V_COFFEE } },
  { tag: 'SIGNATURE', title: 'Chicken milakari', note: 'Pepper-forward, slow-simmered and deeply aromatic.', media: { type: 'video', src: '/Chicken_milakari_promotion_video_20260928193702.mp4' } },
  { tag: 'THE FIRE', title: 'Pepper fry, wok-charred', note: 'Curry leaf, crushed pepper and slow-roasted masala.', media: { type: 'video', src: '/Chettinad_chicken_pepper_fry_20260928193029.mp4' } },
  { tag: 'SWEET FINISH', title: 'Payasam & sweets', note: 'Jaggery, ghee and slow-simmered milk to end the meal.', media: { type: 'video', src: '/Sweets_payasam_gallery_image_20260928193259.mp4' } },
];

export default function Experience() {
  const [event, setEvent] = useState('Wedding');
  const galleryRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = galleryRef.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const center = r.top + r.height / 2;
      const p = Math.max(-1.2, Math.min(1.2, (vh / 2 - center) / vh));
      el.style.setProperty('--p', p.toFixed(4));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) el.classList.add('in'); }), { threshold: 0.15 });
    io.observe(el);
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); io.disconnect(); cancelAnimationFrame(raf); };
  }, []);
  return (
    <main>
      <header className="nav">
        <a className="brand" href="#top"><span>TS</span> THANGARASU SAMAYAL</a>
        <div className="nav-links"><a href="#story">Our Story</a><a href="#feast">The Feast</a><a href="#gallery">Gallery</a><a href="#events">Events</a><a href="#enquire">Enquire</a></div>
        <a className="nav-cta" href="tel:8012678719">Call 8012678719</a>
      </header>

      <section className="hero" id="top">
        <video className="hero-video" src={V_INTRO} autoPlay muted loop playsInline preload="auto" />
        <div className="hero-copy">
          <p className="eyebrow">APPAKUDAL · ERODE · SINCE 1999</p>
          <h1>A feast<br /><em>worth gathering for.</em></h1>
          <p className="hero-lede">Traditional Kongunadu & Chettinad cooking, prepared for the moments people remember.</p>
          <div className="hero-actions"><a className="button button-primary" href="#enquire">Plan your feast <span>↗</span></a><a className="text-link" href="#story">Enter the story ↓</a></div>
        </div>
        <div className="hero-stat"><strong>25+</strong><span>YEARS OF<br />TRADITION</span></div>
      </section>

      <section className="marquee"><span>TRADITION · CRAFT · HOSPITALITY ·</span><span>TRADITION · CRAFT · HOSPITALITY ·</span></section>

      <section className="cinema">
        <AutoVideo src={V_CHICKEN} />
        <div className="cinema-copy"><p className="eyebrow">STRAIGHT FROM THE FIRE</p><h2>Chettinad chicken,<br /><em>wok-tossed.</em></h2><p>Freshly ground masala seared over open flame — the sound, smoke and aroma of a feast being made.</p></div>
      </section>

      <section className="story section" id="story">
        <div className="section-index">01 / THE ROOTS</div>
        <div className="story-media"><img src="/Chef_cooking_with_flame_20260928154018.jpg" alt="Chef cooking over open flame" loading="lazy" /><span className="story-badge">EST. 1999 · ERODE</span></div>
        <div><p className="eyebrow">FROM A TRADITION TO A TABLE</p><h2>Food carries<br /><em>memory.</em></h2><p className="body-copy">Since 1999, Thangarasu Samayal has grown around a simple idea: when people gather, the food should feel worthy of the occasion. Our cooking draws from Kongunadu and Chettinad traditions, bringing familiar flavours to weddings, corporate gatherings and private celebrations.</p><div className="metrics"><div><strong>1,200+</strong><span>EVENTS SERVED</span></div><div><strong>500–5,000+</strong><span>GUEST CAPACITY</span></div></div></div>
      </section>

      <section className="spice-section"><div className="craft-media"><AutoVideo src={V_DOSA} /><span className="badge">SINCE 1999 · MADE TO ORDER</span></div><div><p className="eyebrow">02 / THE CRAFT</p><h2>Fresh spices.<br /><em>Patient cooking.</em></h2><p className="body-copy">The experience starts long before a guest takes the first bite — with ingredients, preparation and the care behind every vessel.</p></div></section>

      <section className="feast section" id="feast"><div className="section-index">03 / THE FEAST</div><div className="section-heading"><p className="eyebrow">SIGNATURES</p><h2>Four reasons<br /><em>to come hungry.</em></h2></div><div className="dish-grid">{dishes.map((dish) => <article className="dish-card" key={dish.name}><span>{dish.accent}</span><div className="dish-glow" /><div className="dish-photo"><img src={dish.img} alt={dish.name} loading="lazy" /></div><h3>{dish.name}</h3><p>{dish.text}</p><a href="#enquire">Make it part of my feast ↗</a></article>)}</div></section>

      <section className="gallery section" id="gallery" ref={galleryRef}><div className="section-index">04 / MOMENTS</div><div className="gallery-head"><p className="eyebrow">FROM OUR KITCHENS & TABLES</p><h2>Feasts,<br /><em>as they happen.</em></h2><span className="gallery-rule" /><p>A continuous loop through the counters, the fire and the table — the moments a feast is actually made of.</p></div><div className="gallery-marquee"><div className="gallery-word" aria-hidden="true">MOMENTS</div><div className="mrow"><div className="mtrack">{[...gallery, ...gallery].map((g, i) => <figure className="g-tile" key={i} aria-hidden={i >= gallery.length}><span className="g-num">{String((i % gallery.length) + 1).padStart(2, '0')}</span><div className="g-media"><AutoVideo src={g.media.src} /></div><figcaption><small>{g.tag}</small><strong>{g.title}</strong><span>{g.note}</span></figcaption></figure>)}</div></div></div></section>

      <section className="events section" id="events"><div className="section-index">05 / YOUR OCCASION</div><div><p className="eyebrow">CHOOSE YOUR FEAST</p><h2>One kitchen.<br /><em>Your occasion.</em></h2></div><div><div className="event-tabs">{['Wedding','Corporate','Private'].map((item) => <button key={item} className={event === item ? 'active' : ''} onClick={() => setEvent(item)}>{item}</button>)}</div><div className="event-panel"><div className="event-number">{event === 'Wedding' ? '05K+' : event === 'Corporate' ? '01K+' : '500+'}</div><div><h3>{event} celebrations</h3><p>Menus shaped around the occasion, scale and people at the table — with traditional service and a focus on a memorable guest experience.</p></div></div></div></section>

      <section className="scale"><img className="scale-bg" src="/Banana_leaf_full_spread_20260928154040.jpg" alt="" aria-hidden="true" loading="lazy" /><div className="scale-word">5,000+</div><p>Guests can sit down.<br /><em>The experience still feels personal.</em></p></section>

      <section className="enquire section" id="enquire"><div className="section-index">06 / BEGIN</div><div><p className="eyebrow">LET'S TALK FOOD</p><h2>Your celebration<br /><em>starts here.</em></h2><form className="enquiry-form" onSubmit={(e) => e.preventDefault()}><input placeholder="Your name" required /><input placeholder="Phone number" type="tel" required /><select defaultValue="Wedding"><option>Wedding</option><option>Corporate</option><option>Private</option></select><input placeholder="Approx. guests" type="number" min="1" /><input placeholder="Event date" type="date" /><input placeholder="Location" /><button className="button button-primary" type="submit">Send enquiry <span>↗</span></button></form><p className="form-note">No automation yet — this starter keeps the enquiry experience ready for your future backend, WhatsApp and AI integrations.</p></div></section>

      <footer><div className="footer-brand">THANGARASU<br /><em>SAMAYAL</em></div><div><p className="footer-h">VISIT</p><p>Appakudal, Erode</p><p>Traditional Kongunadu & Chettinad cuisine</p></div><div><p className="footer-h">CONTACT</p><a href="tel:8012678719">+91 80126 78719</a><a href="mailto:hello@thangarasusamayal.com">hello@thangarasusamayal.com</a><p>© {new Date().getFullYear()} Thangarasu Samayal</p></div><div><p className="footer-h">FOLLOW</p><div className="socials"><a href="https://instagram.com/thangarasusamayal" target="_blank" rel="noreferrer" aria-label="Instagram"><svg viewBox="0 0 24 24" className="social-ic"><rect x="2.5" y="2.5" width="19" height="19" rx="5" /><circle cx="12" cy="12" r="4.2" /><circle cx="17.6" cy="6.4" r="1.15" fill="currentColor" stroke="none" /></svg><span>Instagram</span></a><a href="https://youtube.com/@thangarasusamayal" target="_blank" rel="noreferrer" aria-label="YouTube"><svg viewBox="0 0 24 24" className="social-ic"><rect x="2" y="5" width="20" height="14" rx="4" /><path d="M10 8.8l5.5 3.2L10 15.2z" fill="currentColor" stroke="none" /></svg><span>YouTube</span></a><a href="https://wa.me/918012678719" target="_blank" rel="noreferrer" aria-label="WhatsApp"><svg viewBox="0 0 24 24" className="social-ic"><path d="M3.5 20.5l1.4-4.1a8 8 0 1 1 3 3z" /><path d="M8.5 8.9c.2-.5.5-.5.7-.5h.5c.2 0 .4 0 .6.5l.7 1.6c0 .2 0 .3-.1.5l-.5.6c-.1.1-.2.3 0 .6a6 6 0 0 0 2.6 2.3c.3.1.4 0 .6-.1l.6-.7c.2-.2.3-.1.5-.1l1.6.8c.2.1.3.2.3.4 0 .4-.4 1.2-.8 1.4-.5.3-1.4.5-3-.2a9 9 0 0 1-4.2-4.3c-.5-1-.4-1.8-.4-2.1z" fill="currentColor" stroke="none" /></svg><span>WhatsApp</span></a><a href="mailto:hello@thangarasusamayal.com" aria-label="Email"><svg viewBox="0 0 24 24" className="social-ic"><rect x="2.5" y="4.5" width="19" height="15" rx="2.5" /><path d="M3 6.5l9 6 9-6" /></svg><span>Email</span></a></div></div></footer>
      <ChatWidget />
    </main>
  );
}
