/**
 * Adhesion Form — Validation, phone formatting & submission
 */

// ⬇️ Coller ici l'URL du Google Apps Script après déploiement
const SHEETS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbylwgSQKTKhknc6bi-OeuzObYY0pdjBJbAXcgtRjd-j7XITODnT-sGBkWnHrN9CaLJy/exec';

function submitToSheets(data) {
  if (!SHEETS_ENDPOINT || SHEETS_ENDPOINT.startsWith('REMPLACER')) return;
  fetch(SHEETS_ENDPOINT, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(data),
  }).catch(() => {}); // fire and forget — ne bloque pas le formulaire
}

/**
 * Format a raw digit string as a Canadian phone number: (XXX) XXX-XXXX
 */
function formatCanadianPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length === 0) return '';
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function initForm() {
  const form = document.getElementById('adhesionForm');
  const success = document.getElementById('formSuccess');

  if (!form || !success) return;

  // --- Phone auto-format (Canadian 10 digits) ---
  const phoneInput = document.getElementById('phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', () => {
      const cursorPos = phoneInput.selectionStart;
      const before = phoneInput.value;
      phoneInput.value = formatCanadianPhone(before);

      // Keep cursor in a reasonable position after formatting
      const diff = phoneInput.value.length - before.length;
      phoneInput.setSelectionRange(cursorPos + diff, cursorPos + diff);
    });
  }

  // --- City: show text input when "Je ne trouve pas ma ville" is selected ---
  const citySelect = document.getElementById('city');
  const cityOther = document.getElementById('cityOther');
  if (citySelect && cityOther) {
    citySelect.addEventListener('change', () => {
      const isOther = citySelect.value === '__autre';
      cityOther.hidden = !isOther;
      if (isOther) {
        cityOther.required = true;
        cityOther.focus();
      } else {
        cityOther.required = false;
        cityOther.value = '';
      }
    });
  }

  // --- Récapitulatif dynamique du premier paiement ---
  const categoryAmounts = { A: 45, B: 30, C: 15 };
  const categorySelect  = document.getElementById('category');
  const summaryBox      = document.getElementById('formSummary');
  const summaryCategory = document.getElementById('summaryCategory');
  const summaryMonthly  = document.getElementById('summaryMonthly');
  const summaryTotal    = document.getElementById('summaryTotal');
  const summaryRecurring = document.getElementById('summaryRecurring');

  function updateSummary() {
    const val = categorySelect.value;
    if (!val || !categoryAmounts[val]) {
      summaryBox.hidden = true;
      return;
    }
    const monthly = categoryAmounts[val];
    summaryCategory.textContent  = `Cat. ${val}`;
    summaryMonthly.textContent   = `${monthly} $`;
    summaryTotal.textContent     = `${10 + monthly} $`;
    summaryRecurring.textContent = `${monthly} $`;
    summaryBox.hidden = false;
  }

  if (categorySelect) {
    categorySelect.addEventListener('change', updateSummary);
  }

  // Pre-select category from pricing card clicks
  document.querySelectorAll('.pricing-card .btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.pricing-card');
      const category = card.querySelector('.pricing-card__category').textContent;
      const select = document.getElementById('category');

      if (category.includes('A')) select.value = 'A';
      else if (category.includes('B')) select.value = 'B';
      else if (category.includes('C')) select.value = 'C';

      updateSummary();
    });
  });

  // --- Mode de paiement ---
  const interacPanel    = document.getElementById('interacPanel');
  const interacConfirm  = document.getElementById('interacConfirm');
  const interacConfirmWrap = document.getElementById('interacConfirmWrap');
  const submitBtnText   = document.getElementById('submitBtnText');
  const formSuccessMsg  = document.getElementById('formSuccessMsg');
  const copyEmailBtn    = document.getElementById('copyEmailBtn');

  const successMessages = {
    interac: (name) => `Dieuredieuf, ${name} ! Votre demande d'adhésion a bien été reçue. Votre adhésion sera activée dès que le trésorier aura confirmé la réception de votre virement Interac. Un responsable vous contactera bientôt, insha'Allah.`,
    contact: (name) => `Dieuredieuf, ${name} ! Votre demande d'adhésion a bien été reçue. Un responsable du dahira vous contactera bientôt pour organiser votre paiement, insha'Allah.`,
  };

  function getPaymentMethod() {
    const checked = form.querySelector('input[name="paymentMethod"]:checked');
    return checked ? checked.value : null;
  }

  form.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const method = getPaymentMethod();
      if (method === 'interac') {
        interacPanel.hidden = false;
        submitBtnText.textContent = 'Confirmer mon adhésion';
      } else {
        interacPanel.hidden = true;
        submitBtnText.textContent = 'Soumettre ma demande d\'adhésion';
      }
    });
  });

  // --- Copier l'email Interac ---
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', () => {
      navigator.clipboard.writeText('finances.mbte@gmail.com').then(() => {
        copyEmailBtn.classList.add('interac-panel__copy-btn--copied');
        copyEmailBtn.querySelector('.interac-panel__copy-text').textContent = 'Copié !';
        setTimeout(() => {
          copyEmailBtn.classList.remove('interac-panel__copy-btn--copied');
          copyEmailBtn.querySelector('.interac-panel__copy-text').textContent = 'Copier';
        }, 2000);
      });
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Clear previous errors
    form.querySelectorAll('.form__input--error').forEach(el => {
      el.classList.remove('form__input--error');
    });
    interacConfirmWrap?.classList.remove('interac-panel__confirm--error');

    const fullName = form.fullName.value.trim();
    const phone = form.phone.value.trim();
    const phoneDigits = phone.replace(/\D/g, '');
    const cityValue = form.city.value;
    const cityOtherValue = form.cityOther ? form.cityOther.value.trim() : '';
    const category = form.category.value;
    const paymentMethod = getPaymentMethod();

    let hasError = false;

    if (!fullName) {
      form.fullName.classList.add('form__input--error');
      hasError = true;
    }
    if (phoneDigits.length !== 10) {
      form.phone.classList.add('form__input--error');
      hasError = true;
    }
    if (!cityValue) {
      form.city.classList.add('form__input--error');
      hasError = true;
    }
    if (cityValue === '__autre' && !cityOtherValue) {
      form.cityOther.classList.add('form__input--error');
      hasError = true;
    }
    if (!category) {
      form.category.classList.add('form__input--error');
      hasError = true;
    }
    if (!paymentMethod) {
      // Scroll to payment choice if nothing selected
      document.querySelector('.form__payment-choice-label')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      hasError = true;
    }
    if (paymentMethod === 'interac' && !interacConfirm?.checked) {
      interacConfirmWrap?.classList.add('interac-panel__confirm--error');
      interacConfirmWrap?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      hasError = true;
    }

    if (hasError) {
      if (!paymentMethod || (paymentMethod === 'interac' && !interacConfirm?.checked)) return;
      form.querySelector('.form__input--error')?.focus();
      return;
    }

    // Envoyer les données à Google Sheets
    const categoryAmountsMap = { A: 45, B: 30, C: 15 };
    submitToSheets({
      fullName,
      phone,
      city: cityValue === '__autre' ? cityOtherValue : cityValue,
      category,
      monthlyAmount: categoryAmountsMap[category],
      firstPayment: 10 + (categoryAmountsMap[category] || 0),
      paymentMethod,
    });

    // Afficher le message de succès
    if (formSuccessMsg) {
      const msgFn = successMessages[paymentMethod] || successMessages.contact;
      formSuccessMsg.textContent = msgFn(fullName);
    }
    form.hidden = true;
    success.hidden = false;
    success.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  // Bouton "Soumettre une autre demande"
  document.getElementById('formReset')?.addEventListener('click', () => {
    form.reset();
    form.hidden = false;
    success.hidden = true;
    summaryBox.hidden = true;
    interacPanel.hidden = true;
    submitBtnText.textContent = 'Soumettre ma demande d\'adhésion';
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // Remove error state on input
  form.querySelectorAll('.form__input, .form__select').forEach(input => {
    input.addEventListener('input', () => {
      input.classList.remove('form__input--error');
    });
    input.addEventListener('change', () => {
      input.classList.remove('form__input--error');
    });
  });
}
