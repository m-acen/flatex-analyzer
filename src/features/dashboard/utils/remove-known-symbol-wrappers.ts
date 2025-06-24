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
