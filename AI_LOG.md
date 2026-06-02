En aquesta implementació només s'ha necessitat d'un prompt per realitzar la implementació i ha sigut en el fitxer src/services/matomo.ts:
-----------------------
export function setUserId(userId?: string | null) {
  if (!window._paq || !userId) return;

  window._paq.push(['setUserId', userId]);
}

export function resetUserId() {
  if (!window._paq) return;

  window._paq.push(['resetUserId']);
}

-----------------------

La resta s'ha pogut servir utilitzant la mateixa guia d'instal·lació de matomo.org.

