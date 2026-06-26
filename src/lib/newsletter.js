export function parseNewsletter(text) {
  const result = {
    supports:       [],
    resistances:    [],
    directBidText:  '',    // raw text of the direct bid section
    bullCase:       '',
    bearCase:       '',
    summary:        '',
    currentPosition: '',
    parseWarnings:  [],
  };

  // ── Support list ──────────────────────────────────────────────────────────
  const supportsMatch = text.match(/Supports?\s+are[:\s]+([^\n]+(?:\n(?![A-Z])[^\n]+)*)/i);
  if (supportsMatch) {
    result.supports = parseLevelList(supportsMatch[1]);
  } else {
    result.parseWarnings.push('Could not find support list');
  }

  // ── Resistance list ───────────────────────────────────────────────────────
  const resistancesMatch = text.match(/Resistances?\s+are[:\s]+([^\n]+(?:\n(?![A-Z])[^\n]+)*)/i);
  if (resistancesMatch) {
    result.resistances = parseLevelList(resistancesMatch[1]);
  } else {
    result.parseWarnings.push('Could not find resistance list');
  }

  // ── Direct bid section ────────────────────────────────────────────────────
  const directBidMatch = text.match(
    /In terms of (?:lvls?|levels?)\s+I(?:'d|'d| would| wd)\s+bid\s+direct[:\s]+([\s\S]+?)(?=Resistances?\s+are|Bull case|Bear case|In summary)/i
  );
  if (directBidMatch) {
    result.directBidText = directBidMatch[1].trim();
  } else {
    result.parseWarnings.push('Could not find direct bid section — AI extraction may be incomplete');
  }

  // ── Bull case ─────────────────────────────────────────────────────────────
  const bullMatch = text.match(/Bull case\s+(?:tomorrow|Monday|Tuesday|Wednesday|Thursday|Friday|today)?[:\s]+([\s\S]+?)(?=Bear case|In summary|$)/i);
  if (bullMatch) result.bullCase = bullMatch[1].trim();

  // ── Bear case ─────────────────────────────────────────────────────────────
  const bearMatch = text.match(/Bear case\s+(?:tomorrow|Monday|Tuesday|Wednesday|Thursday|Friday|today)?[:\s]+([\s\S]+?)(?=In summary|Bull case|$)/i);
  if (bearMatch) result.bearCase = bearMatch[1].trim();

  // ── Summary ───────────────────────────────────────────────────────────────
  const summaryMatch = text.match(/In summary\s+(?:for\s+)?(?:tomorrow|today)?[:\s]+([\s\S]+?)(?=As always|$)/i);
  if (summaryMatch) result.summary = summaryMatch[1].trim();

  // ── Current position ──────────────────────────────────────────────────────
  const positionMatch = result.directBidText.match(
    /(?:still holding|holding)\s+(?:my\s+)?[\d%]+\s+(?:long\s+)?runner[^.]+\./i
  );
  if (positionMatch) result.currentPosition = positionMatch[0].trim();

  // ── Bias detection ────────────────────────────────────────────────────────
  result.bias = detectBias(result.bullCase, result.bearCase, result.summary);

  return result;
}

function parseLevelList(raw) {
  const levels = [];
  const regex = /(\d{3,5}(?:\.\d{1,2})?)\s*(\(major\))?/gi;
  let match;
  while ((match = regex.exec(raw)) !== null) {
    const price = parseFloat(match[1]);
    if (price > 1000 && price < 30000) {
      levels.push({ price, major: !!match[2] });
    }
  }
  return levels;
}

function detectBias(bull, bear, summary) {
  const combined = (bull + ' ' + bear + ' ' + summary).toLowerCase();
  const bullishSignals = ['defend', 'hold', 'bull case', 'head higher', 'rip', 'rally', 'upside'];
  const bearishSignals = ['below', 'short', 'bear case', 'breaks down', 'sell off', 'lower'];
  const bullScore = bullishSignals.filter(s => combined.includes(s)).length;
  const bearScore = bearishSignals.filter(s => combined.includes(s)).length;
  if (bullScore > bearScore + 1) return 'bullish';
  if (bearScore > bullScore + 1) return 'bearish';
  return 'neutral';
}
