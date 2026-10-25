(() => {
  const CONFIG = window.GALERIES_CONFIG || {};
  const DEMO = !CONFIG.api;
  const page = document.body.dataset.page;

  /* ---------- Icônes ---------- */
  const ic = (d, extra = '') => `<svg viewBox="0 0 24 24" aria-hidden="true" ${extra}>${d}</svg>`;
  const ICONES = {
    coeur: ic('<path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 8 3.4 4.5 6.9 4.5c2.1 0 3.6 1.2 5.1 3 1.5-1.8 3-3 5.1-3 3.5 0 5.5 3.5 4.2 6.8-1.8 4.6-9.3 9.2-9.3 9.2Z"/>'),
    telecharger: ic('<path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 19.5h14"/>'),
    partager: ic('<path d="M8.6 10.7l6.8-3.9m-6.8 6.5 6.8 3.9"/><circle cx="18" cy="5.5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="18.5" r="2.5"/>'),
    fermer: ic('<path d="M6 6l12 12M18 6 6 18"/>'),
    gauche: ic('<path d="M15 5l-7 7 7 7"/>'),
    droite: ic('<path d="M9 5l7 7-7 7"/>'),
    cadenas: ic('<rect x="5" y="10.5" width="14" height="10" rx="1.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>'),
    envoyer: ic('<path d="M4 12 20 4l-4 16-4-7-8-1Z"/><path d="m12 13 8-9"/>')
  };

  /* ---------- Démonstration (photos du portfolio) ---------- */
  const DEMO_GALERIES = [
    {
      lien: 'mariage-awa-et-moussa', titre: 'Mariage Awa & Moussa', date: '12/09/2026', lieu: 'Dakar',
      couverture: 'photo_2026-06-24_16-21-36.jpg',
      ensembles: [
        { nom: 'Cérémonie', photos: ['photo_2026-06-24_16-21-36.jpg', 'photo_2026-06-24_16-21-49.jpg', 'photo_2026-06-24_16-23-10.jpg', '_MG_0223.jpg', 'mame_cheikh.jpg', '_MG_9770-Modifier.jpg', 'photo_2026-07-15_18-20-45.jpg'] },
        { nom: 'Portraits', photos: ['photo_2026-06-24_16-23-57.jpg', '_MG_9238-Modifier.jpg', '_MG_9290-Modifier.jpg', 'portrait.jpg', 'diokhane_heritier.jpeg'] }
      ]
    },
    {
      lien: 'genie-en-herbe-2026', titre: 'Génie en herbe 2026', date: '16/07/2026', lieu: 'Dakar',
      couverture: 'genie_en_herbe_3.jpg',
      ensembles: [
        { nom: 'Photos', photos: ['genie_en_herbe_1.jpg', 'genie_en_herbe_2.jpg', 'genie_en_herbe_3.jpg', 'genie_en_herbe_4.jpg', 'genie_en_herbe_5.jpg', 'genie_en_herbe_6.jpg', 'photo_2026-07-16_14-45-11.jpg', 'photo_2026-07-16_14-45-25.jpg', 'photo_2026-07-16_15-36-29.jpg', 'photo_2026-07-16_15-40-29.jpg', 'photo_2026-07-16_15-44-42.jpg', 'photo_2026-07-16_15-48-32.jpg'] }
      ]
    },
    {
      lien: 'seance-lifestyle-plage', titre: 'Séance lifestyle à la plage', date: '08/07/2026', lieu: 'Ngor',
      couverture: 'PG0A0229.jpg', code: 'SHAMS',
      ensembles: [
        { nom: 'Photos', photos: ['PG0A0143.jpg', 'PG0A0160.jpg', 'PG0A0186.jpg', 'PG0A0188.jpg', 'PG0A0202.jpg', 'PG0A0215.jpg', 'PG0A0229.jpg', 'PG0A0786.jpg', 'PG0A0819.jpg', 'PG0A0825.jpg', 'PG0A0841.jpg', 'PG0A1117.jpg', 'PG0A1135.jpg'] }
      ]
    },
    {
      lien: 'studio-portraits', titre: 'Portraits studio', date: '29/03/2026', lieu: 'Studio Shams',
      couverture: 'IMG_0730.jpg',
      ensembles: [
        { nom: 'Photos', photos: ['IMG_0694.jpg', 'IMG_0697.jpg', 'IMG_0730.jpg', 'IMG_0740.jpg', 'IMG_0789.jpg', 'photo_2026-03-29_21-01-12.jpg', 'photo_2026-03-29_21-02-44.jpg', 'photo_2026-03-29_21-02-45.jpg', 'joueur.jpg', 'joueur_1.jpg', 'joueur_2.jpg'] }
      ]
    }
  ];
  const demoPhoto = nom => ({ id: nom, nom, l: 0, h: 0 });

  /* ---------- Accès aux données ---------- */
  async function appel(params) {
    const url = CONFIG.api + '?' + new URLSearchParams(params);
    const rep = await fetch(url);
    if (!rep.ok) throw new Error('Serveur indisponible');
    const donnees = await rep.json();
    if (donnees.erreur && donnees.erreur !== 'Galerie introuvable') throw new Error(donnees.erreur);
    return donnees;
  }

  const api = {
    async collections() {
      if (!DEMO) return appel({ action: 'collections' });
      return DEMO_GALERIES.map(g => ({ lien: g.lien, titre: g.titre, date: g.date, lieu: g.lieu, protege: !!g.code, couverture: demoPhoto(g.couverture) }));
    },
    async galerie(lien, code) {
      if (!DEMO) return appel({ action: 'galerie', g: lien, code: code || '' });
      const g = DEMO_GALERIES.find(x => x.lien === lien);
      if (!g) return { erreur: 'Galerie introuvable' };
      const entete = { lien: g.lien, titre: g.titre, date: g.date, lieu: g.lieu, couverture: demoPhoto(g.couverture) };
      if (g.code && String(code || '').trim().toLowerCase() !== g.code.toLowerCase()) {
        return Object.assign(entete, { verrouille: true, codeFaux: !!code });
      }
      return Object.assign(entete, {
        telechargement: true, dossier: 'demo',
        ensembles: g.ensembles.map(e => ({ nom: e.nom, photos: e.photos.map(demoPhoto) }))
      });
    },
    async selection(donnees) {
      if (DEMO) return { ok: true };
      const rep = await fetch(CONFIG.api, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(donnees) });
      const r = await rep.json();
      if (r.erreur) throw new Error(r.erreur);
      return r;
    }
  };

  /* ---------- Adresses des images ---------- */
  const image = {
    url(p, largeur) {
      if (DEMO) return '../assets/img/gallery/' + encodeURIComponent(p.id);
      if (p.t) return `${p.t}=w${largeur}`;
      return `https://lh3.googleusercontent.com/d/${p.id}=w${largeur}`;
    },
    secours(p, largeur) {
      return `https://drive.google.com/thumbnail?id=${p.id}&sz=w${largeur}`;
    },
    // Largeur demandée à Google, arrondie pour profiter de son cache.
    // Au-delà de 1600 px, Google refuse souvent de redimensionner les gros originaux.
    TAILLES: [400, 800, 1200, 1600],
    largeurPour(pixels) {
      const voulu = pixels * (devicePixelRatio || 1);
      return image.TAILLES.find(l => l >= voulu) || 1600;
    },
    telechargement(p) {
      if (DEMO) return image.url(p);
      return `https://drive.google.com/uc?export=download&id=${p.id}`;
    }
  };

  // Google répond « 503 » si on lui demande trop d'images d'un coup : on les charge
  // par petits groupes, et on réessaie en cas de refus (en alternant avec la miniature
  // Drive et en descendant d'une taille à chaque échec, jusqu'à 800 px).
  const chargeur = (() => {
    const SIMULTANES = 4;
    const ESSAIS = 8;
    const file = [];
    const enCours = new WeakMap(); // img → tâche active (une nouvelle demande annule l'ancienne)
    let actifs = 0;

    function suivant() {
      while (actifs < SIMULTANES && file.length) {
        const t = file.shift();
        if (enCours.get(t.img) !== t) continue;
        actifs++;
        tenter(t);
      }
    }

    function tenter(t) {
      const { img, p, largeur } = t;
      t.enVol = true;
      const terminer = () => { if (!t.enVol) return false; t.enVol = false; actifs--; return true; };
      img.onload = () => {
        if (!terminer()) return;
        if (enCours.get(img) === t) { enCours.delete(img); t.ok?.(); }
        suivant();
      };
      img.onerror = () => {
        if (!terminer()) return;
        t.essai++;
        if (t.essai % 2 === 0 && t.largeur > 800) t.largeur = image.TAILLES[image.TAILLES.indexOf(t.largeur) - 1] || 800;
        if (enCours.get(img) === t && t.essai < ESSAIS) {
          setTimeout(() => { file.unshift(t); suivant(); }, 1000 * t.essai);
        }
        suivant();
      };
      img.src = t.essai % 2 ? image.secours(p, largeur) : image.url(p, largeur);
    }

    return {
      charger(img, p, largeur, { prioritaire = false, ok } = {}) {
        if (DEMO) {
          img.onload = ok || null;
          img.src = image.url(p, largeur);
          return;
        }
        const ancienne = enCours.get(img);
        if (ancienne?.enVol) { ancienne.enVol = false; actifs--; }
        img.referrerPolicy = 'no-referrer';
        const t = { img, p, largeur, essai: 0, ok };
        enCours.set(img, t);
        prioritaire ? file.unshift(t) : file.push(t);
        suivant();
      }
    };
  })();

  /* ---------- Outils ---------- */
  const $ = (sel, racine = document) => racine.querySelector(sel);
  const echapper = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  function dateLisible(d) {
    const m = String(d || '').match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    return m ? `${+m[1]} ${MOIS[+m[2] - 1]} ${m[3]}` : String(d || '');
  }
  const ligneInfos = g => [dateLisible(g.date), g.lieu].filter(Boolean).map(echapper).join(' · ');

  function lireStockage(cle, defaut, stockage = localStorage) {
    try { const v = stockage.getItem(cle); return v === null ? defaut : JSON.parse(v); } catch { return defaut; }
  }
  function ecrireStockage(cle, valeur, stockage = localStorage) {
    try { stockage.setItem(cle, JSON.stringify(valeur)); } catch { /* navigation privée */ }
  }

  let minuteurToast;
  function toast(texte) {
    let el = $('.toast');
    if (!el) { el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); document.body.append(el); }
    el.textContent = texte;
    el.classList.add('visible');
    clearTimeout(minuteurToast);
    minuteurToast = setTimeout(() => el.classList.remove('visible'), 2600);
  }

  function lienWhatsapp(texte) {
    return `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(texte)}`;
  }

  if (DEMO) {
    const bandeau = document.createElement('div');
    bandeau.className = 'bandeau-demo';
    bandeau.innerHTML = 'Mode démonstration — renseignez l’adresse Apps Script dans <code>config.js</code> pour afficher vos galeries Google Drive.';
    document.body.prepend(bandeau);
  }

  /* =========================================================
     Page d'accueil : liste des galeries
     ========================================================= */
  async function pageCollections() {
    const grille = $('#collections');
    try {
      const liste = await api.collections();
      if (!liste.length) {
        grille.innerHTML = '<p class="etat">Aucune galerie publique pour le moment.</p>';
        return;
      }
      grille.innerHTML = liste.map(g => `
        <a class="carte" href="galerie.html?g=${encodeURIComponent(g.lien)}">
          <div class="carte-image">
            ${g.couverture ? `<img alt="" decoding="async">` : ''}
            ${g.protege ? `<span class="carte-cadenas" title="Galerie protégée par un code">${ICONES.cadenas}</span>` : ''}
          </div>
          <h2>${echapper(g.titre)}</h2>
          <p>${ligneInfos(g)}</p>
        </a>`).join('');
      grille.querySelectorAll('.carte').forEach((carte, i) => {
        const img = carte.querySelector('img');
        if (img) chargeur.charger(img, liste[i].couverture, image.largeurPour(carte.offsetWidth || 400));
      });
    } catch (err) {
      grille.innerHTML = `<p class="etat">Impossible de charger les galeries pour le moment.<br><a href="${lienWhatsapp('Bonjour Shams Studio, je n’arrive pas à ouvrir les galeries.')}">Nous écrire sur WhatsApp</a></p>`;
    }
  }

  /* =========================================================
     Page galerie
     ========================================================= */
  async function pageGalerie() {
    const lien = new URLSearchParams(location.search).get('g');
    const cleCode = 'code_' + lien;
    const zone = $('#galerie');

    if (!lien) { location.replace('./'); return; }

    async function charger(code) {
      const g = await api.galerie(lien, code);
      if (g.erreur === 'Galerie introuvable') {
        zone.innerHTML = `<div class="introuvable"><h1>Galerie introuvable</h1><p>Le lien est peut-être incomplet ou la galerie a été retirée.</p><a class="btn btn-primary" href="./">Toutes les galeries</a></div>`;
        return;
      }
      document.title = g.titre + ' | Shams Studio';
      if (g.verrouille) {
        afficherVerrou(g);
      } else {
        if (code) ecrireStockage(cleCode, code, sessionStorage);
        afficherGalerie(g);
      }
    }

    function heros(g, contenu) {
      return `
        <section class="heros">
          <a class="retour" href="./" aria-label="Toutes les galeries"><img class="logo-clair" src="../assets/img/logo.png" alt="Shams Studio"></a>
          ${g.couverture ? `<img class="heros-image" alt="" fetchpriority="high">` : ''}
          <div class="heros-contenu">
            <p class="section-tag">${ligneInfos(g) || 'Shams Studio'}</p>
            <h1>${echapper(g.titre)}</h1>
            ${contenu}
          </div>
        </section>`;
    }

    function afficherVerrou(g) {
      zone.innerHTML = heros(g, `
        <form class="verrou" id="verrou">
          <label for="code">${ICONES.cadenas} Galerie privée : saisissez le code reçu</label>
          <div class="verrou-ligne">
            <input id="code" name="code" autocomplete="off" autocapitalize="characters" spellcheck="false" required placeholder="Code d’accès">
            <button class="btn btn-primary" type="submit">Ouvrir</button>
          </div>
          ${g.codeFaux ? '<p class="verrou-erreur" role="alert">Code incorrect, vérifiez et réessayez.</p>' : ''}
        </form>`);
      branchercouverture(g);
      $('#verrou').addEventListener('submit', async e => {
        e.preventDefault();
        const bouton = e.target.querySelector('button');
        bouton.disabled = true;
        bouton.textContent = '…';
        try { await charger($('#code').value); } catch (err) { erreur(err); }
      });
      $('#code').focus({ preventScroll: true });
    }

    function branchercouverture(g) {
      const img = $('.heros-image');
      if (img) chargeur.charger(img, g.couverture, image.largeurPour(innerWidth), { prioritaire: true });
    }

    function afficherGalerie(g) {
      const cleFavoris = 'favoris_' + g.lien;
      const favoris = new Set(lireStockage(cleFavoris, []));
      const toutes = g.ensembles.flatMap(e => e.photos);
      const parId = new Map(toutes.map(p => [p.id, p]));
      for (const id of favoris) if (!parId.has(id)) favoris.delete(id);
      let ongletActif = 0; // index d'ensemble, ou 'favoris'
      let affichees = [];

      zone.innerHTML = heros(g, `
          <p class="heros-compte">${toutes.length} photo${toutes.length > 1 ? 's' : ''}</p>
          <a class="btn btn-primary" href="#photos">Voir les photos</a>`) + `
        <div class="barre" id="barre">
          <div class="barre-interieur">
            <a class="barre-logo" href="./" aria-label="Toutes les galeries"><img class="logo-clair" src="../assets/img/logo.png" alt="Shams Studio"></a>
            <p class="barre-titre">${echapper(g.titre)}</p>
            <nav class="onglets" id="onglets" aria-label="Sections de la galerie"></nav>
            <div class="barre-actions">
              ${g.telechargement ? `<button class="bouton-icone" id="tout-telecharger" title="Tout télécharger">${ICONES.telecharger}<span>Tout télécharger</span></button>` : ''}
              <button class="bouton-icone" id="partager" title="Partager la galerie">${ICONES.partager}<span>Partager</span></button>
            </div>
          </div>
        </div>
        <section class="photos" id="photos" aria-live="polite"></section>
        <div class="selection" id="selection" hidden>
          <span id="selection-texte"></span>
          <button class="btn btn-primary" id="envoyer-selection">${ICONES.envoyer} Envoyer ma sélection</button>
        </div>`;
      branchercouverture(g);

      const onglets = $('#onglets');
      const conteneur = $('#photos');

      function dessinerOnglets() {
        const boutons = g.ensembles.length > 1 ? g.ensembles.map((e, i) => `<button data-onglet="${i}" aria-pressed="${ongletActif === i}">${echapper(e.nom)}<small>${e.photos.length}</small></button>`) : [];
        if (g.ensembles.length === 1) boutons.push(`<button data-onglet="0" aria-pressed="${ongletActif === 0}">Toutes<small>${toutes.length}</small></button>`);
        boutons.push(`<button data-onglet="favoris" class="onglet-favoris" aria-pressed="${ongletActif === 'favoris'}">${ICONES.coeur}Favoris<small>${favoris.size}</small></button>`);
        onglets.innerHTML = boutons.join('');
      }

      onglets.addEventListener('click', e => {
        const b = e.target.closest('button');
        if (!b) return;
        ongletActif = b.dataset.onglet === 'favoris' ? 'favoris' : Number(b.dataset.onglet);
        dessinerOnglets();
        dessinerPhotos();
        const haut = conteneur.getBoundingClientRect().top + scrollY - $('#barre').offsetHeight;
        if (scrollY > haut) scrollTo({ top: haut });
      });

      function dessinerPhotos() {
        affichees = ongletActif === 'favoris' ? toutes.filter(p => favoris.has(p.id)) : g.ensembles[ongletActif].photos;
        if (!affichees.length) {
          conteneur.innerHTML = `<p class="etat">${ongletActif === 'favoris' ? 'Touchez le cœur d’une photo pour l’ajouter à vos favoris, puis envoyez votre sélection au studio.' : 'Aucune photo dans cette section.'}</p>`;
          return;
        }
        conteneur.innerHTML = '';
        conteneur.append(...affichees.map((p, i) => vignette(p, i)));
        mettreEnPage();
        observateur.disconnect();
        conteneur.querySelectorAll('.vignette').forEach(fig => observateur.observe(fig));
      }

      // Une vignette n'est demandée qu'à l'approche de l'écran, à la taille où elle s'affiche
      const observateur = new IntersectionObserver(entrees => entrees.forEach(e => {
        if (!e.isIntersecting) return;
        observateur.unobserve(e.target);
        const fig = e.target;
        const p = parId.get(fig.dataset.id);
        const img = fig.querySelector('img');
        chargeur.charger(img, p, image.largeurPour(parseFloat(fig.style.width) || 300), {
          ok: () => {
            fig.classList.add('chargee');
            if (!p.l && img.naturalWidth) { p.l = img.naturalWidth; p.h = img.naturalHeight; relancerMiseEnPage(); }
          }
        });
      }), { rootMargin: '800px 0px' });

      function vignette(p, i) {
        const fig = document.createElement('figure');
        fig.className = 'vignette';
        fig.dataset.id = p.id;
        fig.innerHTML = `
          <button class="vignette-ouvrir" aria-label="Agrandir ${echapper(p.nom)}">
            <img alt="" decoding="async">
          </button>
          <div class="vignette-actions">
            <button class="bouton-coeur" aria-pressed="${favoris.has(p.id)}" aria-label="Favori">${ICONES.coeur}</button>
            ${g.telechargement ? `<a class="bouton-dl" href="${image.telechargement(p)}" download="${echapper(p.nom)}" aria-label="Télécharger">${ICONES.telecharger}</a>` : ''}
          </div>`;
        fig.querySelector('.vignette-ouvrir').addEventListener('click', () => lightbox.ouvrir(i));
        fig.querySelector('.bouton-coeur').addEventListener('click', () => basculerFavori(p.id));
        return fig;
      }

      // Grille « justifiée » : lignes de hauteur égale qui remplissent toute la largeur
      function mettreEnPage() {
        const figures = [...conteneur.querySelectorAll('.vignette')];
        if (!figures.length) return;
        const style = getComputedStyle(conteneur);
        // 1 px de marge : sans elle, les arrondis du navigateur font passer la dernière photo à la ligne
        const largeur = conteneur.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight) - 1;
        const ecart = largeur < 600 ? 4 : 8;
        const cible = largeur < 600 ? 150 : largeur < 1000 ? 220 : 290;
        let ligne = [];
        let somme = 0;
        const appliquer = (elements, hauteur) => elements.forEach(({ fig, ratio }) => {
          const l = ratio * hauteur;
          fig.style.width = l + 'px';
          fig.style.height = hauteur + 'px';
        });
        figures.forEach((fig, i) => {
          const p = affichees[i];
          const ratio = p.l && p.h ? p.l / p.h : 1.5;
          ligne.push({ fig, ratio });
          somme += ratio;
          if (somme * cible + ecart * (ligne.length - 1) >= largeur) {
            appliquer(ligne, (largeur - ecart * (ligne.length - 1)) / somme);
            ligne = []; somme = 0;
          }
        });
        if (ligne.length) appliquer(ligne, Math.min(cible, (largeur - ecart * (ligne.length - 1)) / somme));
        conteneur.style.setProperty('--ecart', ecart + 'px');
      }
      let attente;
      function relancerMiseEnPage() { cancelAnimationFrame(attente); attente = requestAnimationFrame(mettreEnPage); }
      new ResizeObserver(relancerMiseEnPage).observe(conteneur);

      function basculerFavori(id) {
        favoris.has(id) ? favoris.delete(id) : favoris.add(id);
        ecrireStockage(cleFavoris, [...favoris]);
        document.querySelectorAll(`.vignette[data-id="${CSS.escape(id)}"] .bouton-coeur`).forEach(b => b.setAttribute('aria-pressed', favoris.has(id)));
        lightbox.majCoeur();
        dessinerOnglets();
        majSelection();
        if (ongletActif === 'favoris' && !favoris.has(id) && !lightbox.ouverte()) dessinerPhotos();
      }

      function majSelection() {
        const n = favoris.size;
        $('#selection').hidden = n === 0;
        $('#selection-texte').textContent = `${n} favori${n > 1 ? 's' : ''}`;
      }

      /* ----- Visionneuse plein écran ----- */
      const lightbox = (() => {
        const el = document.createElement('div');
        el.className = 'lightbox';
        el.setAttribute('role', 'dialog');
        el.setAttribute('aria-modal', 'true');
        el.setAttribute('aria-label', 'Visionneuse');
        el.hidden = true;
        el.innerHTML = `
          <div class="lb-haut">
            <span class="lb-compteur" id="lb-compteur"></span>
            <div class="lb-actions">
              <button class="bouton-coeur" id="lb-coeur" aria-label="Favori">${ICONES.coeur}</button>
              ${g.telechargement ? `<a class="bouton-icone" id="lb-dl" aria-label="Télécharger" download>${ICONES.telecharger}</a>` : ''}
              <button class="bouton-icone" id="lb-fermer" aria-label="Fermer">${ICONES.fermer}</button>
            </div>
          </div>
          <div class="lb-scene"><img id="lb-img" alt=""></div>
          <button class="lb-nav lb-prec" id="lb-prec" aria-label="Photo précédente">${ICONES.gauche}</button>
          <button class="lb-nav lb-suiv" id="lb-suiv" aria-label="Photo suivante">${ICONES.droite}</button>`;
        document.body.append(el);
        const img = $('#lb-img', el);
        const largeurHD = () => image.largeurPour(innerWidth);
        let index = 0;
        let declencheur = null;

        function montrer() {
          const p = affichees[index];
          img.classList.remove('prete');
          chargeur.charger(img, p, largeurHD(), { prioritaire: true, ok: () => img.classList.add('prete') });
          img.alt = p.nom;
          $('#lb-compteur', el).textContent = `${index + 1} / ${affichees.length}`;
          const dl = $('#lb-dl', el);
          if (dl) { dl.href = image.telechargement(p); dl.setAttribute('download', p.nom); }
          majCoeur();
          [index + 1, index - 1].forEach(j => { const v = affichees[j]; if (v) chargeur.charger(new Image(), v, largeurHD()); });
        }

        function majCoeur() { if (!el.hidden) $('#lb-coeur', el).setAttribute('aria-pressed', favoris.has(affichees[index]?.id)); }
        function aller(pas) { if (affichees.length) { index = (index + pas + affichees.length) % affichees.length; montrer(); } }
        function ouvrir(i) {
          declencheur = document.activeElement;
          index = i; el.hidden = false; document.body.classList.add('sans-defilement');
          montrer(); $('#lb-fermer', el).focus();
        }
        function fermer() {
          el.hidden = true; document.body.classList.remove('sans-defilement');
          if (ongletActif === 'favoris') dessinerPhotos();
          declencheur?.focus?.();
        }

        $('#lb-prec', el).addEventListener('click', () => aller(-1));
        $('#lb-suiv', el).addEventListener('click', () => aller(1));
        $('#lb-fermer', el).addEventListener('click', fermer);
        $('#lb-coeur', el).addEventListener('click', () => basculerFavori(affichees[index].id));
        $('.lb-scene', el).addEventListener('click', e => { if (e.target === e.currentTarget) fermer(); });
        document.addEventListener('keydown', e => {
          if (el.hidden) return;
          if (e.key === 'Escape') fermer();
          else if (e.key === 'ArrowLeft') aller(-1);
          else if (e.key === 'ArrowRight') aller(1);
        });
        let depart = null;
        el.addEventListener('pointerdown', e => { depart = { x: e.clientX, y: e.clientY }; });
        el.addEventListener('pointerup', e => {
          if (!depart) return;
          const dx = e.clientX - depart.x, dy = e.clientY - depart.y;
          depart = null;
          if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) aller(dx < 0 ? 1 : -1);
        });
        return { ouvrir, majCoeur, ouverte: () => !el.hidden };
      })();

      /* ----- Actions ----- */
      $('#partager').addEventListener('click', async () => {
        const url = location.origin + location.pathname + '?g=' + encodeURIComponent(g.lien);
        if (navigator.share) {
          try { await navigator.share({ title: g.titre, text: 'Les photos de « ' + g.titre + ' » par Shams Studio', url }); } catch { /* annulé */ }
        } else {
          try { await navigator.clipboard.writeText(url); toast('Lien de la galerie copié'); } catch { prompt('Copiez ce lien :', url); }
        }
      });

      $('#tout-telecharger')?.addEventListener('click', () => {
        if (DEMO) { toast('En ligne, ce bouton ouvre le dossier Google Drive avec « Tout télécharger »'); return; }
        window.open(`https://drive.google.com/drive/folders/${g.dossier}`, '_blank', 'noopener');
        toast('Dans Google Drive, cliquez sur « Tout télécharger »');
      });

      $('#envoyer-selection').addEventListener('click', () => ouvrirEnvoi());

      function ouvrirEnvoi() {
        const noms = toutes.filter(p => favoris.has(p.id)).map(p => p.nom);
        const dlg = document.createElement('dialog');
        dlg.className = 'envoi';
        dlg.innerHTML = `
          <form method="dialog" id="form-envoi">
            <h2>Envoyer ma sélection</h2>
            <p>${noms.length} photo${noms.length > 1 ? 's' : ''} choisie${noms.length > 1 ? 's' : ''} dans « ${echapper(g.titre)} ». Le studio recevra la liste des fichiers.</p>
            <label>Votre nom<input name="nom" required autocomplete="name"></label>
            <label>Téléphone ou e-mail<input name="contact" autocomplete="tel"></label>
            <label>Message (facultatif)<textarea name="message" rows="3" placeholder="Ex. : ces photos pour l’album, celle-ci en grand format…"></textarea></label>
            <div class="envoi-actions">
              <button type="button" class="btn btn-outline" value="annuler">Annuler</button>
              <button type="submit" class="btn btn-primary">Envoyer</button>
            </div>
            <a class="envoi-wa" href="#">ou envoyer la liste par WhatsApp</a>
          </form>`;
        document.body.append(dlg);
        dlg.addEventListener('close', () => dlg.remove());
        dlg.querySelector('[value="annuler"]').addEventListener('click', () => dlg.close());
        const form = dlg.querySelector('form');
        dlg.querySelector('.envoi-wa').addEventListener('click', e => {
          e.preventDefault();
          const nom = form.nom.value.trim();
          window.open(lienWhatsapp(`Bonjour Shams Studio${nom ? ', c’est ' + nom : ''} ! Voici ma sélection pour « ${g.titre} » (${noms.length} photos) :\n${noms.join('\n')}`), '_blank', 'noopener');
          dlg.close();
        });
        form.addEventListener('submit', async e => {
          e.preventDefault();
          const bouton = form.querySelector('[type="submit"]');
          bouton.disabled = true; bouton.textContent = 'Envoi…';
          try {
            await api.selection({ g: g.lien, code: lireStockage(cleCode, '', sessionStorage), nom: form.nom.value.trim(), contact: form.contact.value.trim(), message: form.message.value.trim(), photos: noms });
            dlg.close();
            toast('Sélection envoyée, merci ! Le studio revient vers vous.');
          } catch (err) {
            bouton.disabled = false; bouton.textContent = 'Envoyer';
            toast('L’envoi a échoué : utilisez le lien WhatsApp.');
          }
        });
        dlg.showModal();
      }

      // La barre devient opaque une fois le grand visuel dépassé
      const barre = $('#barre');
      new IntersectionObserver(([e]) => barre.classList.toggle('collee', !e.isIntersecting), { rootMargin: '-1px 0px 0px 0px' })
        .observe($('.heros'));

      dessinerOnglets();
      dessinerPhotos();
      majSelection();
    }

    function erreur() {
      zone.innerHTML = `<div class="introuvable"><h1>Galerie momentanément indisponible</h1><p>Réessayez dans quelques instants.</p><a class="btn btn-primary" href="${lienWhatsapp('Bonjour Shams Studio, je n’arrive pas à ouvrir ma galerie : ' + location.href)}">Nous écrire sur WhatsApp</a></div>`;
    }

    try { await charger(lireStockage(cleCode, '', sessionStorage)); } catch (err) { erreur(err); }
  }

  if (page === 'collections') pageCollections();
  if (page === 'galerie') pageGalerie();
})();
