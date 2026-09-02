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
const HORIZON_DAYS = 14; // nombre de jours affichés à partir d'aujourd'hui
const FORECAST_WEEKS_LOOKBACK = 8; // nb de semaines d'historique pour la moyenne par jour de semaine

let STATE = {
  productMap: new Map(),      // code ERP -> {codeMaj, nom, secteurMaj, ignore}
  productNames: new Map(),    // codeMaj -> nom lisible
  sales: [],                  // {date, client, codeRaw, qty}
  production: [],             // {date, codeRaw, qty}
  stockManuel: {},            // { varietyKey: qty }
  varieties: new Map(),       // varietyKey -> { nom, ventesParDate: Map(date->qty), productionParDate: Map(date->qty) }
  unmappedCodes: new Set(),
  lastImportAt: null
};

function rebuildVarieties(){
  STATE.varieties = new Map();
  STATE.unmappedCodes = new Set();

  function getOrCreate(key, nom){
    if (!STATE.varieties.has(key)){
      STATE.varieties.set(key, { nom: nom || key, ventesParDate: new Map(), productionParDate: new Map() });
    }
    return STATE.varieties.get(key);
  }

  for (const s of STATE.sales){
    const { key, nom, unmapped } = normalizeToBase(s.codeRaw);
    if (!key) continue;
    if (unmapped) STATE.unmappedCodes.add(s.codeRaw.trim().toUpperCase());
    const v = getOrCreate(key, nom);
    v.ventesParDate.set(s.date, (v.ventesParDate.get(s.date)||0) + s.qty);
  }
  for (const p of STATE.production){
    const { key, nom, unmapped } = normalizeToBase(p.codeRaw);
    if (!key) continue;
    if (unmapped) STATE.unmappedCodes.add(p.codeRaw.trim().toUpperCase());
    const v = getOrCreate(key, nom);
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

// Construit la projection jour par jour pour une variété, sur HORIZON_DAYS
// jours à partir d'aujourd'hui. Chaque jour : stock = stock(veille) +
// production du jour - vente du jour (réelle si déjà connue, sinon prévue).
function projectVariety(key){
  const v = STATE.varieties.get(key);
  const refSerial = todaySerial();
  const startStock = STATE.stockManuel[key] || 0;
  const days = [];
  let running = startStock;
  for (let i=0; i<HORIZON_DAYS; i++){
    const d = refSerial + i;
    const prod = v.productionParDate.get(d) || 0;
    let vente, venteReelle;
    if (d < refSerial + 1 && v.ventesParDate.has(d)){
      vente = v.ventesParDate.get(d); venteReelle = true;
    } else if (d === refSerial && v.ventesParDate.has(d)){
      // aujourd'hui : si des ventes sont déjà enregistrées, on les prend en
      // compte telles quelles (elles remplacent la prévision du jour).
      vente = v.ventesParDate.get(d); venteReelle = true;
    } else {
      vente = forecastSaleForDate(v, d, refSerial); venteReelle = false;
    }
    running = running + prod - vente;
    days.push({ date: d, stock: running, production: prod, vente, venteReelle });
  }
  return { startStock, days };
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
    logImport("Impossible de charger le stock sauvegardé (" + e.message + "). On repart avec un stock à 0, à remplir manuellement.");
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
let activeTab = 'dispo';
let stockDirty = {}; // key -> true si modifié pas encore sauvegardé

function sortedVarietyKeys(){
  return [...STATE.varieties.keys()].sort((a,b) => {
    const na = STATE.varieties.get(a).nom, nb = STATE.varieties.get(b).nom;
    return na.localeCompare(nb, 'fr');
  });
}

function stockCellClass(stock, avgSale){
  if (stock <= 0) return 'crit';
  if (avgSale > 0 && stock < avgSale * 2) return 'warn';
  if (avgSale === 0 && stock < 5) return 'warn';
  return 'ok';
}

function renderKPIs(){
  const refSerial = todaySerial();
  const keys = sortedVarietyKeys();
  let ruptureCount = 0, warnCount = 0;
  for (const k of keys){
    const proj = projectVariety(k);
    const firstRupture = proj.days.find(d => d.stock <= 0);
    if (firstRupture) ruptureCount++;
  }
  const kpis = [
    { label: 'Variétés suivies', value: keys.length },
    { label: 'Lots de production à venir', value: STATE.production.length },
    { label: 'Ruptures anticipées (14j)', value: ruptureCount, danger: true },
    { label: 'Codes non reconnus', value: STATE.unmappedCodes.size, accent: STATE.unmappedCodes.size>0 }
  ];
  document.getElementById('kpis').innerHTML = kpis.map(k =>
    `<div class="kpi${k.danger?' danger':''}${k.accent?' accent':''}"><div class="label">${k.label}</div><div class="value">${k.value}</div></div>`
  ).join('');
}

function renderAlerts(){
  const keys = sortedVarietyKeys();
  const alerts = [];
  for (const k of keys){
    const proj = projectVariety(k);
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
    const when = a.daysUntil === 0 ? "dès aujourd'hui" : `dans ${a.daysUntil} jour${a.daysUntil>1?'s':''} (${fmtDateShort(a.date)})`;
    return `<div class="alert-item${cls}"><span><b>${a.nom}</b> — rupture projetée ${when}</span></div>`;
  }).join('');
}

function renderDispoTab(){
  const refSerial = todaySerial();
  const keys = sortedVarietyKeys();
  document.getElementById('tabCountDispo').textContent = `(${keys.length})`;

  if (keys.length === 0){
    return `<div class="empty-state"><h2>Aucune variété à afficher</h2><p>Actualise les données, ou vérifie que les ventes/production ont bien été chargées.</p></div>`;
  }

  const dayHeaders = [];
  for (let i=0;i<HORIZON_DAYS;i++){
    const d = refSerial + i;
    dayHeaders.push(`<th class="${i===0?'today':''}"><div class="day-head ${i===0?'today':''}"><span class="dow">${dowFr(d)}</span><span class="dm">${fmtDateShort(d)}</span></div></th>`);
  }

  let bodyRows = '';
  for (const k of keys){
    const v = STATE.varieties.get(k);
    const proj = projectVariety(k);
    const avgSale = averageRecentDailySales(v, refSerial, 30);
    const dirty = stockDirty[k] ? ' dirty' : '';
    let cells = `<td class="variety-cell">${v.nom}<div class="cell-detail">moy. ${avgSale.toFixed(1)}/j</div></td>`;
    cells += `<td><input type="number" class="stock-input${dirty}" data-key="${k}" value="${STATE.stockManuel[k]||0}" min="0"></td>`;
    for (const day of proj.days){
      const cls = stockCellClass(day.stock, avgSale);
      const stockRounded = Math.round(day.stock);
      const label = day.venteReelle ? 'vendu' : 'prévu';
      cells += `<td><span class="cell-stock ${cls}">${stockRounded}</span><div class="cell-detail">+${Math.round(day.production)} / -${Math.round(day.vente)} (${label})</div></td>`;
    }
    bodyRows += `<tr>${cells}</tr>`;
  }

  return `
    <div class="grid-wrap">
      <table class="grid">
        <thead>
          <tr>
            <th class="variety-col">Variété</th>
            <th>Stock départ</th>
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
  document.getElementById('tabCountUnmapped').textContent = `(${STATE.unmappedCodes.size})`;
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
  dispo: 'Stock projeté par variété, jour par jour : stock de départ + production entrante − ventes (réelles si connues, sinon prévision).',
  production: 'Tous les lots de production dont la date de disponibilité (ETH) est connue, triés par date.',
  nonmappe: "Codes produit rencontrés dans les ventes ou la production, mais qui n'ont pas de correspondance claire dans la table produit."
};

function render(){
  renderKPIs();
  renderAlerts();
  document.getElementById('tabDesc').textContent = TAB_DESCRIPTIONS[activeTab];
  const content = document.getElementById('tabContent');
  if (activeTab === 'dispo') content.innerHTML = renderDispoTab();
  else if (activeTab === 'production') content.innerHTML = renderProductionTab();
  else content.innerHTML = renderUnmappedTab();

  // Ré-attacher les listeners des inputs de stock
  content.querySelectorAll('.stock-input').forEach(inp => {
    inp.addEventListener('input', (e) => {
      const key = e.target.dataset.key;
      const val = parseFloat(e.target.value) || 0;
      STATE.stockManuel[key] = val;
      stockDirty[key] = true;
      e.target.classList.add('dirty');
      // recalcul léger : on ne rerend pas toute la grille pour éviter de perdre le focus,
      // mais on met à jour uniquement la ligne concernée à la prochaine action.
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
