// Liaison téléphone → ordinateur, deux modes :
// - local : WebSocket via serveur.js (page ouverte en localhost ou par l'adresse IP du Mac)
// - en ligne : WebRTC direct entre les deux appareils, mis en relation par le serveur public PeerJS
//   (pages hébergées en https avec un vrai certificat : aucun avertissement)
// Forcer un mode : ajouter ?mode=local ou ?mode=enligne à l'adresse.
(function (racine) {
  const PREFIXE = 'gyrobat-';
  const memoire = {
    lire(k) { try { return localStorage.getItem(k); } catch { return null; } },
    ecrire(k, v) { try { localStorage.setItem(k, v); } catch {} },
  };

  function modeEnLigne() {
    const force = new URLSearchParams(location.search).get('mode');
    if (force) return force === 'enligne';
    const h = location.hostname;
    return !(h === 'localhost' || h === '127.0.0.1' || /^\d+\.\d+\.\d+\.\d+$/.test(h));
  }

  const nouvelId = () => PREFIXE + Array.from(crypto.getRandomValues(new Uint8Array(6)), (o) => 'abcdefghijkmnpqrstuvwxyz23456789'[o % 32]).join('');
  const OPTIONS_CONNEXION = { reliable: true, serialization: 'json' };

  // ---- Ordinateur : reçoit ----
  function ordinateur({ surMessage, surTelephones, surAdresses, surProbleme }) {
    if (!modeEnLigne()) {
      fetch('/adresses').then((r) => r.json()).then(surAdresses);
      const connecter = () => {
        const ws = new WebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws?role=ordinateur`);
        ws.onmessage = (m) => {
          const d = JSON.parse(m.data);
          if (typeof d.telephones === 'number') surTelephones(d.telephones); else surMessage(d);
        };
        ws.onopen = () => surProbleme(null);
        ws.onclose = () => { surProbleme('Serveur arrêté ?'); setTimeout(connecter, 1000); };
      };
      return connecter();
    }

    // Identifiant gardé d'une fois sur l'autre : le lien enregistré sur le téléphone reste bon
    let id = memoire.lire('gyro-batterie-id') || nouvelId();
    const connexions = new Set();
    const compter = () => surTelephones(connexions.size);
    let peer;
    function ouvrir() {
      peer = new Peer(id, { debug: 0 });
      peer.on('open', () => {
        memoire.ecrire('gyro-batterie-id', id);
        surProbleme(null);
        surAdresses([new URL('telephone.html' + location.search, location.href).href + '#' + id]);
      });
      peer.on('connection', (c) => {
        c.on('open', () => { connexions.add(c); compter(); });
        c.on('data', surMessage);
        c.on('close', () => { connexions.delete(c); compter(); });
        c.on('error', () => { connexions.delete(c); compter(); });
      });
      peer.on('disconnected', () => { if (!peer.destroyed) setTimeout(() => peer.reconnect(), 1000); });
      peer.on('error', (e) => {
        if (e.type === 'unavailable-id') { peer.destroy(); id = nouvelId(); return ouvrir(); }
        if (['network', 'server-error', 'socket-error', 'socket-closed'].includes(e.type)) {
          surProbleme('Pas de connexion Internet ? Nouvel essai…');
          peer.destroy(); setTimeout(ouvrir, 2000);
        }
      });
    }
    ouvrir();
  }

  // ---- Téléphone : envoie ----
  function telephone({ surEtat }) {
    let envoyerA = null;
    const envoyer = (o) => { if (envoyerA) envoyerA(o); };

    if (!modeEnLigne()) {
      const connecter = () => {
        const ws = new WebSocket(`wss://${location.host}/ws?role=telephone`);
        ws.onopen = () => { envoyerA = (o) => ws.readyState === 1 && ws.send(JSON.stringify(o)); surEtat('Connecté à l\'ordinateur', true); };
        ws.onclose = () => { envoyerA = null; surEtat('Connexion perdue, nouvel essai…', false); setTimeout(connecter, 1000); };
      };
      connecter();
      return { envoyer };
    }

    const depuisLien = location.hash.slice(1);
    if (depuisLien.startsWith(PREFIXE)) memoire.ecrire('gyro-batterie-cible', depuisLien);
    const cible = memoire.lire('gyro-batterie-cible');
    if (!cible) { surEtat('Scanne le QR code affiché sur l\'ordinateur', false); return { envoyer }; }

    let peer, essai;
    const reessayer = (texte) => { envoyerA = null; surEtat(texte, false); clearTimeout(essai); essai = setTimeout(appeler, 2000); };
    function appeler() {
      if (!peer || peer.destroyed) return ouvrir();
      if (peer.disconnected) { peer.reconnect(); return reessayer('Reconnexion…'); }
      const c = peer.connect(cible, OPTIONS_CONNEXION);
      c.on('open', () => { envoyerA = (o) => c.open && c.send(o); surEtat('Connecté à l\'ordinateur', true); });
      c.on('close', () => reessayer('Connexion perdue, nouvel essai…'));
      c.on('error', () => reessayer('Connexion perdue, nouvel essai…'));
    }
    function ouvrir() {
      peer = new Peer({ debug: 0 });
      peer.on('open', appeler);
      peer.on('error', (e) => {
        if (e.type === 'peer-unavailable') reessayer('Ordinateur introuvable : la page Gyro-batterie y est-elle ouverte ?');
        else if (['network', 'server-error', 'socket-error', 'socket-closed'].includes(e.type)) { peer.destroy(); reessayer('Pas de connexion Internet ? Nouvel essai…'); }
      });
    }
    surEtat('Connexion…', false);
    ouvrir();
    return { envoyer };
  }

  racine.Liaison = { modeEnLigne, ordinateur, telephone };
})(this);
