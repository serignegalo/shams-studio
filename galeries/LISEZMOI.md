# Galeries clients — Shams Studio

Espace client façon Pixieset, servi sur **shamstudio.site/galeries/**.
Les photos restent dans **Google Drive** : le site n'héberge rien d'autre que ces pages.

```
galeries/
  index.html          liste des galeries publiques
  galerie.html        une galerie (galerie.html?g=nom-de-la-galerie)
  galeries.css / .js  mise en forme et fonctionnement
  config.js           adresse du script Google (à renseigner)
  apps-script/Code.gs passerelle Google Drive (à coller dans Google Apps Script)
```

Tant que `config.js` est vide, le site affiche des **galeries de démonstration** faites avec les photos du portfolio.

---

## 1. Préparer Google Drive (une seule fois)

1. Dans Drive, créer un dossier **Shams Studio – Galeries**.
2. Ouvrir ce dossier : son identifiant est la fin de l'adresse
   `https://drive.google.com/drive/folders/`**`1AbC...xyz`** → le copier.

## 2. Installer la passerelle (une seule fois, environ 5 minutes)

1. Aller sur <https://script.google.com> → **Nouveau projet**, le nommer « Galeries Shams ».
2. Remplacer tout le contenu de `Code.gs` par celui de `apps-script/Code.gs`.
3. En haut du fichier, renseigner `RACINE_ID` (l'identifiant copié) et `EMAIL_STUDIO`
   (l'adresse qui recevra les sélections des clients).
4. À gauche, **Services +** → **Drive API** → Ajouter.
5. Choisir la fonction `autoriser` dans la liste → **Exécuter** → accepter les autorisations
   (« Google n'a pas validé cette application » → Paramètres avancés → Accéder au projet :
   c'est normal, c'est votre propre script).
6. **Déployer → Nouveau déploiement** → type **Application Web** :
   - Exécuter en tant que : **Moi**
   - Qui a accès : **Tout le monde**
7. Copier l'URL qui se termine par `/exec` et la coller dans `config.js` :
   ```js
   api: 'https://script.google.com/macros/s/AKfy.../exec',
   ```
8. Publier le site (commit + push) comme d'habitude.

> Si vous modifiez `Code.gs` plus tard : **Déployer → Gérer les déploiements → ✏️ → Version : Nouvelle version**.
> L'URL reste la même.

## 3. Créer une galerie pour un client (à chaque prestation)

1. Dans **Shams Studio – Galeries**, créer un dossier au nom de la galerie,
   ex. `Mariage Awa & Moussa`.
2. Y déposer les photos exportées (JPEG). Pour des onglets (Cérémonie, Soirée…),
   créer des sous-dossiers : chaque sous-dossier devient un onglet.
3. Facultatif : clic droit sur le dossier → **Informations sur le dossier** → **Description**,
   une ligne par réglage :
   ```
   date: 12/09/2026
   lieu: Dakar
   code: AWA2026
   visible: non
   couverture: IMG_0123.jpg
   ```
   | Réglage | Effet |
   |---|---|
   | `date` | affichée sous le titre, sert aussi à trier les galeries (JJ/MM/AAAA) |
   | `lieu` | affiché à côté de la date |
   | `code` | le client doit saisir ce code pour voir les photos |
   | `visible: non` | la galerie n'apparaît pas sur la page d'accueil (accès par lien uniquement) |
   | `telechargement: non` | masque les boutons de téléchargement |
   | `couverture` | nom du fichier utilisé en grand visuel (sinon la première photo) |
   | `lien` | adresse courte personnalisée (sinon tirée du nom du dossier) |
4. Envoyer au client le lien : `https://shamstudio.site/galeries/galerie.html?g=mariage-awa-et-moussa`
   (le nom du dossier en minuscules, sans accents, espaces remplacés par des tirets ;
   le plus simple est d'ouvrir la galerie depuis l'accueil et de copier l'adresse,
   ou d'utiliser le bouton **Partager**).

Les changements apparaissent sous **15 minutes** maximum. Pour un effet immédiat :
dans l'éditeur Apps Script, exécuter la fonction `viderCache`.

Un réglage ne semble pas pris en compte ? Exécuter la fonction `voirReglages` : le journal
affiche, pour chaque galerie, la description telle que Drive la fournit et les réglages compris.

### Vidéos

Les vidéos déposées dans le dossier (MP4, MOV…) apparaissent dans la grille avec une pastille dorée
« Vidéo · durée » et un bouton lecture ; elles se lisent dans le lecteur de Google Drive.
Juste après l'envoi, Drive peut mettre quelques minutes à préparer la vidéo avant qu'elle soit lisible.

## Ce que peut faire le client

- Parcourir les photos en grille, les ouvrir en plein écran (flèches du clavier, glisser au doigt).
- Télécharger une photo, ou **Tout télécharger** (ouvre le dossier Drive, bouton « Tout télécharger » → fichier ZIP).
- Ajouter des photos en **favoris** puis **Envoyer ma sélection** : vous recevez un e-mail
  avec la liste des fichiers, et un fichier `Sélection – Nom – date.txt` est créé dans le dossier
  de la galerie. Le client peut aussi envoyer la liste par WhatsApp.
- Partager la galerie (lien copié ou partage natif sur téléphone).

## Bon à savoir

- **Confidentialité** : le script partage chaque dossier de galerie « Tous les utilisateurs disposant
  du lien » pour que les images s'affichent. Les identifiants des photos ne sont transmis qu'après
  saisie du code, mais une personne qui reçoit le lien d'une photo peut l'ouvrir : le code protège
  la galerie, pas chaque fichier comme le ferait un coffre-fort.
- **Qualité** : la grille et la visionneuse chargent des versions allégées générées par Google ;
  le téléchargement donne le fichier original.
- **Taille** : exporter en JPEG haute qualité (≈ 3 000 px de large) garde la galerie rapide
  tout en offrant des tirages de qualité.
- **Quotas** : les quotas quotidiens d'Apps Script sont largement suffisants pour un studio,
  d'autant que le cache évite de relire Drive à chaque visite.
