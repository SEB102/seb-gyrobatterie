# SEB-GYROBATTERIE

Le téléphone sert de baguette et apprend 4 gestes : coup **vers le bas** → **grosse caisse**, **vers le haut** → **cymbale**, **vers la droite** → **caisse claire**, **vers la gauche** → **« Oh ! »**.
Le gyroscope est lu dans une page web sur le téléphone, qui reconnaît le geste ; l'ordinateur joue les sons (synthétisés, aucun fichier audio). La vitesse du geste règle le volume.

## Version en ligne (recommandée) — tout ordinateur, tout téléphone

**Ordinateur** (Mac, Windows, Linux — Chrome, Edge, Firefox ou Safari) : ouvrir **https://seb102.github.io/seb-gyrobatterie/**. Rien à installer. Cliquer une fois dans la page pour activer le son.

**Téléphone** (iPhone ou Android) : scanner le QR code avec l'appareil photo. Aucun avertissement de sécurité. **L'ordinateur et les téléphones doivent être connectés au même réseau Wi-Fi.**
- iPhone : toucher « Toucher pour démarrer » puis autoriser « Mouvement ». Android : démarre tout seul.
- La première fois : **apprentissage des 4 gestes** (15 coups de chacun) ; **l'ordinateur bipe** pour guider (le téléphone ne joue aucun son). Voir « Les 4 gestes ».
- **Écran noir verrouillé** (bouton sur le téléphone) : écran entièrement noir, touchers ignorés, on continue de jouer ; **appui long de 2 s** pour revenir. L'écran reste allumé pendant le jeu.
- **« Voulez-vous fermer l'onglet ? » quand on agite le téléphone** : fonction « Secouer pour annuler » de l'iPhone, à couper dans **Réglages → Accessibilité → Toucher → Secouer pour annuler**.
- Pour la suite : ajouter la page à l'écran d'accueil (iPhone : Partager → « Sur l'écran d'accueil » ; Android : ⋮ → « Ajouter à l'écran d'accueil »). L'ordinateur garde le même code d'une fois sur l'autre, donc l'icône retrouve toujours le même ordinateur.

Il faut Internet au moment de la mise en relation (serveur public gratuit PeerJS) ; ensuite les coups passent directement d'un appareil à l'autre (WebRTC).

## Version locale — sans Internet (Mac ou Linux)

Double-clic sur `GYRO-BATTERIE.command` (sur le Bureau) : le serveur démarre et une fenêtre Chrome s'ouvre avec le son déjà actif. Fermer la fenêtre Terminal arrête tout. (Première fois : macOS peut refuser d'ouvrir le fichier → clic droit → Ouvrir.)

Le téléphone (même Wi-Fi) scanne le QR code puis accepte l'avertissement de certificat (iPhone : « Afficher les détails » → « visiter ce site web » ; Android : « Paramètres avancés » → « Continuer »).

Sans le raccourci : `node serveur.js` puis `http://localhost:8080`. Nécessite Node.js et `openssl` (présent sur Mac et Linux, pas sur Windows : sous Windows, utiliser la version en ligne).

## Réglages

- **Sensibilité** (0 à 100 %, **80 % par défaut**, 100 % = le geste le plus léger suffit) : réglable **uniquement sur le téléphone** ; l'ordinateur l'affiche (« Sensibilité du téléphone ») et le seuil apparaît en pointillés sur la trace (vitesse de rotation, tous axes).

Touches **B**, **H**, **D** et **G** sur l'ordinateur (bas, haut, droite, gauche) pour tester les sons sans téléphone.

## Plusieurs téléphones

La version à plusieurs téléphones, chacun avec ses sons, est devenue une app à part : [SEB-MULTIGYRO-BATTERIE](https://github.com/SEB102/seb-multigyro-batterie) (https://seb102.github.io/seb-multigyro-batterie/).

## Pourquoi pas le Bluetooth

Une page web ne peut pas émettre en Bluetooth (elle peut seulement se connecter à un appareil) : il faudrait une app native.

## Certificat (version locale)

Créé au premier lancement (`cert.pem`, `cle.pem`, jamais publiés), recréé tout seul si l'adresse Wi-Fi change. Il respecte les règles Apple (825 jours maximum, usage serveur) : sans elles, l'iPhone refuse la page sans proposer de continuer.

## Déclenchement précoce (toujours actif)

Le coup part **dès que le geste dépasse le seuil**, sans attendre le sommet du geste : environ **78 ms de gagnés** en moyenne (de 33 à 133 ms selon la vitesse du geste ; mesuré dans le navigateur à 60 mesures/s). Ce n'est plus une option : c'est le seul mode, depuis le 21/10/2026. La force du coup est estimée d'après la vitesse et son accélération à cet instant.

## Les 4 gestes (depuis le 21/10/2026)

Le téléphone apprend **4 gestes** : coup **vers le bas**, **vers le haut**, **vers la droite**, **vers la gauche** (grosse caisse, cymbale, caisse claire, « Oh ! »).

- **Apprentissage** (environ 1 min 30, au premier démarrage, puis bouton « Réapprendre mes gestes ») : 15 coups de chaque geste (10 jusqu'au 21/10/2026 ; 15 réduisent les erreurs d'environ deux tiers en simulation), guidés à l'écran et **au son** joués par l'ordinateur : 1 bip l'écoute commence · un petit bip aigu à chaque coup compté · 2 bips geste enregistré · 3 bips montants terminé. Seuls les coups dans le sens du geste comptent : le retour du poignet n'est ni compté ni appris, et un coup qui déborde sur le geste suivant est ignoré. Les gestes appris restent dans le téléphone et servent aux trois apps (SEB-GYROBATTERIE, SEB-MULTIGYRO-BATTERIE, SEB-SOLOGYRO-BATTERIE).
- **Détection** : sur la vitesse de rotation de tous les axes ; le coup part dès que le seuil est franchi. Un coup est fini dès que la rotation retombe sous le tiers de son sommet (pause minimale 80 ms) ; le rebond du poignet, plus faible et en sens inverse, ne compte pas. Un geste qui ralentit au milieu puis repart dans le même sens (à moins de 45°) sans retour du poignet entre les deux ne compte qu'une fois. Tous les coups détectés jusqu'à 6 par seconde, environ 97 % à 8 par seconde.
- **Reconnaissance** : la forme de la rotation et de l'accélération est comparée aux exemples appris (plus proches voisins, `gestes.js`). Le retour du poignet après un coup vers la droite est un mouvement vers la gauche : il joue le son de la gauche.
- **Attente avant de jouer** : le téléphone affiche la précision obtenue sur tes propres exemples pour 0, 30, 60 et 100 ms, choisit la plus courte qui atteint 95 %, et on peut changer (plus longue = mieux reconnu, mais le son arrive plus tard).
- **Prise en main** : garder la même qu'à l'apprentissage ; varier les coups pendant l'apprentissage (forts, doux, bras haut, bras bas) si on les varie en jouant.
- **Gyroscope obligatoire** : un téléphone sans gyroscope (accéléromètre seul, rare) ne peut plus jouer, l'écran le signale.
- Mesuré sur des gestes simulés : 97 % de gestes reconnus avec 30 ms d'attente ; apprentissage avec des retours aussi rapides que le coup : 40 exemples justes, retours tous écartés. Tests : `node test-gestes.js`.

Historique : jusqu'au 21/10/2026, une calibration de 4 coups (2 vers le haut, 2 vers le bas) apprenait le sens de rotation du poignet, pour 2 sons seulement (grosse caisse en bas, cymbale en haut). Les 4 gestes appris ont d'abord été essayés dans un prototype de SEB-SOLOGYRO-BATTERIE.

## Licence

SEB-GYROBATTERIE · Sébastien Gay · Octobre 2026 · [CC BY-NC 4.0](LICENSE) : partage et adaptation libres en citant l'auteur, sans usage commercial. PeerJS et qrcode-generator gardent leur licence MIT.

## Fichiers

- `index.html` : page ordinateur (sons, bips, 4 pavés, QR code, trace, sensibilité) · `telephone.html` : capteur, apprentissage, reconnaissance, envoi
- `gestes.js` : détection et reconnaissance des gestes · `apprentissage.js` : apprentissage guidé · `jeu-gestes.js` : écran du téléphone (apprentissage, attente, jeu), communs aux trois apps
- `liaison.js` : connexion téléphone → ordinateur, en ligne (WebRTC/PeerJS) ou locale (WebSocket), choisie selon l'adresse de la page (`?mode=local` / `?mode=enligne` pour forcer)
- `detecteur.js` : réglage de sensibilité (et l'ancienne détection, gardée pour ses tests) · `sons.js` : synthèse
- `serveur.js` : serveur de la version locale (HTTPS téléphone + HTTP Mac + WebSocket, aucune dépendance npm)
- `LANCER GYRO-BATTERIE.command` : lanceur de la version locale (le fichier du Bureau en est un lien)
- `qrcode.js` (Kazuhiko Arase, MIT) · `peerjs.min.js` (PeerJS 1.5.5, MIT)
- `test-gestes.js` : `node test-gestes.js` (10 tests : détection, reconnaissance, apprentissage) · `test.js` : `node test.js` (56 tests, ancienne détection, serveur et certificat : détection, déclenchement précoce, sens 3D, baguette, calibration guidée et sens par rotation (dont vraies mesures d'iPhone), calibration dans 5 configurations de capteur, relais dans les deux sens, adresses, certificat)
