# GYRO-BATTERIE

Le téléphone sert de baguette : coup sec **vers le bas = grosse caisse**, **vers le haut = cymbale**.
Le gyroscope est lu dans une page web sur le téléphone, les coups partent vers l'ordinateur qui joue les sons (synthétisés, aucun fichier audio). La vitesse du geste règle le volume.

## Version en ligne (recommandée) — tout ordinateur, tout téléphone

**Ordinateur** (Mac, Windows, Linux — Chrome, Edge, Firefox ou Safari) : ouvrir **https://seb102.github.io/gyro-batterie/**. Rien à installer. Cliquer une fois dans la page pour activer le son.

**Téléphone** (iPhone ou Android, Wi-Fi ou 4G/5G) : scanner le QR code avec l'appareil photo. Aucun avertissement de sécurité.
- iPhone : toucher « Toucher pour démarrer » puis autoriser « Mouvement ». Android : démarre tout seul.
- La première fois : **frapper 3 fois vers le bas** (calibration, voir plus bas), puis jouer.
- Pour la suite : ajouter la page à l'écran d'accueil (iPhone : Partager → « Sur l'écran d'accueil » ; Android : ⋮ → « Ajouter à l'écran d'accueil »). L'ordinateur garde le même code d'une fois sur l'autre, donc l'icône retrouve toujours le même ordinateur.

Il faut Internet au moment de la mise en relation (serveur public gratuit PeerJS) ; ensuite les coups passent directement d'un appareil à l'autre (WebRTC).

## Version locale — sans Internet (Mac ou Linux)

Double-clic sur `GYRO-BATTERIE.command` (sur le Bureau) : le serveur démarre et une fenêtre Chrome s'ouvre avec le son déjà actif. Fermer la fenêtre Terminal arrête tout. (Première fois : macOS peut refuser d'ouvrir le fichier → clic droit → Ouvrir.)

Le téléphone (même Wi-Fi) scanne le QR code puis accepte l'avertissement de certificat (iPhone : « Afficher les détails » → « visiter ce site web » ; Android : « Paramètres avancés » → « Continuer »).

Sans le raccourci : `node serveur.js` puis `http://localhost:8080`. Nécessite Node.js et `openssl` (présent sur Mac et Linux, pas sur Windows : sous Windows, utiliser la version en ligne).

## Calibration (sur le téléphone)

Les navigateurs ne nomment pas les axes de la même façon, certains anciens donnent des radians au lieu de degrés, et quelques téléphones n'ont pas de gyroscope (accéléromètre seul). Au premier lancement, la page demande donc 3 coups vers le bas et en déduit l'axe, le sens et l'échelle. Bouton **Recalibrer** si on change de prise en main.

- **Inverser haut / bas** si les sons sont échangés.
- **Sensibilité** : seuil de déclenchement ; il apparaît en pointillés sur la trace de l'ordinateur.

Touches **B** et **H** sur l'ordinateur pour tester les sons sans téléphone.

## Pourquoi pas le Bluetooth

Une page web ne peut pas émettre en Bluetooth (elle peut seulement se connecter à un appareil) : il faudrait une app native.

## Détection (`detecteur.js`)

Le coup part au sommet du geste (dès que la vitesse retombe), puis il faut revenir au calme pour réarmer. Le sens opposé est ignoré 180 ms après un coup, pour que le rebond du poignet après une grosse caisse ne déclenche pas une cymbale. Conséquence : grosse caisse puis cymbale à moins de 180 ms d'écart → seule la première sonne.

## Certificat (version locale)

Créé au premier lancement (`cert.pem`, `cle.pem`, jamais publiés), recréé tout seul si l'adresse Wi-Fi change. Il respecte les règles Apple (825 jours maximum, usage serveur) : sans elles, l'iPhone refuse la page sans proposer de continuer.

## Fichiers

- `index.html` : page ordinateur (son, pads, QR code, trace) · `telephone.html` : capteur, calibration, détection, envoi
- `liaison.js` : connexion téléphone → ordinateur, en ligne (WebRTC/PeerJS) ou locale (WebSocket), choisie selon l'adresse de la page (`?mode=local` / `?mode=enligne` pour forcer)
- `detecteur.js` : détection des coups et calibration · `sons.js` : synthèse
- `serveur.js` : serveur de la version locale (HTTPS téléphone + HTTP Mac + WebSocket, aucune dépendance npm)
- `LANCER GYRO-BATTERIE.command` : lanceur de la version locale (le fichier du Bureau en est un lien)
- `qrcode.js` (Kazuhiko Arase, MIT) · `peerjs.min.js` (PeerJS 1.5.5, MIT)
- `test.js` : `node test.js` (22 tests : détection, calibration dans 5 configurations de capteur, relais, adresses, certificat)
