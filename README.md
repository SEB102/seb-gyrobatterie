# SEB-GYROBATTERIE

Le téléphone sert de baguette : un coup sec **vers le sol** joue la **grosse caisse**, un coup **vers le plafond** la **cymbale**, quelle que soit la tenue du téléphone.
Le gyroscope est lu dans une page web sur le téléphone, les coups partent vers l'ordinateur qui joue les sons (synthétisés, aucun fichier audio). La vitesse du geste règle le volume.

## Version en ligne (recommandée) — tout ordinateur, tout téléphone

**Ordinateur** (Mac, Windows, Linux — Chrome, Edge, Firefox ou Safari) : ouvrir **https://seb102.github.io/seb-gyrobatterie/**. Rien à installer. Cliquer une fois dans la page pour activer le son.

**Téléphone** (iPhone ou Android) : scanner le QR code avec l'appareil photo. Aucun avertissement de sécurité. **L'ordinateur et les téléphones doivent être connectés au même réseau Wi-Fi.**
- iPhone : toucher « Toucher pour démarrer » puis autoriser « Mouvement ». Android : démarre tout seul.
- La première fois : **calibration guidée** : l'écran demande **2 coups secs vers le BAS, puis 2 vers le HAUT** (↓ ↓ ↑ ↑), en tenant le téléphone comme pour jouer. Elle recommence si les 4 coups ne sont pas tous nets.
- **Écran noir verrouillé** (bouton sur le téléphone) : écran entièrement noir, touchers ignorés, on continue de jouer ; **appui long de 2 s** pour revenir. L'écran reste allumé pendant le jeu.
- **« Voulez-vous fermer l'onglet ? » quand on agite le téléphone** : fonction « Secouer pour annuler » de l'iPhone, à couper dans **Réglages → Accessibilité → Toucher → Secouer pour annuler**.
- Pour la suite : ajouter la page à l'écran d'accueil (iPhone : Partager → « Sur l'écran d'accueil » ; Android : ⋮ → « Ajouter à l'écran d'accueil »). L'ordinateur garde le même code d'une fois sur l'autre, donc l'icône retrouve toujours le même ordinateur.

Il faut Internet au moment de la mise en relation (serveur public gratuit PeerJS) ; ensuite les coups passent directement d'un appareil à l'autre (WebRTC).

## Version locale — sans Internet (Mac ou Linux)

Double-clic sur `GYRO-BATTERIE.command` (sur le Bureau) : le serveur démarre et une fenêtre Chrome s'ouvre avec le son déjà actif. Fermer la fenêtre Terminal arrête tout. (Première fois : macOS peut refuser d'ouvrir le fichier → clic droit → Ouvrir.)

Le téléphone (même Wi-Fi) scanne le QR code puis accepte l'avertissement de certificat (iPhone : « Afficher les détails » → « visiter ce site web » ; Android : « Paramètres avancés » → « Continuer »).

Sans le raccourci : `node serveur.js` puis `http://localhost:8080`. Nécessite Node.js et `openssl` (présent sur Mac et Linux, pas sur Windows : sous Windows, utiliser la version en ligne).

## Calibration (sur le téléphone)

Les navigateurs ne nomment pas les axes de la même façon, certains anciens donnent des radians au lieu de degrés, et quelques téléphones n'ont pas de gyroscope (accéléromètre seul). Au premier lancement, la calibration guidée demande 2 coups vers le bas puis 2 vers le haut : elle apprend l'axe de rotation, la force d'un coup et quel sens de rotation veut dire « bas ». Bouton **Refaire la calibration** si on change franchement de prise en main.

- **Sensibilité** (0 à 100 %, **80 % par défaut**, 100 % = le geste le plus léger suffit) : réglable **uniquement sur le téléphone** ; l'ordinateur l'affiche (« Sensibilité du téléphone ») et le seuil apparaît en pointillés sur la trace.

Touches **B** et **H** sur l'ordinateur pour tester les sons sans téléphone.

## Plusieurs téléphones

La version à plusieurs téléphones, chacun avec ses sons, est devenue une app à part : [SEB-MULTIGYRO-BATTERIE](https://github.com/SEB102/seb-multigyro-batterie) (https://seb102.github.io/seb-multigyro-batterie/).

## Pourquoi pas le Bluetooth

Une page web ne peut pas émettre en Bluetooth (elle peut seulement se connecter à un appareil) : il faudrait une app native.

## Détection (`detecteur.js`)

Le coup part au sommet du geste (dès que la vitesse retombe), puis il faut revenir au calme pour réarmer. Le sens opposé est ignoré 180 ms après un coup, pour que le rebond du poignet ne compte pas comme un deuxième coup. Conséquence : un aller-retour en moins de 180 ms ne compte qu’une fois. Le sens vertical du geste choisit ensuite le son (voir « Grosse caisse en bas, cymbale en haut »).

## Certificat (version locale)

Créé au premier lancement (`cert.pem`, `cle.pem`, jamais publiés), recréé tout seul si l'adresse Wi-Fi change. Il respecte les règles Apple (825 jours maximum, usage serveur) : sans elles, l'iPhone refuse la page sans proposer de continuer.

## Déclenchement précoce

Case à cocher sur le téléphone : le coup part **dès que le geste dépasse le seuil**, au lieu d'attendre le sommet du geste. La force du coup est alors estimée d'après la vitesse et son accélération à cet instant (un peu moins fidèle). Le téléphone mesure à chaque coup le temps gagné et affiche la moyenne.

Mesures (navigateur, gestes simulés à 60 mesures/s) : environ **78 ms de gagnés** en moyenne (de 33 à 133 ms selon la vitesse du geste ; plus le geste est lent, plus le gain est grand). Désactivée par défaut : le mode « sommet » reste inchangé.

## Grosse caisse en bas, cymbale en haut

Un coup **vers le bas** joue la grosse caisse, un coup **vers le haut** la cymbale. C'est le **sens de rotation du poignet** qui décide : un coup vers le bas plie toujours le poignet de la même façon, même bras levé. La calibration guidée (2 coups vers le bas, puis 2 vers le haut) apprend quel sens de rotation veut dire « bas » sur ce téléphone et avec cette tenue.

Historique : une version précédente déduisait le sens de la gravité et d'un axe « baguette » appris. Sur un iPhone tenu debout dans la main (enregistrement du 21/10/2026), cet axe était presque vertical et la décision basculait toute seule au moindre mouvement (« tout devient grosse caisse ou cymbale » au bout de 20 à 30 s). Le sens de rotation, lui, reste juste même quand la tenue varie : vérifié en simulation jusqu'à 60° de rotation du téléphone dans la main et ±45° d'inclinaison, en mode « sommet » et « précoce ».

## Licence

SEB-GYROBATTERIE · Sébastien Gay · Octobre 2026 · [CC BY-NC 4.0](LICENSE) : partage et adaptation libres en citant l'auteur, sans usage commercial. PeerJS et qrcode-generator gardent leur licence MIT.

## Fichiers

- `index.html` : page ordinateur (son, pads, QR code, trace, sensibilité) · `telephone.html` : capteur, calibration, détection, envoi
- `liaison.js` : connexion téléphone → ordinateur, en ligne (WebRTC/PeerJS) ou locale (WebSocket), choisie selon l'adresse de la page (`?mode=local` / `?mode=enligne` pour forcer)
- `detecteur.js` : détection des coups et calibration · `sons.js` : synthèse
- `serveur.js` : serveur de la version locale (HTTPS téléphone + HTTP Mac + WebSocket, aucune dépendance npm)
- `LANCER GYRO-BATTERIE.command` : lanceur de la version locale (le fichier du Bureau en est un lien)
- `qrcode.js` (Kazuhiko Arase, MIT) · `peerjs.min.js` (PeerJS 1.5.5, MIT)
- `test.js` : `node test.js` (55 tests : détection, déclenchement précoce, sens 3D, baguette, calibration guidée et sens par rotation (dont vraies mesures d'iPhone), calibration dans 5 configurations de capteur, relais dans les deux sens, adresses, certificat)
