// ==================== CONFIGURATION ====================
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
  productAggregateRange: "'Product agregate'!A2:J"
};

// Sheet Production (planning de récolte / disponibilité) — lecture seule.
// La feuille "Production" est en forme libre (plusieurs tableaux imbriqués),
// donc on récupère une plage large et on retrouve le bon tableau par ses
// en-têtes ("Produit", "#BQ", "ETH") plutôt que par un numéro de ligne fixe,
// pour rester robuste si la mise en page bouge un peu.
const PRODUCTION_SHEET_CONFIG = {
  spreadsheetId: '10NssGM-yKSUnTrxnqliHIf50Faeja-qghjdMSlZFjCw',
  scanRange: "'Production'!A1:CZ3000"
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

// ---------- Correspondance code produit -> variété (base) ----------
// STATE.productMap : Map code_ERP -> { codeMaj, nom, secteurMaj }
// normalizeToBase(code) : renvoie la "clé variété" utilisée partout dans l'appli.
function buildProductMap(rows){
  const map = new Map();
  for (const row of rows){
    const secteurProduit = row[0], codeProduit = row[1], nomProduit = row[2],
          codeMaj = row[3], secteurMaj = row[4], ignoreImport = row[7];
    if (!codeProduit) continue;
    map.set(String(codeProduit).trim().toUpperCase(), {
      codeMaj: (codeMaj||codeProduit).trim().toUpperCase(),
      nom: nomProduit || codeProduit,
      secteurMaj: secteurMaj || secteurProduit || '',
      ignore: String(ignoreImport||'').toUpperCase() === 'OUI'
    });
  }
  return map;
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
  if (!code) return { key: null, nom: null, unmapped: true };
  const direct = STATE.productMap.get(code);
  if (direct) return { key: direct.codeMaj, nom: STATE.productNames.get(direct.codeMaj) || direct.nom, unmapped: false };
  const stripped = stripProductionSuffix(code);
  if (stripped !== code){
    const viaStripped = STATE.productMap.get(stripped);
    if (viaStripped) return { key: viaStripped.codeMaj, nom: STATE.productNames.get(viaStripped.codeMaj) || viaStripped.nom, unmapped: false };
    // Le code de base lui-même peut être directement un "Code Maj" connu.
    if (STATE.productNames.has(stripped)) return { key: stripped, nom: STATE.productNames.get(stripped), unmapped: false };
    return { key: stripped, nom: stripped, unmapped: true };
  }
  return { key: code, nom: code, unmapped: true };
}

// ---------- Parsing "Order import" (ventes) ----------
function parseSalesRows(rows){
  // Colonnes A2:K -> ID, Dénomination(client), Date, Secteur, Code Produit, Nom, Prix HT, Quantité, Prix total, CP, Ville
  const out = [];
  for (const r of rows){
    const dateStr = r[2], client = r[1], code = r[4], qty = r[7];
    const d = parseDMY(dateStr);
    if (d==null || !code) continue;
    const q = parseNum(qty);
    if (q<=0) continue;
    out.push({ date: d, client: client||'', codeRaw: code, qty: q });
  }
  return out;
}

// ---------- Parsing de l'onglet "Production" (recherche du tableau Produit/#BQ/.../ETH) ----------
function findHeaderRow(rows2D, mustContain){
  for (let i=0;i<rows2D.length;i++){
    const row = rows2D[i].map(c => String(c||'').trim().toLowerCase());
    const ok = mustContain.every(h => row.some(cell => cell === h.toLowerCase()));
    if (ok) return i;
  }
  return -1;
}
function colIndexOf(headerRow, name){
  for (let i=0;i<headerRow.length;i++){
    if (String(headerRow[i]||'').trim().toLowerCase() === name.toLowerCase()) return i;
  }
  return -1;
}

function parseProductionRows(rows2D, refSerial){
  // On cherche la ligne d'en-tête contenant Produit / #BQ / ETH — c'est le
  // tableau "file d'attente de production" avec la date de disponibilité (ETH).
  const headerIdx = findHeaderRow(rows2D, ['Produit', 'ETH']);
  if (headerIdx === -1) return { rows: [], headerFound: false };
  const header = rows2D[headerIdx];
  const colProduit = colIndexOf(header, 'Produit');
  let colBQ = colIndexOf(header, '#BQ');
  if (colBQ === -1) colBQ = colIndexOf(header, 'BQ');
  const colETH = colIndexOf(header, 'ETH');
  if (colProduit===-1 || colBQ===-1 || colETH===-1) return { rows: [], headerFound: false };

  const out = [];
  for (let i=headerIdx+1; i<rows2D.length; i++){
    const row = rows2D[i];
    if (!row || row.every(c => !c)) continue; // ligne vide -> on continue (le tableau peut avoir des trous)
    const produit = row[colProduit];
    if (!produit) continue;
    if (String(produit).trim() === 'Produit') break; // nouveau tableau qui recommence
    const qty = parseNum(row[colBQ]);
    const eth = parseFrenchLooseDate(row[colETH], refSerial);
    if (!eth || qty<=0) continue;
    out.push({ date: eth, codeRaw: produit, qty });
  }
  return { rows: out, headerFound: true };
}


// ---------- État global ----------
const WEEKS_TOTAL = 4; // nombre de semaines affichées (semaine en cours + suivantes)
const FORECAST_WEEKS_LOOKBACK = 8; // nb de semaines d'historique pour la moyenne par jour de semaine

let STATE = {
  productMap: new Map(),      // code ERP -> {codeMaj, nom, secteurMaj, ignore}
  productNames: new Map(),    // codeMaj -> nom lisible
  sales: [],                  // {date, client, codeRaw, qty}
  production: [],             // {date, codeRaw, qty}
  stockManuel: {},            // { varietyKey: qty } — stock au lundi de la semaine en cours
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
function weekList(){
  const start0 = mondayOfWeek(todaySerial());
  const weeks = [];
  for (let w=0; w<WEEKS_TOTAL; w++){
    weeks.push({ index: w, start: start0 + w*7 });
  }
  return weeks;
}
function sectionKeys(section){
  const seen = new Set(), out = [];
  for (const v of (MASTER_VARIETIES[section]||[])){
    if (seen.has(v.codeMaj)) continue;
    seen.add(v.codeMaj);
    out.push(v.codeMaj);
  }
  return out;
}
function allVarietyKeys(){
  const seen = new Set(), out = [];
  for (const sec of ['MICROPOUSSES','MICROXS','JP']){
    for (const k of sectionKeys(sec)){
      if (seen.has(k)) continue;
      seen.add(k); out.push(k);
    }
  }
  return out;
}

function rebuildVarieties(){
  STATE.varieties = new Map();
  STATE.unmappedCodes = new Set();

  for (const sec of ['MICROPOUSSES','MICROXS','JP']){
    for (const v of MASTER_VARIETIES[sec]){
      if (STATE.varieties.has(v.codeMaj)) continue;
      STATE.varieties.set(v.codeMaj, { nom: v.nom, section: sec, ventesParDate: new Map(), productionParDate: new Map() });
    }
  }
  const masterKeys = new Set(STATE.varieties.keys());

  for (const s of STATE.sales){
    const { key, unmapped } = normalizeToBase(s.codeRaw);
    if (!key) continue;
    if (!masterKeys.has(key)){
      if (unmapped) STATE.unmappedCodes.add(s.codeRaw.trim().toUpperCase());
      continue; // hors périmètre actuel (ex. fleurs) -> ignoré silencieusement
    }
    const v = STATE.varieties.get(key);
    v.ventesParDate.set(s.date, (v.ventesParDate.get(s.date)||0) + s.qty);
  }
  for (const p of STATE.production){
    const { key, unmapped } = normalizeToBase(p.codeRaw);
    if (!key) continue;
    if (!masterKeys.has(key)){
      if (unmapped) STATE.unmappedCodes.add(p.codeRaw.trim().toUpperCase());
      continue;
    }
    const v = STATE.varieties.get(key);
    v.productionParDate.set(p.date, (v.productionParDate.get(p.date)||0) + p.qty);
  }
}

// Prévision de vente pour une variété à une date donnée : moyenne des ventes
// observées le même jour de semaine sur les FORECAST_WEEKS_LOOKBACK dernières
// semaines. Si pas assez d'historique sur ce jour précis, on retombe sur la
// moyenne journalière générale des 30 derniers jours.
function forecastSaleForDate(v, dateSerial, refSerial){
  const targetDow = serialToDate(dateSerial).getUTCDay();
  const samples = [];
  for (let w=1; w<=FORECAST_WEEKS_LOOKBACK; w++){
    const d = dateSerial - 7*w;
    if (d >= refSerial) continue; // on ne regarde que le passé
    if (v.ventesParDate.has(d)) samples.push(v.ventesParDate.get(d));
  }
  if (samples.length >= 2){
    return samples.reduce((a,b)=>a+b,0) / samples.length;
  }
  // repli : moyenne générale des 30 derniers jours (jours réellement vendus, pour ne pas diluer par des jours fermés)
  let sum=0, n=0;
  for (let d=refSerial-30; d<refSerial; d++){
    if (v.ventesParDate.has(d)){ sum += v.ventesParDate.get(d); n++; }
  }
  if (n>0) return sum/n;
  return 0;
}

// Construit la projection jour par jour pour une variété, sur toute la
// période affichée (WEEKS_TOTAL semaines, à partir du lundi de la semaine en
// cours). Chaque jour : stock = stock(veille) + production du jour - vente du
// jour (réelle si déjà connue — y compris pour les jours déjà passés cette
// semaine —, sinon prévue).
const projectionCache = new Map();
function projectVarietyFull(key){
  if (projectionCache.has(key)) return projectionCache.get(key);
  const v = STATE.varieties.get(key);
  const refSerial = todaySerial();
  const weekStart = mondayOfWeek(refSerial);
  const totalDays = WEEKS_TOTAL * 7;
  const startStock = STATE.stockManuel[key] || 0;
  const days = [];
  let running = startStock;
  for (let i=0; i<totalDays; i++){
    const d = weekStart + i;
    const prod = v.productionParDate.get(d) || 0;
    let vente, venteReelle;
    if (d < refSerial){
      // jour déjà passé cette semaine : on affiche la vente réelle (0 si rien vendu)
      vente = v.ventesParDate.get(d) || 0; venteReelle = true;
    } else if (v.ventesParDate.has(d)){
      vente = v.ventesParDate.get(d); venteReelle = true;
    } else {
      vente = forecastSaleForDate(v, d, refSerial); venteReelle = false;
    }
    running = running + prod - vente;
    days.push({ date: d, stock: running, production: prod, vente, venteReelle });
  }
  const result = { startStock, weekStart, days };
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
    STATE.stockManuel = raw ? JSON.parse(raw) : {};
  }catch(e){
    console.error(e);
    STATE.stockManuel = {};
    logImport("Impossible de charger le stock sauvegardé (" + e.message + "). On repart avec les valeurs d'inventaire par défaut.");
  }
  // Pré-remplissage avec le dernier inventaire connu (onglet Prévisions Semis,
  // 01/09/2026) pour toute variété jamais encore saisie manuellement.
  for (const key of Object.keys(DEFAULT_STOCK)){
    if (!(key in STATE.stockManuel)) STATE.stockManuel[key] = DEFAULT_STOCK[key];
  }
}
async function savePersistedState(){
  try{
    await sheetsUpdateValues(APP_STATE_CONFIG.spreadsheetId, `'${APP_STATE_CONFIG.sheetTitle}'!A2:B2`,
      [['stockManuel', JSON.stringify(STATE.stockManuel)]]);
    logImport('Stock de départ sauvegardé.');
    return true;
  }catch(e){
    console.error(e);
    alert("Erreur de sauvegarde du stock (" + e.message + "). Vérifie ta connexion et tes droits d'accès au Sheet « Wesh Grow - App State ».");
    return false;
  }
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
    logImport('Chargement de la correspondance produits…');
    const prodAggRows = await sheetsGetValues(SALES_SHEET_CONFIG.spreadsheetId, SALES_SHEET_CONFIG.productAggregateRange);
    STATE.productMap = buildProductMap(prodAggRows);
    STATE.productNames = new Map();
    for (const [code, info] of STATE.productMap.entries()){
      if (!STATE.productNames.has(info.codeMaj)) STATE.productNames.set(info.codeMaj, info.nom);
    }

    logImport('Chargement des ventes (Order import)…');
    const salesRows = await sheetsGetValues(SALES_SHEET_CONFIG.spreadsheetId, SALES_SHEET_CONFIG.orderImportRange);
    STATE.sales = parseSalesRows(salesRows);
    logImport(`${STATE.sales.length} lignes de vente chargées.`);

    logImport('Chargement de la production à venir…');
    const prodRows = await sheetsGetValues(PRODUCTION_SHEET_CONFIG.spreadsheetId, PRODUCTION_SHEET_CONFIG.scanRange);
    const parsedProd = parseProductionRows(prodRows, todaySerial());
    STATE.production = parsedProd.rows;
    if (!parsedProd.headerFound){
      logImport("⚠️ Le tableau de production (colonnes Produit/#BQ/ETH) n'a pas été retrouvé dans l'onglet Production — vérifie que la mise en page n'a pas trop changé.");
    } else {
      logImport(`${STATE.production.length} lots de production avec date de disponibilité connue.`);
    }

    rebuildVarieties();
    projectionCache.clear();
    STATE.lastImportAt = new Date().toISOString();

    document.getElementById('headerMeta').innerHTML =
      `Dernière actualisation : <b>${new Date().toLocaleString('fr-FR')}</b>`;

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
let activeTab = 'week-0';
let stockDirty = {}; // key -> true si modifié pas encore sauvegardé

const SECTION_LABELS = { MICROPOUSSES: 'Micropousses', MICROXS: 'Micro XS', JP: 'Jeunes pousses' };

function stockCellClass(stock, avgSale){
  if (stock <= 0) return 'crit';
  if (avgSale > 0 && stock < avgSale * 2) return 'warn';
  if (avgSale === 0 && stock < 5) return 'warn';
  return 'ok';
}

function renderKPIs(){
  const refSerial = todaySerial();
  const keys = allVarietyKeys();
  let ruptureCount = 0;
  for (const k of keys){
    const proj = projectVarietyFull(k);
    if (proj.days.some(d => d.stock <= 0)) ruptureCount++;
  }
  const kpis = [
    { label: 'Variétés suivies', value: keys.length },
    { label: 'Lots de production à venir', value: STATE.production.length },
    { label: `Ruptures anticipées (${WEEKS_TOTAL} sem.)`, value: ruptureCount, danger: true },
    { label: 'Codes non reconnus', value: STATE.unmappedCodes.size, accent: STATE.unmappedCodes.size>0 }
  ];
  document.getElementById('kpis').innerHTML = kpis.map(k =>
    `<div class="kpi${k.danger?' danger':''}${k.accent?' accent':''}"><div class="label">${k.label}</div><div class="value">${k.value}</div></div>`
  ).join('');
}

function renderAlerts(){
  const keys = allVarietyKeys();
  const alerts = [];
  for (const k of keys){
    const proj = projectVarietyFull(k);
    const idx = proj.days.findIndex(d => d.stock <= 0);
    if (idx !== -1){
      const d = proj.days[idx];
      alerts.push({ key:k, nom: STATE.varieties.get(k).nom, date: d.date, daysUntil: idx });
    }
  }
  alerts.sort((a,b) => a.daysUntil - b.daysUntil);
  const panel = document.getElementById('alertPanel');
  const list = document.getElementById('alertList');
  if (alerts.length === 0){ panel.style.display = 'none'; return; }
  panel.style.display = 'block';
  list.innerHTML = alerts.map(a => {
    const cls = a.daysUntil <= 2 ? '' : ' warn';
    const when = a.daysUntil <= 0 ? "dès aujourd'hui" : `dans ${a.daysUntil} jour${a.daysUntil>1?'s':''} (${fmtDateShort(a.date)})`;
    return `<div class="alert-item${cls}"><span><b>${a.nom}</b> — rupture projetée ${when}</span></div>`;
  }).join('');
}

// Panneau compact pour saisir/ajuster le stock de départ (valable au lundi de
// la semaine en cours), groupé par format. Affiché au-dessus du tableau.
function renderStockEditor(){
  let inner = '';
  for (const sec of ['MICROPOUSSES','MICROXS','JP']){
    const keys = sectionKeys(sec);
    if (keys.length === 0) continue;
    inner += `<div class="cs-section-title" style="margin-top:10px;">${SECTION_LABELS[sec]}</div><div class="cs-list" style="gap:10px;">`;
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
        <p class="hint">Pré-rempli depuis le dernier inventaire connu. Ajuste puis clique « Enregistrer le stock de départ » en haut de la page pour sauvegarder.</p>
        ${inner}
      </details>
    </div>`;
}

function renderWeekTab(weekIndex){
  const weeks = weekList();
  const week = weeks[weekIndex];
  const refSerial = todaySerial();
  const days = [];
  for (let i=0;i<7;i++) days.push(week.start + i);

  const dayHeaders = days.map(d => {
    const isToday = d === refSerial;
    return `<th class="${isToday?'today':''}"><div class="day-head ${isToday?'today':''}"><span class="dow">${dowFr(d)}</span><span class="dm">${fmtDateShort(d)}</span></div></th>`;
  }).join('');

  let bodyRows = '';
  let totalVarieties = 0;
  for (const sec of ['MICROPOUSSES','MICROXS','JP']){
    const keys = sectionKeys(sec);
    if (keys.length === 0) continue;
    bodyRows += `<tr><td colspan="8" style="background:#F3F1E8;font-weight:700;color:var(--primary);text-align:left;padding:8px 10px;">${SECTION_LABELS[sec]}</td></tr>`;
    for (const key of keys){
      const v = STATE.varieties.get(key);
      if (!v) continue;
      totalVarieties++;
      const proj = projectVarietyFull(key);
      const avgSale = averageRecentDailySales(v, refSerial, 30);
      const weekDays = proj.days.slice(weekIndex*7, weekIndex*7+7);
      let cells = `<td class="variety-cell">${v.nom}<div class="cell-detail">moy. ${avgSale.toFixed(1)}/j</div></td>`;
      for (const day of weekDays){
        const cls = stockCellClass(day.stock, avgSale);
        const label = day.venteReelle ? 'vendu' : 'prévu';
        cells += `<td><span class="cell-stock ${cls}">${Math.round(day.stock)}</span><div class="cell-detail">+${Math.round(day.production)} / -${Math.round(day.vente)} (${label})</div></td>`;
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
            ${dayHeaders}
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
  let body = '';
  for (const r of rows){
    const { key, nom } = normalizeToBase(r.codeRaw);
    body += `<tr><td style="text-align:left;padding:8px 10px;">${fmtDateShort(r.date)} (${dowFr(r.date)})</td><td style="text-align:left;">${r.codeRaw}</td><td style="text-align:left;">${nom}</td><td>${Math.round(r.qty)}</td></tr>`;
  }
  return `
    <div class="grid-wrap">
      <table class="grid">
        <thead><tr><th class="variety-col">Date de dispo.</th><th style="text-align:left;">Code lot</th><th style="text-align:left;">Variété</th><th>Quantité</th></tr></thead>
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
  production: 'Tous les lots de production dont la date de disponibilité (ETH) est connue, triés par date.',
  nonmappe: "Codes produit rencontrés dans les ventes ou la production, mais qui n'ont pas de correspondance claire dans la table produit (hors fleurs, volontairement exclues)."
};

function buildTabsBar(){
  const weeks = weekList();
  let html = weeks.map((w,i) => {
    const label = i===0 ? 'Cette semaine' : `Semaine du ${fmtDateShort(w.start)}`;
    return `<button class="tab-btn${i===0?' active':''}" data-tab="week-${i}">${label}</button>`;
  }).join('');
  html += `<button class="tab-btn" data-tab="production">Production à venir</button>`;
  html += `<button class="tab-btn" data-tab="nonmappe">Codes non reconnus <span class="small" id="tabCountUnmapped"></span></button>`;
  document.getElementById('tabsBar').innerHTML = html;
}

function render(){
  renderKPIs();
  renderAlerts();
  const content = document.getElementById('tabContent');
  const tabDesc = document.getElementById('tabDesc');

  if (activeTab.startsWith('week-')){
    const idx = parseInt(activeTab.split('-')[1], 10);
    const weeks = weekList();
    const w = weeks[idx];
    tabDesc.textContent = `Stock projeté du ${fmtDateShort(w.start)} au ${fmtDateShort(w.start+6)} : stock de départ + production entrante − ventes (réelles si connues, sinon prévision).`;
    content.innerHTML = renderStockEditor() + renderWeekTab(idx);
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
    });
    inp.addEventListener('change', () => { render(); });
  });
}


// ---------- Wire up ----------
async function main(){
  const fu = document.getElementById('footerUser');
  if (fu) fu.textContent = CURRENT_USER || '';

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
