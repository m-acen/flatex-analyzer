const KNOWN_SYMBOL_WRAPPERS = [
  "CL.SN"
];

export function removeKnownSymbolWrappers(symbol: string): string {
  for (const wrapper of KNOWN_SYMBOL_WRAPPERS) {
    const regex = new RegExp(`${wrapper}$`);
    if (regex.test(symbol)) {
      return symbol.replace(regex, '');
    }
  }
  return symbol;
}


const ISIN_REMAP = {
  "US02079K3059": "GOOGL"
}

export function hardCodedIsinRemap(symbol: string): string {
  if(ISIN_REMAP[symbol] === undefined) return symbol;
  return ISIN_REMAP[symbol] || symbol;
}