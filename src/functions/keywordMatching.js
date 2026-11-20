// Quita tildes y pasa a minúsculas para comparar sin depender de acentos
export function normalizeText(str) {
  return str.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

// Busca la keyword como palabra completa, admitiendo plural en -s o -es
export function containsKeyword(text, keyword) {
  const escaped = normalizeText(keyword).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?:es|s)?(?![\\p{L}\\p{N}])`, 'u');
  return regex.test(normalizeText(text));
}
