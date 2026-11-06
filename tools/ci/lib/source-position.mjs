// Convert match offsets to 1-based file lines without rescanning for each link.
export function lineLookup(text) {
  const breaks = [];
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    if (char === 13) {
      if (text.charCodeAt(i + 1) === 10) i++; // CRLF is one break.
      breaks.push(i);
    } else if (char === 10) breaks.push(i); // LF or standalone CR.
  }
  return offset => {
    let lo = 0, hi = breaks.length;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (breaks[mid] < offset) lo = mid + 1; else hi = mid;
    }
    return lo + 1;
  };
}

export function inRanges(ranges, offset) {
  let low = 0, high = ranges.length;
  while (low < high) {
    const mid = (low + high) >>> 1;
    if (ranges[mid].start <= offset) low = mid + 1;
    else high = mid;
  }
  return low > 0 && offset < ranges[low - 1].end;
}
