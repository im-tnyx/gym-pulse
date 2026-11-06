export function visualColumn(str, fromCol = 0) {
  let col = fromCol;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === '\t') col += 4 - (col % 4);
    else col++;
  }
  return col;
}

export function stripIndent(str, targetIndent, fromCol = 0) {
  if (targetIndent <= 0) return { matches: true, remaining: str, consumedChars: 0 };
  let col = fromCol;
  const targetCol = fromCol + targetIndent;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === ' ') col++;
    else if (ch === '\t') col += 4 - (col % 4);
    else return null;
    if (col >= targetCol) {
      const excess = col - targetCol;
      const remaining = ' '.repeat(excess) + str.slice(i + 1);
      return { matches: true, remaining, consumedChars: i + 1 };
    }
  }
  return null;
}
