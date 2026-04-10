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

  // Afficher le mois de la première cotisation (mois prochain)
  const el = document.getElementById('nextMonthName');
  if (el) {
    const months = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
    const nextMonth = (new Date().getMonth() + 1) % 12;
    el.textContent = months[nextMonth];
  }
});
