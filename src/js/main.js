/**
 * Dahira Mafatihoul Bichri — Touba Estrie
 * Main JavaScript — Navigation, Scroll Reveal, Form
 */

import { initNav } from './nav.js';
import { initScrollReveal } from './scroll-reveal.js';
import { initForm } from './form.js';
import { initRipple } from './ripple.js';

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initScrollReveal();
  initForm();
  initRipple();
});
