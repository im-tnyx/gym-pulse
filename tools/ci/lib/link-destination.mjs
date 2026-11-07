const NAMED_DESTINATION_ENTITIES = Object.freeze({
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0',
  period: '.', sol: '/', num: '#', colon: ':', semi: ';',
  quest: '?', percnt: '%', equals: '=', lowbar: '_', hyphen: '-',
  eacute: 'é', Eacute: 'É', copy: '©', reg: '®', trade: '™', hellip: '…', mdash: '—', ndash: '–',
  euro: '€', pound: '£', yen: '¥', cent: '¢', bull: '•', times: '×', divide: '÷',
});
const NUMERIC_ENTITY_REPLACEMENTS = Object.freeze({
  0x80: '\u20ac', 0x82: '\u201a', 0x83: '\u0192', 0x84: '\u201e', 0x85: '\u2026',
  0x86: '\u2020', 0x87: '\u2021', 0x88: '\u02c6', 0x89: '\u2030', 0x8a: '\u0160',
  0x8b: '\u2039', 0x8c: '\u0152', 0x8e: '\u017d', 0x91: '\u2018', 0x92: '\u2019',
  0x93: '\u201c', 0x94: '\u201d', 0x95: '\u2022', 0x96: '\u2013', 0x97: '\u2014',
  0x98: '\u02dc', 0x99: '\u2122', 0x9a: '\u0161', 0x9b: '\u203a', 0x9c: '\u0153',
  0x9e: '\u017e', 0x9f: '\u0178',
});
export function decodeLinkEntities(value) {
  return value.replace(/&(?:#(?:[xX][0-9a-fA-F]+|[0-9]+)|[A-Za-z][A-Za-z0-9]+);/g, entity => {
    const token = entity.slice(1, -1);
    if (token[0] === '#') {
      const hex = token[1] === 'x' || token[1] === 'X';
      const number = Number.parseInt(token.slice(hex ? 2 : 1), hex ? 16 : 10);
      if (!Number.isSafeInteger(number) || number < 1 || number > 0x10ffff ||
          (number >= 0xd800 && number <= 0xdfff)) {
        throw new Error('Unsupported numeric HTML entity; fail closed');
      }
      if (Object.hasOwn(NUMERIC_ENTITY_REPLACEMENTS, number)) {
        return NUMERIC_ENTITY_REPLACEMENTS[number];
      }
      if (number >= 0x80 && number <= 0x9f) {
        throw new Error('Unsupported numeric HTML entity; fail closed');
      }
      return String.fromCodePoint(number);
    }
    if (!Object.hasOwn(NAMED_DESTINATION_ENTITIES, token)) {
      throw new Error('Unsupported named HTML entity; fail closed');
    }
    return NAMED_DESTINATION_ENTITIES[token];
  });
}

export function decodeDestinationText(value) {
  // Escapes and entities are one token stream; '\&' must not create an entity.
  return value.replace(/\\([!-/:-@\[-`{-~ ])|&(?:#(?:[xX][0-9a-fA-F]+|[0-9]+)|[A-Za-z][A-Za-z0-9]+);/g,
    (token, escaped) => escaped === undefined ? decodeLinkEntities(token) : escaped);
}

export function destination(raw) {
  const value = raw.replace(/^[ \t\r\n]+|[ \t\r\n]+$/g, '');
  if (value.startsWith('<')) {
    let end = -1;
    for (let i = 1; i < value.length; i++) {
      if (value[i] === '\\') { i++; continue; }
      if (value[i] === '>') { end = i; break; }
    }
    if (end < 0) throw new Error('Malformed angle-wrapped link');
    return decodeDestinationText(value.slice(1, end));
  }
  return decodeDestinationText((value.match(/^(?:\\.|[^\x00-\x20\x7f])+/) || [''])[0]);
}
