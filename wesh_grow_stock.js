// ==================== CONFIGURATION ====================
// Numéro de version affiché dans l'appli (footer + console) pour vérifier en
// un coup d'œil que le déploiement est bien à jour après une mise à jour.
const APP_VERSION = 'v2026-09-03-01h05-autosave';
console.log('Wesh Grow — Disponibilités & Prévisions —', APP_VERSION);

// Même principe d'accès que l'appli Alertes : connexion Google individuelle,
// la vraie sécurité vient du partage des Google Sheets ci-dessous.
const GOOGLE_OAUTH_CONFIG = {
  clientId: '930336176315-nstjh090aro6a4h14iomo1usodva888s.apps.googleusercontent.com',
  scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/userinfo.email'
};

// Sheet ERP (ventes + correspondance produits) — lecture seule.
const SALES_SHEET_CONFIG = {
  spreadsheetId: '1Y_CexmqN65CNlBoiBoKHur_dL-L89tAXH5kgoVEsd50',
  orderImportRange: "'Order import'!A2:K",
  productAggregateRange: "'Product agregate'!A1:J"
};

// Sheet Production (planning de récolte / disponibilité) — lecture seule.
// La feuille "Production" est en forme libre (plusieurs tableaux imbriqués),
// donc on récupère une plage large et on retrouve le bon tableau par ses
// en-têtes ("Produit", "#BQ", "ETH") plutôt que par un numéro de ligne fixe,
// pour rester robuste si la mise en page bouge un peu.
const PRODUCTION_SHEET_CONFIG = {
  spreadsheetId: '10NssGM-yKSUnTrxnqliHIf50Faeja-qghjdMSlZFjCw',
  scanRange: "'Production'!A1:CZ30000"
};

// Sheet dédié à l'appli (état partagé) — même fichier que l'appli Alertes,
// mais un onglet séparé pour ne pas interférer avec ses données.
const APP_STATE_CONFIG = {
  spreadsheetId: '1vuDl5PRc7LPW5qg-SDbs86I-jNt-26w2VEHyUF-sQoU',
  sheetTitle: 'StockProduction'
};

const AUTHORIZED_USERS = [
  'camille.coquet@gmail.com',
  'camille.weshgrow@gmail.com',
  'charles.weshgrow@gmail.com',
  'glenn.cheynier@gmail.com',
  'loweshgrow@gmail.com',
  'weshgrow@gmail.com'
];
// ==============================================================================

// ==================== LISTE MAÎTRESSE DES VARIÉTÉS ====================
// Reprise de l'onglet "Prévisions Semis" (sections MICROPOUSSES / MICROXS / JP —
// les Fleurs sont volontairement exclues pour l'instant). C'est cette liste,
// et non les codes rencontrés dans les ventes/production, qui définit les
// lignes affichées dans le tableau de disponibilités.
const MASTER_VARIETIES = {
  MICROPOUSSES: [
    { nom: 'Coriandre - petite boite', codeSocleo: 'COSP-S', codeMaj: 'COSP-C' },
    { nom: 'Shiso vert - petite boite', codeSocleo: 'SHVE-S', codeMaj: 'SHVT-S' },
    { nom: 'Oseille veine rouge - petite boite', codeSocleo: 'OSVR-S', codeMaj: 'OSRL-S' },
    { nom: 'Shiso rouge - petite boite', codeSocleo: 'SHRE-S', codeMaj: 'SHRE-S' },
    { nom: 'Petits pois mangetout - petite boite', codeSocleo: 'PISS-S', codeMaj: 'PFOX-C' },
    { nom: 'Melisse citron - petite boite', codeSocleo: 'MECI-S', codeMaj: 'MECI-S' },
    { nom: 'Hysope Anisée - petite boite', codeSocleo: 'HYAN-S', codeMaj: 'HYAN-S' },
    { nom: 'Amaranth pourpre - petite boite', codeSocleo: 'AMPU-S', codeMaj: 'AMPU-S' },
    { nom: 'Tagète française - petite boite', codeSocleo: 'MGFR-S', codeMaj: 'MGFR-S' },
    { nom: 'Moutarde Wasabina - petite boite', codeSocleo: 'MUWA-S', codeMaj: 'MUWA-S' },
    { nom: 'Fenouil Bronze - Petite Boîte', codeSocleo: 'FEBO-S', codeMaj: 'FEBO-C' },
    { nom: 'Capucine - petite boite', codeSocleo: 'NAAM-S', codeMaj: 'NAIN-S' },
    { nom: 'PIOR-L', codeSocleo: 'PIOR-L', codeMaj: 'PIOR-L' },
    { nom: 'Ail - petite boite', codeSocleo: 'AICH-S', codeMaj: 'AICH-S' },
    { nom: 'Basilic citron - petite boite', codeSocleo: 'BALE-S', codeMaj: 'BALE-S' },
    { nom: 'Basilic rouge - petite boite', codeSocleo: 'BARE-S', codeMaj: 'BARE-S' },
    { nom: 'Basilic Genovese - petite boite', codeSocleo: 'BASG-S', codeMaj: 'BASG-S' },
    { nom: 'Basilic thai - petite boite', codeSocleo: 'BATA-S', codeMaj: 'BATA-S' },
    { nom: 'Cresson - petite boite', codeSocleo: 'CSAL-S', codeMaj: 'BAVE-C' },
    { nom: 'Hibiscus - petite boite', codeSocleo: 'BISS-S', codeMaj: 'BISS-C' },
    { nom: 'Bourrache - petite boite', codeSocleo: 'BOBL-S', codeMaj: 'BOBL-S' },
    { nom: 'Carotte - petite boite', codeSocleo: 'CAJD-S', codeMaj: 'CAJD-S' },
    { nom: 'Cédrèle - petite boite', codeSocleo: 'CEDR-S', codeMaj: 'CEDR-S' },
    { nom: 'Chou Kale - petite boite', codeSocleo: 'CHKS-S', codeMaj: 'CHKS-S' },
    { nom: 'Cresson Alénois', codeSocleo: 'CSAL-S2', codeMaj: 'CSAL-S' },
    { nom: 'Estragon Mexicain - Petite boîte', codeSocleo: 'EMEX-S', codeMaj: 'EMEX-C' },
    { nom: 'Fenouil - petite boite', codeSocleo: 'FEFI-S', codeMaj: 'FEFI-C' },
    { nom: 'Mizuna Moutarde Mix - petite boite', codeSocleo: 'FRILLY-S', codeMaj: 'FRIL-S' },
    { nom: 'Liveche - petite boite', codeSocleo: 'LIVE-S', codeMaj: 'LIVE-S' },
    { nom: 'Menthe Micro', codeSocleo: 'MINTX', codeMaj: 'MEVE-S' },
    { nom: 'Tagète citron - petite boite', codeSocleo: 'MGCI-S', codeMaj: 'MGCI-S' },
    { nom: 'Persil Japonais (Mitsuba) - petite boite', codeSocleo: 'PEJA-S', codeMaj: 'MITS-C' },
    { nom: 'Mizuna vert', codeSocleo: 'MIZU-C', codeMaj: 'MIZU-C' },
    { nom: 'Moutarde rouge - petite boite', codeSocleo: 'MURC-S', codeMaj: 'MURC-S' },
    { nom: 'Persinette - Petite boîte', codeSocleo: 'PEFI-S', codeMaj: 'PEFA-S' },
    { nom: 'Persil géant d\'Italie - petite boite', codeSocleo: 'PEGE-S', codeMaj: 'PEGE-S' },
    { nom: 'Pimprenelle - petit boite', codeSocleo: '57THCWLP', codeMaj: 'PMPR-S' },
    { nom: 'Radis pourpre - petite boite', codeSocleo: 'RARI-S', codeMaj: 'RARI-C' },
    { nom: 'Radis rose - petite boite', codeSocleo: 'RASA-S', codeMaj: 'RASA-S' },
    { nom: 'Sauge - petite boite', codeSocleo: 'SGJD-S', codeMaj: 'SGJD-C' },
    { nom: 'Shunjiku - petite boîte', codeSocleo: 'SHUN-S', codeMaj: 'SHUN-S' },
    { nom: 'Tournesol - petite boite', codeSocleo: 'SUBL-S', codeMaj: 'SUBL-S' },
  ],
  MICROXS: [
    { nom: 'CORIANDRE XS', codeSocleo: 'COSP-XS', codeMaj: 'COSP-XS' },
    { nom: 'PETIT POIS XS', codeSocleo: 'PISSXS', codeMaj: 'PFOX-XS' },
    { nom: 'SHISO VERT XS', codeSocleo: 'SHVEXS', codeMaj: 'SHVT-XS' },
    { nom: 'PERSIL PLAT XS', codeSocleo: 'PEFA', codeMaj: 'PEFA-XS' },
    { nom: 'SCARLET AMARANTE XS - Origine France production locale ferme Paris 75018', codeSocleo: 'AMPU-XS', codeMaj: 'AMPU-XS' },
    { nom: 'CEDRELE TAHOON XS - Origine France production locale ferme Paris 75018', codeSocleo: 'CEDR-XS', codeMaj: 'CEDR-XS' },
    { nom: 'RADIS SAKURA POURPRE XS - Origine France production locale ferme Paris 75018', codeSocleo: 'RARI-XS', codeMaj: 'RARI-XS' },
    { nom: 'DAIKON CHILLI XS - Origine France production locale ferme Paris 75018', codeSocleo: 'RASA-XS', codeMaj: 'RADA-XS' },
    { nom: 'MELISSA MELISSE XS - Origine France production locale ferme Paris 75018', codeSocleo: 'MECIXS', codeMaj: 'MECI-XS' },
    { nom: 'TAGETE ACCLA XS - Origine France production locale ferme Paris 75018', codeSocleo: 'MGFR-XS', codeMaj: 'MGFR-XS' },
    { nom: 'ZORI CAPUCINE XS - Origine France production locale ferme Paris 75018', codeSocleo: 'NAIN-XS', codeMaj: 'NAIN-XS' },
    { nom: 'BORAGE BOURRACHE XS - Origine France production locale ferme Paris 75018', codeSocleo: 'BOBLXS', codeMaj: 'BOBL-XS' },
    { nom: 'MUSTARD XS - Origine France production locale ferme Paris 75018', codeSocleo: 'MUVE-XS', codeMaj: 'MUVE-XS' },
    { nom: 'AIL ROCK CHIVES XS - Origine France production locale ferme Paris 75018', codeSocleo: 'AICHXS', codeMaj: 'AICH-XS' },
    { nom: 'BASILIC GENO XS - Origine France production locale ferme Paris 75018', codeSocleo: 'BASG-XS', codeMaj: 'BASG-XS' },
    { nom: 'RADIS ROSE XS', codeSocleo: 'RADA-XS', codeMaj: 'RASA-XS' },
    { nom: 'PEFI-XS', codeSocleo: 'PEFI-XS', codeMaj: 'PEFI-XS' },
    { nom: 'Moutarde Mix XS - Origine France production locale ferme Paris 75018', codeSocleo: 'FRILLY-XS', codeMaj: 'FRIL-XS' },
    { nom: 'MUWA-XS', codeSocleo: 'MUWA-XS', codeMaj: 'MUWA-XS' },
  ],
  JP: [
    { nom: 'Plateau Mesclun Spicy taille M', codeSocleo: 'FRILLY-M', codeMaj: 'FRIL-M' },
    { nom: 'Amaranthe - Jeunes Pousses', codeSocleo: 'AMPU-JP', codeMaj: 'AMPU-J' },
    { nom: 'Plateau Mizuna Vert taille M - Origine France production locale ferme Paris 75018', codeSocleo: 'MFRI-M', codeMaj: 'MFRI-M' },
    { nom: 'Plateau Moutarde Rouge taille M - Origine France production locale ferme Paris 75018', codeSocleo: 'MURC-M', codeMaj: 'MURC-M' },
    { nom: 'Tagète moyennes feuilles', codeSocleo: 'TAGMOY', codeMaj: 'MGFR-J' },
    { nom: 'Oseille de Belleville - petite boite', codeSocleo: 'OSBL-S', codeMaj: 'OSBL-S' },
    { nom: 'Agastache - Moyennes feuilles', codeSocleo: 'AGA-BO', codeMaj: 'HYAN-J' },
    { nom: 'Mélisse - jeunes pousses', codeSocleo: 'MEL-JP', codeMaj: 'MECI-J' },
    { nom: 'Moutarde WASABI - Jeunes Pousses', codeSocleo: 'MUWA-JP', codeMaj: 'MUWA-J' },
    { nom: 'Livèche - Jeunes Pousses', codeSocleo: 'RG5TD9GV', codeMaj: 'LIVE-J' },
    { nom: 'Maïs sweet - petite boite', codeSocleo: 'MAMI-S', codeMaj: 'MASC-S' },
  ],
};

const DEFAULT_STOCK = {
  'COSP-C': 144.0,
  'SHVT-S': 36.0,
  'OSRL-S': 108.0,
  'SHRE-S': 270.0,
  'PFOX-C': 558.0,
  'MECI-S': 85.0,
  'HYAN-S': 36.0,
  'AMPU-S': 90.0,
  'MGFR-S': 18.0,
  'MUWA-S': 38.0,
  'FEBO-C': 72.0,
  'NAIN-S': 18.0,
  'BALE-S': 44.0,
  'BASG-S': 36.0,
  'EMEX-C': 36.0,
  'FRIL-S': 18.0,
  'LIVE-S': 54.0,
  'MEVE-S': 18.0,
  'MITS-C': 24.0,
  'RARI-C': 24.0,
  'COSP-XS': 234.0,
  'PFOX-XS': 702.0,
  'SHVT-XS': 198.0,
  'PEFA-XS': 20.0,
  'CEDR-XS': 15.0,
  'FRIL-M': 5.0,
};

// Périmètre exact de la ferme Paris 18 (fourni par l'utilisateur). C'est
// cette liste — et uniquement elle — qui définit les variétés suivies,
// pour exclure les variétés produites par la ferme de Marseille qui
// partagent le même Sheet ERP.
const PARIS_18_SCOPE = {
  MICROPOUSSES: ['COSP-C', 'SHVT-S', 'OSRL-S', 'SHRE-S', 'PFOX-C', 'MECI-S', 'HYAN-S', 'AMPU-S', 'MGFR-S', 'MUWA-S', 'FEBO-C', 'NAIN-S', 'PIOR-L', 'BALE-S', 'BASG-S', 'EMEX-C', 'FRIL-S', 'LIVE-S', 'MEVE-S', 'MITS-C', 'RARI-C'],
  MICROXS: ['SHRE-XS', 'OSRL-XS', 'HYAN-XS', 'COSP-XS', 'PFOX-XS', 'SHVT-XS', 'PEFA-XS', 'AMPU-XS', 'CEDR-XS', 'RARI-XS', 'RADA-XS', 'MECI-XS', 'MGFR-XS', 'NAIN-XS', 'BOBL-XS', 'MUVE-XS', 'AICH-XS', 'BASG-XS', 'RASA-XS', 'PEFI-XS', 'FRIL-XS', 'MUWA-XS'],
  JP: ['FRIL-M'],
};

let CURRENT_USER = null;
let ACCESS_TOKEN = null;

function normalizeUser(s){ return String(s||'').trim().toLowerCase(); }

// ---------- Dates ----------
const EPOCH_MS = Date.UTC(2020,0,1);
function serialOf(y,m,d){ return Math.floor((Date.UTC(y,m-1,d) - EPOCH_MS)/86400000); }
function serialToDate(s){ return new Date(EPOCH_MS + s*86400000); }
function todaySerial(){
  const n = new Date();
  return serialOf(n.getFullYear(), n.getMonth()+1, n.getDate());
}
function fmtDateShort(s){
  const d = serialToDate(s);
  const dd = String(d.getUTCDate()).padStart(2,'0');
  const mm = String(d.getUTCMonth()+1).padStart(2,'0');
  return `${dd}/${mm}`;
}
const DOW_FR = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];
function dowFr(s){ return DOW_FR[serialToDate(s).getUTCDay()]; }

function parseDMY(str){
  if (!str) return null;
  const parts = String(str).split('/');
  if (parts.length!==3) return null;
  const d = parseInt(parts[0],10), m = parseInt(parts[1],10), y = parseInt(parts[2],10);
  if (!d||!m||!y) return null;
  return serialOf(y,m,d);
}
// Formats "lundi, 21 09" ou "mer. 02 09" -> serial. On déduit l'année à
// partir de l'année en cours, en basculant sur l'année suivante si le
// mois/jour semble déjà loin dans le passé (utile en fin d'année).
function parseFrenchLooseDate(str, refSerial){
  if (!str) return null;
  const s = String(str).trim();
  if (!s || s === '-' || s.includes('#N/A') || s.includes('N/A')) return null;
  const m = s.match(/(\d{1,2})[.,]?\s+(\d{1,2})\s*$/);
  if (!m) return null;
  const day = parseInt(m[1],10), month = parseInt(m[2],10);
  if (!day || !month || month<1 || month>12 || day<1 || day>31) return null;
  const refDate = serialToDate(refSerial);
  let year = refDate.getUTCFullYear();
  let candidate = serialOf(year, month, day);
  // Si la date tombe plus de ~150 jours avant la référence, elle appartient
  // probablement à l'année suivante (semis fin d'année pour récolte janvier...).
  if (candidate < refSerial - 150) candidate = serialOf(year+1, month, day);
  // Si elle tombe très loin dans le futur (>400j), c'est probablement l'année précédente.
  if (candidate > refSerial + 400) candidate = serialOf(year-1, month, day);
  return candidate;
}
function parseNum(str){
  if (str==null || str==='') return 0;
  const v = parseFloat(String(str).replace(',', '.').replace(/[^\d.\-]/g,''));
  return isNaN(v) ? 0 : v;
}

// ---------- Google Sheets API ----------
async function sheetsGetValues(spreadsheetId, range){
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?t=${Date.now()}`;
  const resp = await fetch(url, { headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` } });
  if (!resp.ok){
    let msg = String(resp.status);
    try { const err = await resp.json(); if (err.error && err.error.message) msg += ' — ' + err.error.message; } catch(e){}
    const error = new Error(msg); error.status = resp.status; throw error;
  }
  const data = await resp.json();
  return data.values || [];
}
async function sheetsUpdateValues(spreadsheetId, range, values2D){
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=RAW`;
  const resp = await fetch(url, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ values: values2D })
  });
  if (!resp.ok){
    let msg = String(resp.status);
    try { const err = await resp.json(); if (err.error && err.error.message) msg += ' — ' + err.error.message; } catch(e){}
    const error = new Error(msg); error.status = resp.status; throw error;
  }
  return await resp.json();
}
async function sheetsGetMeta(spreadsheetId){
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties`;
  const resp = await fetch(url, { headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` } });
  if (!resp.ok) throw new Error('Impossible de lire la structure du fichier (' + resp.status + ')');
  return await resp.json();
}
async function ensureSheetExists(spreadsheetId, title){
  const meta = await sheetsGetMeta(spreadsheetId);
  const found = (meta.sheets||[]).some(s => s.properties && s.properties.title === title);
  if (found) return;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ requests: [{ addSheet: { properties: { title } } }] })
  });
  if (!resp.ok){
    let msg = String(resp.status);
    try { const err = await resp.json(); if (err.error && err.error.message) msg += ' — ' + err.error.message; } catch(e){}
    throw new Error("Impossible de créer l'onglet « " + title + " » (" + msg + ")");
  }
}

// Retrouve automatiquement l'onglet contenant le tableau Produit/#BQ/ETH,
// sans dépendre d'un nom d'onglet fixe (qui peut varier ou avoir été
// renommé). Le critère exige les 3 colonnes ensemble (Produit + #BQ + ETH)
// pour éviter de tomber sur un autre tableau qui n'aurait que Produit/ETH
// (ex. un contrôle de stock frigo). On essaie d'abord le dernier onglet qui
// a fonctionné, puis les onglets dont le nom évoque "production", puis tous
// les autres.
let cachedProductionSheetTitle = null;
async function findAndLoadProductionTable(spreadsheetId, refSerial){
  const tryTitle = async (title) => {
    const rows = await sheetsGetValues(spreadsheetId, `'${title}'!A1:CZ30000`);
    return parseProductionRows(rows, refSerial);
  };
  if (cachedProductionSheetTitle){
    try{
      const parsed = await tryTitle(cachedProductionSheetTitle);
      if (parsed.headerFound && parsed.rows.length > 0) return { ...parsed, sheetTitle: cachedProductionSheetTitle, scanned: false };
    }catch(e){ /* on retente avec un scan complet ci-dessous */ }
  }
  const meta = await sheetsGetMeta(spreadsheetId);
  const titles = (meta.sheets||[]).map(s => s.properties && s.properties.title).filter(Boolean);
  // Priorité aux onglets dont le nom évoque la production, pour éviter de
  // tomber par accident sur un autre tableau qui matcherait aussi.
  const prioritized = [...titles].sort((a,b) => {
    const pa = /production/i.test(a) ? 0 : 1;
    const pb = /production/i.test(b) ? 0 : 1;
    return pa - pb;
  });
  for (const title of prioritized){
    try{
      const parsed = await tryTitle(title);
      if (parsed.headerFound && parsed.rows.length > 0){
        cachedProductionSheetTitle = title;
        return { ...parsed, sheetTitle: title, scanned: true };
      }
    }catch(e){ /* onglet illisible ou vide, on continue */ }
  }
  return { rows: [], headerFound: false, sheetTitle: null, scanned: true, scannedTitles: titles };
}

// ---------- Parsing de l'onglet "SortiesRecoltes" (source du périmètre des variétés) ----------
// Ce tableau (plusieurs blocs "Semaine N") liste, jour par jour, les variétés
// effectivement récoltées/vendues. C'est cette liste — et uniquement elle —
// qui définit le périmètre des variétés suivies par l'outil : un code qui
// n'y apparaît jamais n'est pas affiché, même s'il existe ailleurs.
const DAYS_FR = new Set(['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche']);
function parseSortiesRecoltesCodes(rows2D){
  const weekStarts = [];
  for (let i=0;i<rows2D.length;i++){
    const row = rows2D[i];
    if (row && String(row[0]||'').trim() === 'Semaine') weekStarts.push(i);
  }
  if (weekStarts.length === 0) return { codes: new Set(), found: false };
  weekStarts.push(rows2D.length);
  const codes = new Set();
  for (let wi=0; wi<weekStarts.length-1; wi++){
    const start = weekStarts[wi], end = weekStarts[wi+1];
    let dayRowIdx = -1;
    for (let i=start+1; i<Math.min(start+8, end); i++){
      const row = rows2D[i];
      if (row && DAYS_FR.has(String(row[0]||'').trim())){ dayRowIdx = i; break; }
    }
    if (dayRowIdx === -1) continue;
    const dataStart = dayRowIdx + 2; // on saute la ligne d'en-tête "Variété|Qty|Pertes|moins Pertes" x7
    for (let ri=dataStart; ri<end; ri++){
      const row = rows2D[ri];
      if (!row) continue;
      for (let b=0;b<7;b++){
        const col = b*4;
        const variety = row[col];
        const net = row[col+3];
        if (!variety) continue;
        const vTrim = String(variety).trim();
        if (!vTrim || vTrim === '#N/A') continue;
        const netStr = String(net||'').trim();
        if (!netStr || netStr === '0') continue;
        const netVal = parseFloat(netStr.replace(',','.'));
        if (!isNaN(netVal) && netVal > 0) codes.add(vTrim);
      }
    }
  }
  return { codes, found: true };
}

let cachedSortiesSheetTitle = null;
async function findSortiesRecoltesCodes(spreadsheetId){
  const tryTitle = async (title) => {
    const rows = await sheetsGetValues(spreadsheetId, `'${title}'!A1:CZ30000`);
    const parsed = parseSortiesRecoltesCodes(rows);
    if (parsed.found && parsed.codes.size > 0) return { codes: parsed.codes, sheetTitle: title };
    return null;
  };
  if (cachedSortiesSheetTitle){
    try{ const r = await tryTitle(cachedSortiesSheetTitle); if (r) return { ...r, scanned: false }; }catch(e){}
  }
  try{
    const r = await tryTitle('SortiesRecoltes');
    if (r){ cachedSortiesSheetTitle = 'SortiesRecoltes'; return { ...r, scanned: false }; }
  }catch(e){}
  const meta = await sheetsGetMeta(spreadsheetId);
  const titles = (meta.sheets||[]).map(s => s.properties && s.properties.title).filter(Boolean);
  for (const title of titles){
    try{
      const r = await tryTitle(title);
      if (r){ cachedSortiesSheetTitle = title; return { ...r, scanned: true }; }
    }catch(e){ /* onglet illisible, on continue */ }
  }
  return { codes: new Set(), sheetTitle: null, scanned: true, scannedTitles: titles };
}

// Repli quand un code de SortiesRecoltes n'a aucune correspondance connue
// dans "Product agregate" : on devine le format via le suffixe du code.
function guessSectionFromCode(code){
  const c = code.toUpperCase();
  if (/-(PP|GP|P)$/.test(c)) return 'FLEURS';
  if (c.includes('XS')) return 'MICROXS';
  if (/-(M|L)$/.test(c)) return 'JP';
  return 'MICROPOUSSES';
}

// ---------- Correspondance code produit -> variété (base) ----------
// STATE.productMap : Map code_ERP -> { codeMaj, nom, secteurMaj }
// normalizeToBase(code) : renvoie la "clé variété" utilisée partout dans l'appli.
// On ne suppose plus ni le nom de l'onglet, ni la position des colonnes : on
// scanne les onglets du fichier ERP à la recherche d'une ligne d'en-tête qui
// contient à la fois "Code Produit" ET "Code Maj" (les deux ensemble
// suffisent à identifier la bonne table de correspondance, quel que soit son
// nom ou l'ordre de ses colonnes).
function findRowContainingHeaders(rows2D, requiredHeadersLower, maxScanRows){
  const limit = Math.min(rows2D.length, maxScanRows || rows2D.length);
  for (let i=0; i<limit; i++){
    const row = (rows2D[i]||[]).map(c => String(c||'').trim().toLowerCase());
    if (requiredHeadersLower.every(h => row.includes(h))) return i;
  }
  return -1;
}

function buildProductMap(rows2D){
  const map = new Map();
  const headerIdx = findRowContainingHeaders(rows2D, ['code produit','code maj'], 15);
  if (headerIdx === -1) return { map, ok: false, headerInfo: 'en-tête "Code Produit"/"Code Maj" introuvable' };
  const header = rows2D[headerIdx];
  const findCol = (name) => {
    for (let i=0;i<header.length;i++){
      if (String(header[i]||'').trim().toLowerCase() === name.toLowerCase()) return i;
    }
    return -1;
  };
  const iSecteurProduit = findCol('Secteur produit');
  const iCodeProduit = findCol('Code Produit');
  const iNomProduit = findCol('Nom produit');
  const iCodeMaj = findCol('Code Maj');
  const iSecteurMaj = findCol('Secteur MAJ');
  const iIgnoreImport = findCol('Ignore import');

  for (let r=headerIdx+1; r<rows2D.length; r++){
    const row = rows2D[r];
    if (!row) continue;
    const codeProduit = iCodeProduit>=0 ? row[iCodeProduit] : null;
    if (!codeProduit) continue;
    const codeMaj = iCodeMaj>=0 ? row[iCodeMaj] : null;
    const nomProduit = iNomProduit>=0 ? row[iNomProduit] : null;
    const secteurMaj = iSecteurMaj>=0 ? row[iSecteurMaj] : null;
    const secteurProduit = iSecteurProduit>=0 ? row[iSecteurProduit] : null;
    const ignoreImport = iIgnoreImport>=0 ? row[iIgnoreImport] : null;
    map.set(String(codeProduit).trim().toUpperCase(), {
      codeMaj: String(codeMaj || codeProduit).trim().toUpperCase(),
      nom: nomProduit || codeProduit,
      secteurMaj: (secteurMaj || secteurProduit || '').toString().trim(),
      ignore: String(ignoreImport||'').toUpperCase() === 'OUI'
    });
  }
  const headerInfo = `en-tête trouvé ligne ${headerIdx+1} : [${header.map(h=>String(h||'').trim()).join(' | ')}]`;
  return { map, ok: true, headerInfo };
}

let cachedProductMapSheetTitle = null;
async function findProductMapTable(spreadsheetId){
  const tryTitle = async (title) => {
    const rows = await sheetsGetValues(spreadsheetId, `'${title}'!A1:Z30000`);
    const built = buildProductMap(rows);
    if (built.ok && built.map.size > 0) return built;
    return null;
  };
  if (cachedProductMapSheetTitle){
    try{ const b = await tryTitle(cachedProductMapSheetTitle); if (b) return { ...b, sheetTitle: cachedProductMapSheetTitle, scanned: false }; }catch(e){}
  }
  const meta = await sheetsGetMeta(spreadsheetId);
  const titles = (meta.sheets||[]).map(s => s.properties && s.properties.title).filter(Boolean);
  for (const title of titles){
    try{
      const b = await tryTitle(title);
      if (b){ cachedProductMapSheetTitle = title; return { ...b, sheetTitle: title, scanned: true }; }
    }catch(e){ /* onglet illisible, on continue */ }
  }
  return { map: new Map(), ok: false, sheetTitle: null, scanned: true, scannedTitles: titles };
}

// Retire les mentions décoratives type "- Origine France production locale
// ferme Paris 75018" du nom produit, non pertinentes pour l'affichage compact.
function cleanProductName(nom){
  if (!nom) return nom;
  return String(nom).replace(/\s*-?\s*Origine France.*$/i, '').trim();
}

// Retire les suffixes de format propres au planning de production
// (ex: HYAN-S-F, OSRL-S-F5, PFOX-C-F -> HYAN-S, OSRL-S, PFOX-C) pour
// retrouver le code de vente "de base" quand le code exact n'est pas
// directement dans la table de correspondance.
function stripProductionSuffix(code){
  return code.replace(/-F\d*$/i, '');
}

function normalizeToBase(rawCode){
  const code = String(rawCode||'').trim().toUpperCase();
  if (!code) return { key: null, nom: null, unmapped: true, secteurMaj: null };
  const direct = STATE.productMap.get(code);
  if (direct) return { key: direct.codeMaj, nom: STATE.productNames.get(direct.codeMaj) || direct.nom, unmapped: false, secteurMaj: direct.secteurMaj };
  // Le code peut être directement un "Code Maj" connu (variété de base sans suffixe).
  if (STATE.productNames.has(code)) return { key: code, nom: STATE.productNames.get(code), unmapped: false, secteurMaj: STATE.productSecteurs.get(code) || null };
  const stripped = stripProductionSuffix(code);
  if (stripped !== code){
    const viaStripped = STATE.productMap.get(stripped);
    if (viaStripped) return { key: viaStripped.codeMaj, nom: STATE.productNames.get(viaStripped.codeMaj) || viaStripped.nom, unmapped: false, secteurMaj: viaStripped.secteurMaj };
    if (STATE.productNames.has(stripped)) return { key: stripped, nom: STATE.productNames.get(stripped), unmapped: false, secteurMaj: STATE.productSecteurs.get(stripped) || null };
    return { key: stripped, nom: stripped, unmapped: true, secteurMaj: null };
  }
  return { key: code, nom: code, unmapped: true, secteurMaj: null };
}

// ---------- Parsing "Order import" (ventes) ----------
function parseSalesRows(rows){
  // Colonnes A2:K -> ID, Dénomination(client), Date, Secteur, Code Produit, Nom, Prix HT, Quantité, Prix total, CP, Ville
  const out = [];
  for (const r of rows){
    const dateStr = r[2], client = r[1], code = r[4], nomRaw = r[5], qty = r[7];
    const d = parseDMY(dateStr);
    if (d==null || !code) continue;
    const q = parseNum(qty);
    if (q<=0) continue;
    out.push({ date: d, client: client||'', codeRaw: code, nomRaw: nomRaw||'', qty: q });
  }
  return out;
}

// ---------- Parsing de l'onglet "Production" (recherche du/des tableau(x) Produit/#BQ/.../ETH) ----------
function colIndexOf(headerRow, name){
  for (let i=0;i<headerRow.length;i++){
    if (String(headerRow[i]||'').trim().toLowerCase() === name.toLowerCase()) return i;
  }
  return -1;
}

// Ce fichier peut contenir PLUSIEURS tableaux distincts qui partagent les
// mêmes en-têtes Produit/#BQ/ETH (ex. file d'attente courante + historique de
// lots). On les repère tous et on fusionne leurs lignes, plutôt que de
// s'arrêter au premier trouvé — sinon on peut rater le bon tableau si un
// autre apparaît avant lui dans la feuille.
function findAllProductionHeaderRows(rows2D){
  const idxs = [];
  for (let i=0;i<rows2D.length;i++){
    const row = (rows2D[i]||[]).map(c => String(c||'').trim().toLowerCase());
    const hasProduit = row.includes('produit');
    const hasETH = row.includes('eth');
    const hasBQ = row.includes('#bq') || row.includes('bq');
    if (hasProduit && hasETH && hasBQ) idxs.push(i);
  }
  return idxs;
}

function parseProductionRows(rows2D, refSerial){
  const headerIdxs = findAllProductionHeaderRows(rows2D);
  if (headerIdxs.length === 0) return { rows: [], headerFound: false };

  const out = [];
  let rejectedBadDate = 0;
  for (let b=0; b<headerIdxs.length; b++){
    const headerIdx = headerIdxs[b];
    const blockEnd = (b+1 < headerIdxs.length) ? headerIdxs[b+1] : rows2D.length;
    const header = rows2D[headerIdx];
    const colProduit = colIndexOf(header, 'Produit');
    let colBQ = colIndexOf(header, '#BQ');
    if (colBQ === -1) colBQ = colIndexOf(header, 'BQ');
    const colETH = colIndexOf(header, 'ETH');
    if (colProduit===-1 || colBQ===-1 || colETH===-1) continue;

    for (let i=headerIdx+1; i<blockEnd; i++){
      const row = rows2D[i];
      if (!row || row.every(c => !c)) continue; // ligne vide -> on continue (le tableau peut avoir des trous)
      const produit = row[colProduit];
      if (!produit) continue;
      const qty = parseNum(row[colBQ]);
      const ethRaw = row[colETH];
      const eth = parseFrenchLooseDate(ethRaw, refSerial);
      if (!eth || qty<=0){ rejectedBadDate++; continue; }
      // On ne filtre plus ici par fenêtre de dates : on garde TOUT (y compris
      // l'historique mal interprété) pour rester transparent dans l'onglet
      // "Production à venir". Le filtrage par fenêtre se fait plus tard,
      // uniquement pour le calcul des disponibilités.
      const inWindow = (eth >= refSerial - 3 && eth <= refSerial + 45);
      out.push({ date: eth, codeRaw: produit, qty, ethRaw: String(ethRaw||''), inWindow });
    }
  }
  return { rows: out, headerFound: true, blocksFound: headerIdxs.length, rejectedBadDate };
}


// ---------- État global ----------
const TARGET_CALENDAR_DAYS = 28; // 4 semaines complètes (lundi->dimanche), affichées à la suite
const FORECAST_WEEKS_LOOKBACK = 8; // nb de semaines d'historique pour la moyenne par jour de semaine

let STATE = {
  productMap: new Map(),      // code ERP -> {codeMaj, nom, secteurMaj, ignore}
  productNames: new Map(),    // codeMaj -> nom lisible
  productSecteurs: new Map(), // codeMaj -> secteurMaj
  sales: [],                  // {date, client, codeRaw, qty}
  production: [],             // {date, codeRaw, qty}
  sortiesCodes: new Set(),    // codes bruts vus dans SortiesRecoltes — définit le périmètre suivi
  sortiesSheetTitle: null,
  stockManuel: {},            // { varietyKey: qty } — stock au lundi de la semaine en cours
  ethOffsets: {},             // { varietyKey: nbJours } — décalage manuel appliqué à toutes les dates ETH de cette variété
  stockOverrides: {},         // { varietyKey: { dateSerial: valeurForcée } } — comptage réel un jour donné, sert de point de départ pour la suite
  varieties: new Map(),       // varietyKey -> { nom, section, ventesParDate: Map(date->qty), productionParDate: Map(date->qty) }
  unmappedCodes: new Set(),
  lastImportAt: null
};

// Lundi de la semaine contenant `serial`.
function mondayOfWeek(serial){
  const dow = serialToDate(serial).getUTCDay(); // 0=Dim,1=Lun,...,6=Sam
  const diff = (dow === 0) ? -6 : (1 - dow);
  return serial + diff;
}
function isWeekday(serial){
  const dow = serialToDate(serial).getUTCDay();
  return dow !== 0 && dow !== 6;
}
// Respecte l'ordre exact fourni par l'utilisateur (PARIS_18_SCOPE), pas un
// tri alphabétique.
function sectionKeys(section){
  const seen = new Set(), out = [];
  for (const code of PARIS_18_SCOPE[section]){
    const key = code.trim().toUpperCase();
    if (seen.has(key)) continue;
    seen.add(key);
    if (STATE.varieties.has(key)) out.push(key);
  }
  return out;
}
function allVarietyKeys(){ return [...STATE.varieties.keys()]; }
const SECTION_PRIORITY = ['MICROPOUSSES','MICROXS','JP'];
function allSections(){ return SECTION_PRIORITY; }

// Construit la liste des variétés suivies à partir de ce qui apparaît
// réellement dans SortiesRecoltes (STATE.sortiesCodes) — c'est le seul
// périmètre qui compte. Les ventes/production ne sont ensuite rattachées
// qu'à ces variétés-là ; tout code absent de SortiesRecoltes est ignoré.
// Construit la liste des variétés suivies à partir du périmètre fixe
// PARIS_18_SCOPE (fourni par l'utilisateur) — ferme Paris 18 uniquement,
// pour exclure les variétés de la ferme Marseille présentes dans le même
// Sheet ERP. Les ventes/production ne sont ensuite rattachées qu'à ces
// variétés-là ; tout code hors de cette liste est ignoré.
// Détection Marseille indépendante de la résolution "Code Maj" : on regarde
// directement le code brut et, si connu, le nom/secteur résolu. Comme
// certaines lignes Marseille partagent le même "Code Maj" qu'une variété
// Paris, on ne peut pas se fier uniquement au secteur résolu.
function isMarseilleEntry(codeRaw, nom, secteurMaj){
  const c = String(codeRaw||'').toUpperCase();
  if (c.startsWith('M13-') || c.includes('MARSEILLE')) return true;
  if (nom && /marseille/i.test(nom)) return true;
  if (secteurMaj && /marseille/i.test(secteurMaj)) return true;
  return false;
}

// Un "colis" est un conditionnement (8 unités S ou 16 unités XS), pas une
// variété en soi. On ne veut jamais afficher "Colis XXX x16" comme nom de
// variété : ces lignes ne doivent servir qu'à convertir des quantités, pas à
// nommer la ligne.
function isColisEntry(codeRaw, nom){
  const c = String(codeRaw||'').toUpperCase();
  if (c.includes('COLIS')) return true;
  if (nom && /colis/i.test(nom)) return true;
  return false;
}

// Conversion colis -> unités : 1 colis de Micropousses S = 8 unités,
// 1 colis de Micro XS = 16 unités. Applicable seulement quand le code de
// vente brut indique explicitement un format "colis" (ex. COLISHYAN-S-PARIS).
function colisMultiplier(section){
  if (section === 'MICROPOUSSES') return 8;
  if (section === 'MICROXS') return 16;
  return 1;
}

function rebuildVarieties(){
  STATE.varieties = new Map();
  STATE.unmappedCodes = new Set();

  for (const section of ['MICROPOUSSES','MICROXS','JP']){
    for (const code of PARIS_18_SCOPE[section]){
      const key = code.trim().toUpperCase();
      if (STATE.varieties.has(key)) continue; // déjà présent (ex. doublon entre sections)
      const nomConnu = STATE.productNames.get(key);
      STATE.varieties.set(key, {
        nom: nomConnu || key,
        section,
        ventesParDate: new Map(),
        productionParDate: new Map(),
        weeklyTotals: new Map(),        // weekStart -> qty (pour la Tendance)
        weeklyClientTotals: new Map()   // weekStart -> Map(client -> qty) (pour le momentum "à client constant")
      });
      if (!nomConnu) STATE.unmappedCodes.add(key);
    }
  }
  const masterKeys = new Set(STATE.varieties.keys());

  for (const s of STATE.sales){
    if (isMarseilleEntry(s.codeRaw, s.nomRaw, null)) continue; // filtre rapide sur le code/nom brut
    const norm = normalizeToBase(s.codeRaw);
    const key = norm.key;
    if (!key || !masterKeys.has(key)) continue; // hors périmètre Paris 18 -> ignoré
    if (isMarseilleEntry(s.codeRaw, norm.nom, norm.secteurMaj)) continue; // double filtre, avec le nom/secteur résolus
    const v = STATE.varieties.get(key);
    let qty = s.qty;
    // Détection "colis" : le mot n'apparaît quasiment jamais dans le CODE
    // (ex. SHRE-XS16, COSP-XS16) mais toujours dans le NOM PRODUIT de la
    // ligne de vente (ex. "Colis SHISO ROUGE XS x 16") — on regarde donc le
    // nom brut de la ligne en priorité, avec le code et le nom résolu en repli.
    if (isColisEntry(s.codeRaw, s.nomRaw) || isColisEntry(s.codeRaw, norm.nom)){
      qty = qty * colisMultiplier(v.section);
    }
    v.ventesParDate.set(s.date, (v.ventesParDate.get(s.date)||0) + qty);
    // Totaux hebdo (pour la Tendance) + détail par client (pour le momentum
    // "à client constant" façon Prev Semis : on ne compare que les clients
    // présents aux deux semaines comparées, pour ne pas être faussé par un
    // client ponctuel qui commande gros une seule fois).
    const wk = mondayOfWeek(s.date);
    v.weeklyTotals.set(wk, (v.weeklyTotals.get(wk)||0) + qty);
    const client = String(s.client||'').trim().toLowerCase();
    if (!v.weeklyClientTotals.has(wk)) v.weeklyClientTotals.set(wk, new Map());
    const clientMap = v.weeklyClientTotals.get(wk);
    clientMap.set(client, (clientMap.get(client)||0) + qty);
  }
  // Momentum "marché" : même logique par client, mais pooled sur TOUTES les
  // variétés Paris 18 combinées, XS divisées par 2 (2 barquettes XS = 1
  // équivalent-S, le raisonnement de semis se fait en base S) — sert de
  // repli fiable quand une variété seule n'a pas assez de clients communs
  // aux deux semaines comparées pour être un signal sûr.
  STATE.marketWeeklyClientTotals = new Map();
  for (const v of STATE.varieties.values()){
    const factor = v.section === 'MICROXS' ? 0.5 : 1;
    for (const [wk, clientMap] of v.weeklyClientTotals.entries()){
      if (!STATE.marketWeeklyClientTotals.has(wk)) STATE.marketWeeklyClientTotals.set(wk, new Map());
      const marketMap = STATE.marketWeeklyClientTotals.get(wk);
      for (const [client, qty] of clientMap.entries()){
        marketMap.set(client, (marketMap.get(client)||0) + qty*factor);
      }
    }
  }
  for (const p of STATE.production){
    if (!p.inWindow) continue; // filtrage par fenêtre de dates ici, pas au parsing
    if (isMarseilleEntry(p.codeRaw, null, null)) continue;
    const norm = normalizeToBase(p.codeRaw);
    const key = norm.key;
    if (!key || !masterKeys.has(key)) continue;
    if (isMarseilleEntry(p.codeRaw, norm.nom, norm.secteurMaj)) continue;
    const v = STATE.varieties.get(key);
    // La production des variétés XS est enregistrée en équivalent format S ;
    // on double la quantité pour revenir à la même base que les ventes (en
    // unités XS réelles).
    let qty = p.qty;
    if (v.section === 'MICROXS') qty = qty * 2;
    // On stocke la date BRUTE (non décalée) ici : le décalage ETH réglable
    // par l'utilisateur est appliqué à la lecture (dans projectVarietyFull),
    // pas ici, pour qu'un changement de réglage prenne effet immédiatement
    // sans devoir tout recharger depuis les Sheets.
    v.productionParDate.set(p.date, (v.productionParDate.get(p.date)||0) + qty);
  }
}

// ---------- Modèle de prévision façon "Prev Semis" : Tendance × Momentum ----------
// Tendance = moyenne des TENDANCE_WEEKS dernières semaines (toutes ventes de
// la variété, tous clients confondus).
// Momentum = compare, l'an dernier, le volume de la période équivalente à la
// semaine visée à celui de la période équivalente à maintenant — capture la
// tendance saisonnière observée l'an dernier plutôt qu'une simple comparaison
// YoY brute. Si la variété n'a pas assez de clients distincts (confiance <
// CONFIDENCE_CLIENT_THRESHOLD) sur la période "maintenant" l'an dernier, on
// utilise uniquement le momentum marché (toutes variétés, XS ÷2) plutôt que
// le momentum propre à la variété, jugé trop bruité sur peu de clients.
// Le poids par jour de semaine (calculé sur les dernières semaines réelles)
// répartit ensuite la prévision hebdomadaire sur les 7 jours.
const TENDANCE_WEEKS = 8;
const CONFIDENCE_CLIENT_THRESHOLD = 8;
const WEEKDAY_WEIGHT_WEEKS = 8;
const MOMENTUM_MIN = 0.5, MOMENTUM_MAX = 2.0; // borne pour éviter les dérapages sur peu de données

// Momentum "à client constant" : ne compare que les clients présents aux
// DEUX semaines (pour ne pas être faussé par un client ponctuel qui commande
// gros une seule fois, ou par un nouveau client qui gonfle artificiellement
// la hausse). Renvoie null si aucun client commun.
function cohortMomentum(weeklyClientTotals, nowWeek, targetWeek){
  const nowMap = weeklyClientTotals.get(nowWeek);
  const targetMap = weeklyClientTotals.get(targetWeek);
  if (!nowMap || !targetMap) return null;
  let nowSum = 0, targetSum = 0, n = 0;
  for (const [client, qty] of nowMap.entries()){
    if (targetMap.has(client)){
      nowSum += qty;
      targetSum += targetMap.get(client);
      n++;
    }
  }
  if (nowSum <= 0) return null;
  return { ratio: targetSum / nowSum, clientCount: n };
}

function computeWeeklyForecast(v, weekStart, refWeekStart){
  // Tendance : moyenne des TENDANCE_WEEKS dernières semaines complètes
  // (globale, tous clients confondus — seul le momentum raisonne "à client
  // constant", pas la tendance).
  let sum = 0;
  for (let w=1; w<=TENDANCE_WEEKS; w++){
    sum += v.weeklyTotals.get(refWeekStart - 7*w) || 0;
  }
  const tendance = sum / TENDANCE_WEEKS;

  // Momentum : hausse/baisse observée l'an dernier entre la semaine
  // "maintenant" et la semaine visée (S+1, S+2...), à client constant.
  const lastYearNowWeek = refWeekStart - 364;
  const lastYearTargetWeek = weekStart - 364;

  const varietyCohort = cohortMomentum(v.weeklyClientTotals, lastYearNowWeek, lastYearTargetWeek);
  const marketCohort = cohortMomentum(STATE.marketWeeklyClientTotals, lastYearNowWeek, lastYearTargetWeek);

  const marketMomentum = marketCohort ? marketCohort.ratio : 1;
  const varietyMomentum = varietyCohort ? varietyCohort.ratio : marketMomentum;
  const confidence = varietyCohort ? varietyCohort.clientCount : 0;

  let momentum = confidence >= CONFIDENCE_CLIENT_THRESHOLD
    ? (varietyMomentum + marketMomentum) / 2
    : marketMomentum;
  momentum = Math.max(MOMENTUM_MIN, Math.min(MOMENTUM_MAX, momentum));

  return { tendance, momentum, confidence, varietyMomentum, marketMomentum, forecast: tendance * momentum };
}

function buildForecastModel(v, refSerial){
  const refWeekStart = mondayOfWeek(refSerial);

  // Poids par jour de semaine (0=Lundi..6=Dimanche) sur les dernières semaines réelles.
  const dowSums = [0,0,0,0,0,0,0];
  let total = 0;
  for (let w=1; w<=WEEKDAY_WEIGHT_WEEKS; w++){
    const wStart = refWeekStart - 7*w;
    for (let d=0; d<7; d++){
      const amt = v.ventesParDate.get(wStart + d) || 0;
      dowSums[d] += amt;
      total += amt;
    }
  }
  const weights = total > 0 ? dowSums.map(s => s/total) : [1/7,1/7,1/7,1/7,1/7,1/7,1/7];

  // Une prévision hebdomadaire par semaine affichée (le momentum dépend de
  // combien de semaines on regarde en avant).
  const weeksNeeded = Math.ceil(TARGET_CALENDAR_DAYS / 7) + 1;
  const weeklyForecasts = [];
  for (let w=0; w<weeksNeeded; w++){
    weeklyForecasts.push(computeWeeklyForecast(v, refWeekStart + 7*w, refWeekStart));
  }

  return { weights, weeklyForecasts, refWeekStart };
}

// dateSerial -> index 0=Lundi..6=Dimanche (au lieu de 0=Dimanche par défaut en JS)
function isoDow(dateSerial){
  const jsDow = serialToDate(dateSerial).getUTCDay(); // 0=Dim..6=Sam
  return (jsDow + 6) % 7; // 0=Lun..6=Dim
}

function forecastSaleForDate(model, dateSerial){
  const dow = isoDow(dateSerial);
  const weekIdx = Math.floor((dateSerial - model.refWeekStart) / 7);
  const wf = model.weeklyForecasts[weekIdx] || model.weeklyForecasts[model.weeklyForecasts.length-1];
  return wf.forecast * model.weights[dow];
}

// Construit la projection jour par jour pour une variété, sur toute la
// période affichée (TARGET_CALENDAR_DAYS jours, week-ends inclus mais grisés, à partir du lundi de la semaine en
// cours). Chaque jour : stock = stock(veille) + production du jour - vente du
// jour (réelle si déjà connue — y compris pour les jours déjà passés cette
// semaine —, sinon prévue).
const projectionCache = new Map();
function projectVarietyFull(key){
  if (projectionCache.has(key)) return projectionCache.get(key);
  const v = STATE.varieties.get(key);
  const refSerial = todaySerial();
  const weekStart = mondayOfWeek(refSerial);
  const startStock = STATE.stockManuel[key] || 0;
  const overrides = STATE.stockOverrides[key] || {};
  const ethOffset = STATE.ethOffsets[key] || 0;
  const model = buildForecastModel(v, refSerial);
  const days = [];
  let running = startStock;
  for (let i=0; i<TARGET_CALENDAR_DAYS; i++){
    const d = weekStart + i;
    // Décalage ETH appliqué ici, à la lecture : le jour affiché "d" montre la
    // production qui était brute à la date (d - ethOffset).
    const prod = v.productionParDate.get(d - ethOffset) || 0;
    let vente, venteReelle;
    if (d < refSerial){
      vente = v.ventesParDate.get(d) || 0; venteReelle = true;
    } else if (v.ventesParDate.has(d)){
      vente = v.ventesParDate.get(d); venteReelle = true;
    } else {
      vente = forecastSaleForDate(model, d); venteReelle = false;
    }
    running = running + prod - vente;
    // Comptage réel forcé : remplace le stock calculé ce jour-là (prod/vente
    // restent affichés à titre d'info), et sert de nouveau point de départ
    // pour tous les jours suivants de cette ligne.
    const hasOverride = Object.prototype.hasOwnProperty.call(overrides, d);
    if (hasOverride) running = overrides[d];
    const dow = serialToDate(d).getUTCDay();
    days.push({ date: d, stock: running, production: prod, vente, venteReelle, isMonday: dow===1, isFriday: dow===5, isWeekend: dow===0 || dow===6, isOverride: hasOverride });
  }
  const result = { startStock, weekStart, days, model };
  projectionCache.set(key, result);
  return result;
}

function averageRecentDailySales(v, refSerial, windowDays){
  let sum=0, n=0;
  for (let d=refSerial-windowDays; d<refSerial; d++){
    if (v.ventesParDate.has(d)){ sum += v.ventesParDate.get(d); n++; }
  }
  return n>0 ? sum/n : 0;
}


// ---------- État "settings" persisté (stock manuel) ----------
async function loadPersistedState(){
  try{
    await ensureSheetExists(APP_STATE_CONFIG.spreadsheetId, APP_STATE_CONFIG.sheetTitle);
    const rows = await sheetsGetValues(APP_STATE_CONFIG.spreadsheetId, `'${APP_STATE_CONFIG.sheetTitle}'!A2:B2`);
    const raw = rows && rows[0] && rows[0][1];
    const parsed = raw ? JSON.parse(raw) : {};
    // Compat : anciennes sauvegardes qui étaient juste { varietyKey: qty }
    // sans le niveau stockManuel/ethOffsets/stockOverrides.
    if (parsed && (parsed.stockManuel || parsed.ethOffsets || parsed.stockOverrides)){
      STATE.stockManuel = parsed.stockManuel || {};
      STATE.ethOffsets = parsed.ethOffsets || {};
      STATE.stockOverrides = parsed.stockOverrides || {};
    } else {
      STATE.stockManuel = parsed || {};
      STATE.ethOffsets = {};
      STATE.stockOverrides = {};
    }
  }catch(e){
    console.error(e);
    STATE.stockManuel = {};
    STATE.ethOffsets = {};
    STATE.stockOverrides = {};
    logImport("Impossible de charger le stock sauvegardé (" + e.message + "). On repart de 0, à saisir manuellement.");
  }
  // Pas de pré-remplissage automatique : le stock de départ est saisi
  // entièrement à la main, variété par variété.
}
async function savePersistedState(silent){
  try{
    await sheetsUpdateValues(APP_STATE_CONFIG.spreadsheetId, `'${APP_STATE_CONFIG.sheetTitle}'!A2:B2`,
      [['stockManuel', JSON.stringify({ stockManuel: STATE.stockManuel, ethOffsets: STATE.ethOffsets, stockOverrides: STATE.stockOverrides })]]);
    if (!silent) logImport('Stock de départ, décalages ETH et comptages forcés sauvegardés.');
    else logImport('Sauvegarde automatique effectuée.');
    return true;
  }catch(e){
    console.error(e);
    if (!silent) alert("Erreur de sauvegarde (" + e.message + "). Vérifie ta connexion et tes droits d'accès au Sheet « Wesh Grow - App State ».");
    else logImport('⚠️ Échec de la sauvegarde automatique : ' + e.message);
    return false;
  }
}

// Sauvegarde automatique : déclenchée à chaque modification (stock, ETH,
// comptage forcé), avec un léger délai pour regrouper les frappes rapides et
// ne pas spammer l'API à chaque caractère tapé. Le fichier étant partagé par
// plusieurs collaborateurs, chaque modification doit être visible de tous
// sans action manuelle.
let autoSaveTimer = null;
function scheduleAutoSave(){
  if (autoSaveTimer) clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(async () => {
    await savePersistedState(true);
  }, 1200);
}

// ---------- Import / rafraîchissement des données ----------
let importLogLines = [];
function logImport(msg){
  const t = new Date().toLocaleTimeString('fr-FR');
  importLogLines.unshift(`[${t}] ${msg}`);
  importLogLines = importLogLines.slice(0, 30);
  const el = document.getElementById('importLog');
  if (el) el.innerHTML = importLogLines.map(l => `<div>${l}</div>`).join('');
}

async function refreshAll(){
  const btn = document.getElementById('refreshBtn');
  if (btn){ btn.disabled = true; btn.textContent = 'Actualisation…'; }
  try{
    logImport('Recherche de la table de correspondance produits (Code Produit / Code Maj)…');
    const built = await findProductMapTable(SALES_SHEET_CONFIG.spreadsheetId);
    STATE.productMap = built.map;
    if (!built.ok){
      logImport(`⚠️ Aucun onglet avec une table "Code Produit"/"Code Maj" n'a été trouvé (onglets vérifiés : ${(built.scannedTitles||[]).join(', ')}). Les noms et secteurs ne pourront pas être résolus.`);
    } else {
      logImport(`${STATE.productMap.size} correspondances chargées depuis l'onglet « ${built.sheetTitle} »${built.scanned ? ' (détecté automatiquement)' : ''} — ${built.headerInfo}.`);
    }
    STATE.productNames = new Map();
    STATE.productSecteurs = new Map();
    // Résolution du nom en 3 passes de priorité décroissante :
    // 1) ni Marseille ni Colis (le vrai nom de base de la variété Paris)
    // 2) pas Marseille (peut être un Colis, mieux que rien)
    // 3) tout le reste (comble les derniers trous)
    const fillNames = (predicate) => {
      for (const [code, info] of STATE.productMap.entries()){
        if (!predicate(code, info)) continue;
        if (!STATE.productNames.has(info.codeMaj)) STATE.productNames.set(info.codeMaj, cleanProductName(info.nom));
        if (!STATE.productSecteurs.has(info.codeMaj)) STATE.productSecteurs.set(info.codeMaj, info.secteurMaj);
      }
    };
    fillNames((code, info) => !isMarseilleEntry(code, info.nom, info.secteurMaj) && !isColisEntry(code, info.nom));
    fillNames((code, info) => !isMarseilleEntry(code, info.nom, info.secteurMaj));
    fillNames(() => true);

    logImport('Chargement des ventes (Order import)…');
    const salesRows = await sheetsGetValues(SALES_SHEET_CONFIG.spreadsheetId, SALES_SHEET_CONFIG.orderImportRange);
    STATE.sales = parseSalesRows(salesRows);
    logImport(`${STATE.sales.length} lignes de vente chargées.`);

    logImport('Chargement de la production à venir…');
    const parsedProd = await findAndLoadProductionTable(PRODUCTION_SHEET_CONFIG.spreadsheetId, todaySerial());
    STATE.production = parsedProd.rows;
    STATE.productionSheetTitle = parsedProd.sheetTitle;
    if (!parsedProd.headerFound){
      logImport(`⚠️ Aucun onglet avec un tableau Produit/#BQ/ETH n'a été trouvé dans ce fichier (onglets vérifiés : ${(parsedProd.scannedTitles||[]).join(', ')}).`);
    } else {
      const inWin = STATE.production.filter(r => r.inWindow).length;
      logImport(`${STATE.production.length} lignes de production trouvées dans l'onglet « ${parsedProd.sheetTitle} » (${parsedProd.blocksFound} tableau(x) fusionné(s)), dont ${inWin} dans la fenêtre ±45j utilisée pour les calculs${parsedProd.scanned ? ' — détecté automatiquement' : ''}.`);
    }

    rebuildVarieties();
    projectionCache.clear();
    STATE.lastImportAt = new Date().toISOString();

    document.getElementById('headerMeta').innerHTML =
      `Dernière actualisation : <b>${new Date().toLocaleString('fr-FR')}</b><br>` +
      `<span class="small">${STATE.varieties.size} variétés suivies (périmètre fixe Paris 18) · ` +
      `${STATE.sales.length} ventes chargées · ${STATE.production.length} lots de production` +
      (STATE.productionSheetTitle ? ` (onglet « ${STATE.productionSheetTitle} »)` : ' (onglet introuvable)') +
      `</span>`;

    render();
  }catch(e){
    console.error(e);
    logImport('Erreur : ' + e.message);
    alert("Erreur lors du chargement des données (" + e.message + "). Vérifie ta connexion et tes droits d'accès aux Sheets.");
  }finally{
    if (btn){ btn.disabled = false; btn.textContent = 'Actualiser les données'; }
  }
}


// ---------- Rendu ----------
let activeTab = 'dispo';
let stockDirty = {}; // key -> true si modifié pas encore sauvegardé

const SECTION_LABELS = { MICROPOUSSES: 'Micropousses', MICROXS: 'Micro XS', JP: 'Jeunes pousses' };

function stockCellClass(dispo, venteJour){
  if (dispo < 0) return 'crit';
  if (venteJour > 0 && dispo < venteJour) return 'warn';
  return 'ok';
}

function renderKPIs(){
  const keys = allVarietyKeys();
  let ruptureCount = 0;
  for (const k of keys){
    const proj = projectVarietyFull(k);
    if (proj.days.some(d => d.stock < 0)) ruptureCount++;
  }
  const kpis = [
    { label: 'Variétés suivies', value: keys.length },
    { label: 'Lots de production à venir', value: STATE.production.length },
    { label: `Ruptures anticipées (${TARGET_CALENDAR_DAYS}j)`, value: ruptureCount, danger: true },
    { label: 'Codes non reconnus', value: STATE.unmappedCodes.size, accent: STATE.unmappedCodes.size>0 }
  ];
  document.getElementById('kpis').innerHTML = kpis.map(k =>
    `<div class="kpi${k.danger?' danger':''}${k.accent?' accent':''}"><div class="label">${k.label}</div><div class="value">${k.value}</div></div>`
  ).join('');
}


// Panneau compact pour saisir/ajuster le stock de départ (valable au lundi de
// la semaine en cours), groupé par format. Affiché au-dessus du tableau.
function renderStockEditor(){
  let inner = '';
  for (const sec of allSections()){
    const keys = sectionKeys(sec);
    if (keys.length === 0) continue;
    inner += `<div class="cs-section-title" style="margin-top:10px;">${SECTION_LABELS[sec] || sec}</div><div class="cs-list" style="gap:10px;">`;
    for (const key of keys){
      const v = STATE.varieties.get(key);
      if (!v) continue;
      const dirty = stockDirty[key] ? ' dirty' : '';
      inner += `<label style="display:flex;flex-direction:column;gap:2px;font-size:11px;color:var(--muted);min-width:150px;">${v.nom}
        <input type="number" class="stock-input${dirty}" data-key="${key}" value="${STATE.stockManuel[key]||0}" min="0" style="width:100%;">
      </label>`;
    }
    inner += `</div>`;
  }
  return `
    <div class="panel">
      <details>
        <summary>Stock de départ (lundi de la semaine en cours) — modifier</summary>
        <p class="hint">Pré-rempli depuis le dernier inventaire connu, à ajuster à la main. Le réglage ETH se fait directement dans la colonne de gauche du tableau, sous chaque variété. Clique « Enregistrer le stock de départ » en haut pour sauvegarder les deux.</p>
        ${inner}
      </details>
    </div>`;
}

function renderDispoContinuous(){
  const refSerial = todaySerial();

  const dayHeaders = [];
  // On génère les mêmes jours en regardant une variété de référence
  // (n'importe laquelle, la séquence de dates est identique pour toutes)
  // pour construire l'en-tête une seule fois.
  const anyKey = allVarietyKeys()[0];
  const refDays = anyKey ? projectVarietyFull(anyKey).days : [];
  let extraCols = 0;
  for (const day of refDays){
    const isToday = day.date === refSerial;
    const styles = [];
    if (day.isMonday) styles.push('border-left:3px solid var(--primary)');
    if (day.isWeekend) styles.push('background:#DEDACB');
    const styleAttr = styles.length ? ` style="${styles.join(';')};"` : '';
    dayHeaders.push(`<th class="${isToday?'today':''}"${styleAttr}><div class="day-head ${isToday?'today':''}"><span class="dow">${dowFr(day.date)}</span><span class="dm">${fmtDateShort(day.date)}</span></div></th>`);
    if (day.isFriday){
      dayHeaders.push(`<th style="background:#EFE6D0;border-left:2px solid var(--accent);"><div class="day-head"><span class="dow">Total</span><span class="dm">semaine</span></div></th>`);
      extraCols++;
    }
  }

  let bodyRows = '';
  let totalVarieties = 0;
  const colCount = 1 + refDays.length + extraCols;
  for (const sec of allSections()){
    const keys = sectionKeys(sec);
    if (keys.length === 0) continue;
    bodyRows += `<tr><td colspan="${colCount}" style="background:#F3F1E8;font-weight:700;color:var(--primary);text-align:left;padding:8px 10px;">${SECTION_LABELS[sec] || sec}</td></tr>`;
    for (const key of keys){
      const v = STATE.varieties.get(key);
      if (!v) continue;
      totalVarieties++;
      const proj = projectVarietyFull(key);
      const avgSale = averageRecentDailySales(v, refSerial, 30);
      const offset = STATE.ethOffsets[key] || 0;
      let cells = `<td class="variety-cell">${v.nom}<div class="cell-detail">moy. ${avgSale.toFixed(1)}/j</div>
        <div style="display:flex;align-items:center;gap:3px;margin-top:5px;">
          <span style="font-size:9px;color:var(--muted);">ETH</span>
          <button type="button" class="eth-btn" data-key="${key}" data-dir="-1" title="Décaler -1 jour" style="padding:1px 5px;line-height:1;font-size:11px;">▼</button>
          <input type="number" class="eth-offset-input${offset!==0?' dirty':''}" data-key="${key}" value="${offset}" style="width:40px;text-align:center;font-size:11px;padding:2px;">
          <button type="button" class="eth-btn" data-key="${key}" data-dir="1" title="Décaler +1 jour" style="padding:1px 5px;line-height:1;font-size:11px;">▲</button>
        </div>
      </td>`;
      let weekVente = 0, weekProd = 0;
      for (const day of proj.days){
        weekVente += day.vente;
        weekProd += day.production;
        const cls = stockCellClass(day.stock, day.vente);
        const label = day.venteReelle ? 'réel' : 'prévu';
        const styles = [];
        if (day.isMonday) styles.push('border-left:3px solid var(--border)');
        if (day.isWeekend) styles.push('background:#F7F5EE');
        const styleAttr = styles.length ? ` style="${styles.join(';')};"` : '';
        const overrideClass = day.isOverride ? ' override' : '';
        cells += `<td${styleAttr}>
          <input type="number" class="cell-stock-input ${cls}${overrideClass}" data-key="${key}" data-date="${day.date}" value="${Math.round(day.stock)}" title="${day.isOverride ? 'Comptage réel forcé — vide le champ pour revenir au calcul automatique' : 'Cliquer pour forcer un comptage réel ce jour-là'}">
          <div class="cell-detail">Prod +${Math.round(day.production)}</div>
          <div class="cell-detail">Vente -${Math.round(day.vente)} (${label})</div>
        </td>`;
        if (day.isFriday){
          cells += `<td style="background:#FAF7EE;border-left:2px solid var(--accent);">
            <div class="cell-stock ok" style="background:var(--surface);border:1px solid var(--border);">${Math.round(day.stock)}</div>
            <div class="cell-detail">Σ Prod ${Math.round(weekProd)}</div>
            <div class="cell-detail">Σ Vente ${Math.round(weekVente)}</div>
          </td>`;
          weekVente = 0; weekProd = 0;
        }
      }
      bodyRows += `<tr>${cells}</tr>`;
    }
  }

  if (totalVarieties === 0){
    return `<div class="empty-state"><h2>Aucune variété à afficher</h2><p>Actualise les données, ou vérifie que les ventes/production ont bien été chargées.</p></div>`;
  }

  return `
    <div class="grid-wrap">
      <table class="grid">
        <thead>
          <tr>
            <th class="variety-col">Variété</th>
            ${dayHeaders.join('')}
          </tr>
        </thead>
        <tbody>${bodyRows}</tbody>
      </table>
    </div>`;
}

function renderProductionTab(){
  const rows = [...STATE.production].sort((a,b) => a.date - b.date);
  if (rows.length === 0){
    return `<div class="empty-state"><h2>Aucun lot de production trouvé</h2><p>Vérifie que l'onglet Production contient bien un tableau avec les colonnes Produit / #BQ / ETH.</p></div>`;
  }
  const inWindowCount = rows.filter(r => r.inWindow).length;
  let body = '';
  for (const r of rows){
    const { key, nom } = normalizeToBase(r.codeRaw);
    const dimmed = r.inWindow ? '' : ' style="opacity:.45;"';
    const badge = r.inWindow ? '' : ' <span class="small" style="color:var(--muted);">(hors fenêtre ±45j — ignoré dans Disponibilités)</span>';
    body += `<tr${dimmed}><td style="text-align:left;padding:8px 10px;">${fmtDateShort(r.date)} (${dowFr(r.date)})${badge}</td><td style="text-align:left;">${r.codeRaw}</td><td style="text-align:left;font-size:10px;color:var(--muted);">${r.ethRaw}</td><td style="text-align:left;">${nom}</td><td>${Math.round(r.qty)}</td></tr>`;
  }
  return `
    <p class="hint">${rows.length} lignes au total, dont ${inWindowCount} dans la fenêtre utilisée pour les Disponibilités (grisées = hors fenêtre, probablement de l'historique mal daté). La colonne "ETH brut" montre le texte exact lu dans le Sheet.</p>
    <div class="grid-wrap">
      <table class="grid">
        <thead><tr><th class="variety-col">Date de dispo. (interprétée)</th><th style="text-align:left;">Code lot</th><th style="text-align:left;">ETH brut</th><th style="text-align:left;">Variété</th><th>Quantité</th></tr></thead>
        <tbody>${body}</tbody>
      </table>
    </div>`;
}

function renderUnmappedTab(){
  if (STATE.unmappedCodes.size === 0){
    return `<div class="empty-state"><h2>Tous les codes sont reconnus 🎉</h2></div>`;
  }
  const list = [...STATE.unmappedCodes].sort();
  return `
    <div class="panel">
      <p class="hint">Ces codes (ventes ou production) n'ont pas pu être rattachés à une variété via la table « Product agregate ». Ils apparaissent tels quels dans le tableau des disponibilités — vérifie s'il faut compléter la correspondance dans le Sheet ERP.</p>
      <div class="review-list" style="font-size:12px;">${list.map(c => `<div>${c}</div>`).join('')}</div>
    </div>`;
}

const TAB_DESCRIPTIONS = {
  dispo: `Stock projeté jour par jour (${TARGET_CALENDAR_DAYS} jours à la suite, week-ends grisés) : stock de départ + production entrante − ventes (réelles si connues, sinon prévision).`,
  production: 'Tous les lots de production dont la date de disponibilité (ETH) est connue, triés par date.',
  nonmappe: "Codes produit rencontrés dans les ventes ou la production, mais qui n'ont pas de correspondance claire dans la table produit (hors fleurs, volontairement exclues)."
};

function buildTabsBar(){
  let html = `<button class="tab-btn active" data-tab="dispo">Disponibilités</button>`;
  html += `<button class="tab-btn" data-tab="production">Production à venir</button>`;
  html += `<button class="tab-btn" data-tab="nonmappe">Codes non reconnus <span class="small" id="tabCountUnmapped"></span></button>`;
  document.getElementById('tabsBar').innerHTML = html;
}

function render(){
  // On sauvegarde la position de défilement (page + tableau) avant de
  // régénérer le HTML, sinon chaque petite modification (stock, ETH,
  // comptage forcé) fait sauter la page en haut.
  const gridWrapBefore = document.querySelector('.grid-wrap');
  const scrollState = {
    windowY: window.scrollY,
    gridTop: gridWrapBefore ? gridWrapBefore.scrollTop : 0,
    gridLeft: gridWrapBefore ? gridWrapBefore.scrollLeft : 0
  };

  renderKPIs();
  const content = document.getElementById('tabContent');
  const tabDesc = document.getElementById('tabDesc');

  if (activeTab === 'dispo'){
    tabDesc.textContent = TAB_DESCRIPTIONS.dispo;
    content.innerHTML = renderStockEditor() + renderDispoContinuous();
  } else if (activeTab === 'production'){
    tabDesc.textContent = TAB_DESCRIPTIONS.production;
    content.innerHTML = renderProductionTab();
  } else {
    tabDesc.textContent = TAB_DESCRIPTIONS.nonmappe;
    content.innerHTML = renderUnmappedTab();
    document.getElementById('tabCountUnmapped').textContent = `(${STATE.unmappedCodes.size})`;
  }

  // Ré-attacher les listeners des inputs de stock
  content.querySelectorAll('.stock-input').forEach(inp => {
    inp.addEventListener('input', (e) => {
      const key = e.target.dataset.key;
      const val = parseFloat(e.target.value) || 0;
      STATE.stockManuel[key] = val;
      stockDirty[key] = true;
      e.target.classList.add('dirty');
      projectionCache.delete(key);
      scheduleAutoSave();
    });
    inp.addEventListener('change', () => { render(); });
  });

  // Réglage ETH : champ libre + boutons flèche (±1 jour)
  content.querySelectorAll('.eth-offset-input').forEach(inp => {
    inp.addEventListener('change', (e) => {
      const key = e.target.dataset.key;
      const val = Math.round(parseFloat(e.target.value)) || 0;
      STATE.ethOffsets[key] = val;
      stockDirty[key] = true;
      projectionCache.delete(key);
      scheduleAutoSave();
      render();
    });
  });
  content.querySelectorAll('.eth-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const key = e.currentTarget.dataset.key;
      const dir = parseInt(e.currentTarget.dataset.dir, 10);
      STATE.ethOffsets[key] = (STATE.ethOffsets[key] || 0) + dir;
      stockDirty[key] = true;
      projectionCache.delete(key);
      scheduleAutoSave();
      render();
    });
  });

  // Comptage réel forcé sur une case de dispo : remplace le calcul ce
  // jour-là et sert de nouveau point de départ pour la suite de la ligne.
  // Champ vidé -> on retire le forçage et on repasse au calcul automatique.
  content.querySelectorAll('.cell-stock-input').forEach(inp => {
    inp.addEventListener('focus', (e) => { e.target.select(); });
    inp.addEventListener('change', (e) => {
      const key = e.target.dataset.key;
      const date = parseInt(e.target.dataset.date, 10);
      const raw = e.target.value.trim();
      if (!STATE.stockOverrides[key]) STATE.stockOverrides[key] = {};
      if (raw === ''){
        delete STATE.stockOverrides[key][date];
      } else {
        STATE.stockOverrides[key][date] = parseFloat(raw) || 0;
      }
      stockDirty[key] = true;
      projectionCache.delete(key);
      scheduleAutoSave();
      render();
    });
  });

  // Restauration de la position de défilement sauvegardée en haut de la
  // fonction, une fois le nouveau HTML en place.
  const gridWrapAfter = document.querySelector('.grid-wrap');
  if (gridWrapAfter){
    gridWrapAfter.scrollTop = scrollState.gridTop;
    gridWrapAfter.scrollLeft = scrollState.gridLeft;
  }
  window.scrollTo(0, scrollState.windowY);
}


// ---------- Wire up ----------
async function main(){
  const fu = document.getElementById('footerUser');
  if (fu) fu.textContent = CURRENT_USER || '';
  const fv = document.getElementById('footerVersion');
  if (fv) fv.textContent = APP_VERSION;

  document.getElementById('refreshBtn').addEventListener('click', refreshAll);
  document.getElementById('saveStockBtn').addEventListener('click', async () => {
    const ok = await savePersistedState();
    if (ok){ stockDirty = {}; render(); }
  });
  document.getElementById('importLogToggle').addEventListener('click', () => {
    const el = document.getElementById('importLog');
    el.style.display = el.style.display === 'none' ? 'block' : 'none';
  });
  document.getElementById('tabsBar').addEventListener('click', (e) => {
    const btn = e.target.closest('.tab-btn');
    if (!btn) return;
    activeTab = btn.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b===btn));
    render();
  });

  buildTabsBar();
  await loadPersistedState();
  await refreshAll();
}

// ---------- Authentification Google (OAuth) ----------
function showApp(){
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('app').style.display = 'block';
  main();
}
function showLogin(errorMsg){
  document.getElementById('loginScreen').style.display = 'block';
  document.getElementById('app').style.display = 'none';
  const errEl = document.getElementById('loginError');
  if (errorMsg){ errEl.textContent = errorMsg; errEl.style.display = 'block'; }
  else { errEl.style.display = 'none'; }
}

let tokenClient = null;

function initGoogleAuth(){
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_OAUTH_CONFIG.clientId,
    scope: GOOGLE_OAUTH_CONFIG.scope,
    callback: async (tokenResponse) => {
      if (tokenResponse.error){
        showLogin("Connexion refusée ou annulée. Réessaie.");
        return;
      }
      ACCESS_TOKEN = tokenResponse.access_token;
      try{
        const resp = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` }
        });
        const info = await resp.json();
        CURRENT_USER = info.email || 'compte Google';
        if (!AUTHORIZED_USERS.some(u => normalizeUser(u) === normalizeUser(CURRENT_USER))){
          console.warn('Utilisateur non présent dans AUTHORIZED_USERS :', CURRENT_USER);
        }
        showApp();
      }catch(e){
        showLogin("Connexion réussie mais impossible de récupérer l'email du compte. Réessaie.");
        console.error(e);
      }
    }
  });
}

document.getElementById('loginBtn').addEventListener('click', () => {
  if (!tokenClient){
    showLogin("La connexion Google n'est pas encore prête. Recharge la page (F5) et réessaie. Si ça persiste, vérifie qu'aucun bloqueur de publicités/traqueurs n'empêche accounts.google.com de se charger.");
    return;
  }
  tokenClient.requestAccessToken({ prompt: 'consent' });
});

(function waitForGisAndInit(){
  let attempts = 0;
  const maxAttempts = 150;
  const waitForGis = setInterval(() => {
    attempts++;
    if (window.google && window.google.accounts && window.google.accounts.oauth2){
      clearInterval(waitForGis);
      initGoogleAuth();
      return;
    }
    if (attempts >= maxAttempts){
      clearInterval(waitForGis);
      console.error("Le script Google Identity Services n'a pas pu être chargé après 15s.");
    }
  }, 100);
})();
