// Grosse caisse et cymbale synthétisées en Web Audio (aucun fichier son).
(function (racine) {
  function creerSons(ctx) {
    const sortie = ctx.createDynamicsCompressor();
    sortie.threshold.value = -10; sortie.ratio.value = 4;
    sortie.connect(ctx.destination);

    // Bruit blanc réutilisé (2 s)
    const bruit = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = bruit.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;

    const volume = (force) => 0.25 + 0.75 * Math.min(1, Math.max(0, force));

    function grosseCaisse(force = 0.7) {
      const t = ctx.currentTime, v = volume(force);
      const osc = ctx.createOscillator(), g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(170, t);
      osc.frequency.exponentialRampToValueAtTime(48, t + 0.12);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(v, t + 0.003);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
      osc.connect(g).connect(sortie);
      osc.start(t); osc.stop(t + 0.55);
      // petit claquement d'attaque
      const clic = ctx.createBufferSource(), f = ctx.createBiquadFilter(), gc = ctx.createGain();
      clic.buffer = bruit; f.type = 'lowpass'; f.frequency.value = 3000;
      gc.gain.setValueAtTime(0.35 * v, t);
      gc.gain.exponentialRampToValueAtTime(0.0001, t + 0.015);
      clic.connect(f).connect(gc).connect(sortie);
      clic.start(t); clic.stop(t + 0.02);
    }

    function cymbale(force = 0.7) {
      const t = ctx.currentTime, v = volume(force), duree = 1.2 + 1.3 * force;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.5 * v, t + 0.002);
      g.gain.exponentialRampToValueAtTime(0.0001, t + duree);
      const passeBande = ctx.createBiquadFilter(); passeBande.type = 'bandpass'; passeBande.frequency.value = 9000;
      const passeHaut = ctx.createBiquadFilter(); passeHaut.type = 'highpass'; passeHaut.frequency.value = 6000;
      passeBande.connect(passeHaut).connect(g).connect(sortie);
      // six carrés désaccordés, façon TR-808
      for (const fr of [205.3, 304.4, 369.6, 522.7, 540, 800]) {
        const o = ctx.createOscillator(); o.type = 'square'; o.frequency.value = fr * 1.7;
        o.connect(passeBande); o.start(t); o.stop(t + duree);
      }
      // souffle
      const b = ctx.createBufferSource(), gb = ctx.createGain();
      b.buffer = bruit; gb.gain.value = 0.6;
      b.connect(gb).connect(passeHaut);
      b.start(t); b.stop(t + Math.min(duree, 2));
    }

    return { grosseCaisse, cymbale };
  }
  racine.creerSons = creerSons;
})(this);
