/**
 * Navigation — Sticky, mobile toggle, active link tracking
 */

export function initNav() {
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  const navLinks = document.querySelectorAll('.nav__link');
  const sections = document.querySelectorAll('section[id], footer[id]');

  // Sticky nav on scroll
  let lastScroll = 0;
  function handleScroll() {
    const scrollY = window.scrollY;
    nav.classList.toggle('nav--scrolled', scrollY > 50);
    lastScroll = scrollY;
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Mobile drawer
  const backdrop = document.getElementById('navBackdrop');

  function openMenu() {
    links.classList.add('nav__links--open');
    toggle.classList.add('nav__toggle--active');
    backdrop.classList.add('nav__backdrop--visible');
    nav.classList.add('nav--menu-open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    links.classList.remove('nav__links--open');
    toggle.classList.remove('nav__toggle--active');
    backdrop.classList.remove('nav__backdrop--visible');
    nav.classList.remove('nav--menu-open');
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', () => {
    links.classList.contains('nav__links--open') ? closeMenu() : openMenu();
  });

  // Close on backdrop click
  backdrop.addEventListener('click', closeMenu);

  // Close on link click
  navLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Active link tracking via IntersectionObserver
  const observerOptions = {
    rootMargin: '-20% 0px -60% 0px',
    threshold: 0,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          const href = link.getAttribute('href').slice(1);
          link.classList.toggle('nav__link--active', href === id);
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));
}
