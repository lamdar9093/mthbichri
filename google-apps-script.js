/**
 * Google Apps Script — Dahira Mafatihoul Bichri Touba Estrie
 * Base de données membres
 *
 * SETUP :
 * 1. Créer une Google Sheet nommée "Membres Dahira"
 * 2. Extensions > Apps Script > coller ce code
 * 3. Déployer > Nouveau déploiement > Web App
 *    - Exécuter en tant que : Moi
 *    - Accès : Tout le monde
 * 4. Copier l'URL et la coller dans form.js (SHEETS_ENDPOINT)
 */

const SHEET_NAME = 'Membres';

// Adresse email du trésorier — recevra une notification à chaque adhésion
const TRESORIER_EMAIL = 'finances.mbte@gmail.com';

const HEADERS = [
  'Date inscription',
  'Nom complet',
  'Téléphone',
  'Ville',
  'Catégorie',
  'Cotisation mensuelle ($)',
  'Premier paiement ($)',
  'Mode de paiement',
  'Statut paiement',
  'Notes trésorier',
];

function doPost(e) {
  try {
    const sheet = getOrCreateSheet();
    const data  = JSON.parse(e.postData.contents);

    const paymentLabel = data.paymentMethod === 'interac'
      ? 'Interac envoyé'
      : 'À contacter';

    sheet.appendRow([
      Utilities.formatDate(new Date(), 'America/Toronto', 'yyyy-MM-dd HH:mm'),
      data.fullName     || '',
      data.phone        || '',
      data.city         || '',
      'Catégorie ' + (data.category || ''),
      data.monthlyAmount ? data.monthlyAmount + ' $' : '',
      data.firstPayment  ? data.firstPayment  + ' $' : '',
      paymentLabel,
      'En attente',   // à mettre à jour par le trésorier
      '',             // notes
    ]);

    // Notification email au trésorier
    const paymentStatus = data.paymentMethod === 'interac'
      ? '⚡ Interac envoyé (à confirmer dans la banque)'
      : '📞 À contacter pour le paiement';

    MailApp.sendEmail({
      to: TRESORIER_EMAIL,
      subject: `[Dahira MBTE] Nouvelle adhésion — ${data.fullName}`,
      body: [
        'Nouvelle demande d\'adhésion reçue sur le site.',
        '',
        'INFORMATIONS DU MEMBRE',
        '─────────────────────',
        'Nom complet  : ' + (data.fullName || '—'),
        'Téléphone    : ' + (data.phone || '—'),
        'Ville        : ' + (data.city || '—'),
        'Catégorie    : Catégorie ' + (data.category || '—'),
        'Cotisation   : ' + (data.monthlyAmount ? data.monthlyAmount + ' $/mois' : '—'),
        'Premier pmt  : ' + (data.firstPayment ? data.firstPayment + ' $' : '—'),
        '',
        'PAIEMENT',
        '─────────────────────',
        paymentStatus,
        '',
        'À mettre à jour dans la Sheet : "En attente" → "Confirmé" une fois le paiement reçu.',
        '',
        'Dieuredieuf — Dahira Mafatihoul Bichri Touba Estrie',
      ].join('\n'),
    });

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Crée la feuille avec les en-têtes si elle n'existe pas encore
function getOrCreateSheet() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  let   sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    const headerRow = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRow.setValues([HEADERS]);
    headerRow.setFontWeight('bold');
    headerRow.setBackground('#0F6E56');
    headerRow.setFontColor('#ffffff');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 140); // date
    sheet.setColumnWidth(2, 180); // nom
    sheet.setColumnWidth(3, 140); // tél
    sheet.setColumnWidth(10, 220); // notes
  }

  // Dropdown colonne 9 — Statut paiement (toujours appliqué)
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['En attente', 'Confirmé', 'Annulé'], true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(2, 9, 500).setDataValidation(statusRule);

  return sheet;
}
