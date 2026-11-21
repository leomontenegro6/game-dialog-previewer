export interface PokemonCharacterPosition {
  x: number;
  y: number;
}

// The supplied Gen 2 font is a 16x8 tile sheet. Coordinates are tile coordinates.
// The accented rows are specific to the Portuguese font asset used by this previewer.
export const POKEMON_GEN2_CHAR_MAP: Record<string, PokemonCharacterPosition> = {
  A: { x: 0, y: 0 }, B: { x: 1, y: 0 }, C: { x: 2, y: 0 }, D: { x: 3, y: 0 },
  E: { x: 4, y: 0 }, F: { x: 5, y: 0 }, G: { x: 6, y: 0 }, H: { x: 7, y: 0 },
  I: { x: 8, y: 0 }, J: { x: 9, y: 0 }, K: { x: 10, y: 0 }, L: { x: 11, y: 0 },
  M: { x: 12, y: 0 }, N: { x: 13, y: 0 }, O: { x: 14, y: 0 }, P: { x: 15, y: 0 },

  Q: { x: 0, y: 1 }, R: { x: 1, y: 1 }, S: { x: 2, y: 1 }, T: { x: 3, y: 1 },
  U: { x: 4, y: 1 }, V: { x: 5, y: 1 }, W: { x: 6, y: 1 }, X: { x: 7, y: 1 },
  Y: { x: 8, y: 1 }, Z: { x: 9, y: 1 }, '(': { x: 10, y: 1 }, ')': { x: 11, y: 1 },
  ':': { x: 12, y: 1 }, ';': { x: 13, y: 1 }, '[': { x: 14, y: 1 }, ']': { x: 15, y: 1 },

  a: { x: 0, y: 2 }, b: { x: 1, y: 2 }, c: { x: 2, y: 2 }, d: { x: 3, y: 2 },
  e: { x: 4, y: 2 }, f: { x: 5, y: 2 }, g: { x: 6, y: 2 }, h: { x: 7, y: 2 },
  i: { x: 8, y: 2 }, j: { x: 9, y: 2 }, k: { x: 10, y: 2 }, l: { x: 11, y: 2 },
  m: { x: 12, y: 2 }, n: { x: 13, y: 2 }, o: { x: 14, y: 2 }, p: { x: 15, y: 2 },

  q: { x: 0, y: 3 }, r: { x: 1, y: 3 }, s: { x: 2, y: 3 }, t: { x: 3, y: 3 },
  u: { x: 4, y: 3 }, v: { x: 5, y: 3 }, w: { x: 6, y: 3 }, x: { x: 7, y: 3 },
  y: { x: 8, y: 3 }, z: { x: 9, y: 3 },

  'Á': { x: 0, y: 4 }, 'À': { x: 1, y: 4 }, 'Â': { x: 2, y: 4 }, 'Ã': { x: 3, y: 4 },
  'á': { x: 4, y: 4 }, 'à': { x: 5, y: 4 }, 'â': { x: 6, y: 4 }, 'ã': { x: 7, y: 4 },
  'É': { x: 8, y: 4 }, 'Ê': { x: 9, y: 4 }, 'é': { x: 10, y: 4 }, 'ê': { x: 11, y: 4 },
  'Í': { x: 12, y: 4 }, 'í': { x: 13, y: 4 }, 'Ç': { x: 14, y: 4 }, 'ç': { x: 15, y: 4 },

  'Ó': { x: 0, y: 5 }, 'Ô': { x: 1, y: 5 }, 'Õ': { x: 2, y: 5 }, 'ó': { x: 3, y: 5 },
  'ô': { x: 4, y: 5 }, 'õ': { x: 5, y: 5 }, 'Ú': { x: 6, y: 5 }, 'ú': { x: 7, y: 5 },
  'º': { x: 8, y: 5 }, 'ª': { x: 9, y: 5 }, '…': { x: 10, y: 5 },

  '\'': { x: 0, y: 6 }, '-': { x: 3, y: 6 }, '?': { x: 6, y: 6 }, '!': { x: 7, y: 6 },
  '.': { x: 8, y: 6 },

  '¥': { x: 0, y: 7 }, '/': {x: 3, y: 7}, ',': {x: 4, y: 7}, '0': {x: 6, y: 7},
  '1': {x: 7, y: 7}, '2': {x: 8, y: 7}, '3': {x: 9, y: 7}, '4': {x: 10, y: 7},
  '5': {x: 11, y: 7}, '6': {x: 12, y: 7}, '7': {x: 13, y: 7}, '8': {x: 14, y: 7},
  '9': {x: 15, y: 7}
};
