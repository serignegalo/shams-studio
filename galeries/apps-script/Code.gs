/**
 * SHAMS STUDIO — Galeries clients : passerelle Google Drive
 *
 * À coller dans un projet Google Apps Script (script.google.com), puis :
 *   1. Services (+) → ajouter « Drive API » (identifiant : Drive, version v3)
 *   2. Renseigner RACINE_ID et EMAIL_STUDIO ci-dessous
 *   3. Exécuter une fois la fonction « autoriser » pour accepter les autorisations
 *   4. Déployer → Nouveau déploiement → Application Web
 *        Exécuter en tant que : Moi    |    Accès : Tout le monde
 *   5. Copier l'URL /exec dans galeries/config.js
 *
 * Organisation dans Drive :
 *   Shams Studio – Galeries/            ← dossier racine (RACINE_ID)
 *     Mariage Awa & Moussa/             ← une galerie = un dossier
 *       Cérémonie/  Soirée/             ← sous-dossiers = onglets (facultatif)
 *       IMG_0001.jpg ...                ← photos à la racine = onglet « Photos »
 *
 * Réglages d'une galerie : description du dossier (clic droit → Informations
 * sur le dossier → Description), une ligne par réglage, tous facultatifs :
 *   date: 12/09/2026
 *   lieu: Dakar
 *   code: AWA2026            → la galerie demande ce code
 *   visible: non             → absente de la page d'accueil (accès par lien)
 *   telechargement: non      → masque les boutons de téléchargement
 *   couverture: IMG_0123.jpg → photo de couverture (sinon la première)
 *   lien: awa-moussa         → adresse courte (sinon tirée du nom du dossier)
 */

const RACINE_ID = 'COLLER_ICI_L_ID_DU_DOSSIER_RACINE';
const EMAIL_STUDIO = 'COLLER_ICI_VOTRE_EMAIL';
const DUREE_CACHE = 15 * 60; // secondes : délai max avant qu'un ajout dans Drive apparaisse

const TYPES_IMAGE = "(mimeType contains 'image/')";
const TYPES_MEDIAS = "(mimeType contains 'image/' or mimeType contains 'video/')";
const TYPE_DOSSIER = "mimeType = 'application/vnd.google-apps.folder'";

function doGet(e) {
  const p = e.parameter || {};
  try {
    if (p.action === 'collections') return json(listerCollections());
    if (p.action === 'galerie') return json(ouvrirGalerie(p.g, p.code));
    return json({ erreur: 'Action inconnue' });
  } catch (err) {
    return json({ erreur: String(err.message || err) });
  }
}

// Envoi d'une sélection de favoris (POST en text/plain pour éviter le pré-vol CORS)
function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    const g = trouverGalerie(d.g);
    if (!g) return json({ erreur: 'Galerie introuvable' });
    if (g.reglages.code && !codeValide(g.reglages.code, d.code)) return json({ erreur: 'Code invalide' });
    const photos = (d.photos || []).map(String).slice(0, 2000);
    const nom = String(d.nom || 'Client').slice(0, 120);
    const texte = [
      'Galerie : ' + g.titre,
      'Client : ' + nom,
      d.contact ? 'Contact : ' + String(d.contact).slice(0, 200) : '',
      d.message ? '\nMessage :\n' + String(d.message).slice(0, 2000) : '',
      '\n' + photos.length + ' photo(s) sélectionnée(s) :',
      photos.join('\n')
    ].filter(Boolean).join('\n');
    DriveApp.getFolderById(g.id).createFile('Sélection – ' + nom + ' – ' + horodatage() + '.txt', texte);
    if (EMAIL_STUDIO.indexOf('@') > 0) {
      MailApp.sendEmail(EMAIL_STUDIO, 'Sélection photos – ' + g.titre + ' – ' + nom, texte);
    }
    return json({ ok: true });
  } catch (err) {
    return json({ erreur: String(err.message || err) });
  }
}

/* ---------- Collections ---------- */

function listerCollections() {
  return lireCache('collections', () => {
    return dossiersGalerie()
      .filter(g => g.reglages.visible !== 'non')
      .map(g => ({
        lien: g.lien,
        titre: g.titre,
        date: g.reglages.date || '',
        lieu: g.reglages.lieu || '',
        protege: !!g.reglages.code,
        couverture: couvertureDe(g)
      }));
  });
}

function ouvrirGalerie(lien, code) {
  const g = trouverGalerie(lien);
  if (!g) return { erreur: 'Galerie introuvable' };
  const entete = {
    lien: g.lien,
    titre: g.titre,
    date: g.reglages.date || '',
    lieu: g.reglages.lieu || '',
    couverture: couvertureDe(g)
  };
  if (g.reglages.code && !codeValide(g.reglages.code, code)) {
    entete.verrouille = true;
    if (code) entete.codeFaux = true;
    return entete;
  }
  const contenu = lireCache('contenu_' + g.id, () => {
    partagerParLien(g.id);
    const ensembles = [];
    const racine = lister(g.id, TYPES_MEDIAS).map(photo);
    if (racine.length) ensembles.push({ nom: 'Photos', photos: racine });
    lister(g.id, TYPE_DOSSIER).forEach(sous => {
      const photos = lister(sous.id, TYPES_MEDIAS).map(photo);
      if (photos.length) ensembles.push({ nom: sous.name, photos: photos });
    });
    return { ensembles: ensembles, dossier: g.id };
  });
  entete.ensembles = contenu.ensembles;
  entete.telechargement = g.reglages.telechargement !== 'non';
  if (entete.telechargement) entete.dossier = contenu.dossier;
  return entete;
}

/* ---------- Drive ---------- */

function dossiersGalerie() {
  return lireCache('dossiers', () => {
    return lister(RACINE_ID, TYPE_DOSSIER, 'id,name,description,createdTime').map(f => {
      const reglages = lireReglages(f.description);
      return {
        id: f.id,
        titre: f.name,
        lien: reglages.lien ? slug(reglages.lien) : slug(f.name),
        reglages: reglages,
        cree: f.createdTime
      };
    }).sort((a, b) => cleDate(b) - cleDate(a));
  });
}

function trouverGalerie(lien) {
  if (!lien) return null;
  return dossiersGalerie().filter(g => g.lien === lien)[0] || null;
}

function couvertureDe(g) {
  return lireCache('couv_' + g.id, () => {
    const voulu = (g.reglages.couverture || '').toLowerCase();
    let photos = lister(g.id, TYPES_IMAGE);
    if (!photos.length) {
      const sous = lister(g.id, TYPE_DOSSIER)[0];
      if (sous) photos = lister(sous.id, TYPES_IMAGE);
    }
    const choisie = photos.filter(f => f.name.toLowerCase() === voulu)[0] || photos[0];
    if (!choisie) return null;
    partagerParLien(g.id);
    return photo(choisie);
  });
}

function lister(parentId, filtre, champs) {
  const resultats = [];
  let jeton;
  do {
    const page = Drive.Files.list({
      q: "'" + parentId + "' in parents and trashed = false and " + filtre,
      fields: 'nextPageToken, files(' + (champs || 'id,name,mimeType,thumbnailLink,imageMediaMetadata(width,height,rotation),videoMediaMetadata(width,height,durationMillis)') + ')',
      orderBy: 'name_natural',
      pageSize: 1000,
      pageToken: jeton
    });
    Array.prototype.push.apply(resultats, page.files || []);
    jeton = page.nextPageToken;
  } while (jeton);
  return resultats;
}

function photo(f) {
  const m = f.imageMediaMetadata || {};
  const tourne = m.rotation === 1 || m.rotation === 3;
  // thumbnailLink : adresse signée des serveurs d'images Google (valable quelques heures,
  // bien plus que le cache), redimensionnable en remplaçant le suffixe « =s220 »
  const vignette = String(f.thumbnailLink || '').replace(/=s\d+$/, '');
  if (String(f.mimeType).indexOf('video/') === 0) {
    const v = f.videoMediaMetadata || {};
    return { id: f.id, nom: f.name, t: vignette, l: v.width || 0, h: v.height || 0, video: true, duree: Math.round((Number(v.durationMillis) || 0) / 1000) };
  }
  return { id: f.id, nom: f.name, t: vignette, l: (tourne ? m.height : m.width) || 0, h: (tourne ? m.width : m.height) || 0 };
}

// Les fichiers héritent du partage du dossier : les miniatures deviennent affichables
// pour les visiteurs, mais leurs identifiants ne sont révélés qu'une fois le code saisi.
function partagerParLien(dossierId) {
  const dossier = DriveApp.getFolderById(dossierId);
  if (dossier.getSharingAccess() !== DriveApp.Access.ANYONE_WITH_LINK) {
    dossier.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  }
}

/* ---------- Outils ---------- */

// L'éditeur de description de Drive enregistre du HTML (« <br /> » pour un retour à la ligne)
function texteBrut(description) {
  return String(description || '')
    .replace(/<br\s*\/?>|<\/(p|div|li)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
}

function lireReglages(description) {
  const r = {};
  texteBrut(description).split(/\r?\n/).forEach(ligne => {
    const m = ligne.match(/^\s*([a-zA-Zéèê]+)\s*:\s*(.+?)\s*$/);
    if (m) r[sansAccent(m[1].toLowerCase())] = m[2];
  });
  if (r.visible) r.visible = sansAccent(r.visible.toLowerCase());
  if (r.telechargement) r.telechargement = sansAccent(r.telechargement.toLowerCase());
  return r;
}

function codeValide(attendu, saisi) {
  return String(saisi || '').trim().toLowerCase() === String(attendu).trim().toLowerCase();
}

function cleDate(g) {
  const m = String(g.reglages.date || '').match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  return m ? new Date(+m[3], +m[2] - 1, +m[1]).getTime() : new Date(g.cree).getTime();
}

function slug(texte) {
  return sansAccent(String(texte).toLowerCase()).replace(/&/g, ' et ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function sansAccent(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function horodatage() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH-mm');
}

function json(objet) {
  return ContentService.createTextOutput(JSON.stringify(objet)).setMimeType(ContentService.MimeType.JSON);
}

// Cache découpé en morceaux : une valeur de CacheService est limitée à 100 Ko
function lireCache(cle, calculer) {
  const cache = CacheService.getScriptCache();
  const nb = Number(cache.get(cle + '_n'));
  if (nb) {
    const morceaux = cache.getAll(Array.from({ length: nb }, (_, i) => cle + '_' + i));
    const texte = Array.from({ length: nb }, (_, i) => morceaux[cle + '_' + i]).join('');
    if (Object.keys(morceaux).length === nb) return JSON.parse(texte);
  }
  const valeur = calculer();
  const texte = JSON.stringify(valeur);
  const taille = 90000;
  const aEcrire = {};
  let i = 0;
  for (; i * taille < texte.length; i++) aEcrire[cle + '_' + i] = texte.substr(i * taille, taille);
  aEcrire[cle + '_n'] = String(i);
  try { cache.putAll(aEcrire, DUREE_CACHE); } catch (err) { /* galerie trop grande pour le cache : servie sans */ }
  return valeur;
}

/* ---------- À lancer depuis l'éditeur ---------- */

// Première exécution : déclenche la demande d'autorisations Google
function autoriser() {
  Logger.log('Racine : ' + DriveApp.getFolderById(RACINE_ID).getName());
  Logger.log(JSON.stringify(listerCollections(), null, 1));
}

// Pour voir immédiatement un changement fait dans Drive (sinon : 15 minutes max)
function viderCache() {
  const cache = CacheService.getScriptCache();
  const cles = ['collections', 'dossiers'];
  lister(RACINE_ID, TYPE_DOSSIER, 'id').forEach(f => cles.push('contenu_' + f.id, 'couv_' + f.id));
  cles.forEach(c => {
    const nb = Number(cache.get(c + '_n')) || 0;
    cache.removeAll([c + '_n'].concat(Array.from({ length: nb }, (_, i) => c + '_' + i)));
  });
  Logger.log('Cache vidé');
}

// Affiche, pour chaque galerie, la description brute et les réglages compris par le script
function voirReglages() {
  lister(RACINE_ID, TYPE_DOSSIER, 'id,name,description').forEach(f => {
    Logger.log(f.name + '\n  brut : ' + JSON.stringify(f.description || '') + '\n  compris : ' + JSON.stringify(lireReglages(f.description)));
  });
}
