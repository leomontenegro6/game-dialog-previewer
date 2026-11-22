export const gameIds = [
  'mmbn1',
  'mmbn2',
  'mmbn3',
  'mmbn4',
  'mmbn5',
  'castlevania',
  'mzm-vanilla',
  'mzm-projectzm',
  'mf-vanilla',
  'mf-mzmlike',
  'pokemon'
] as const;

export type GameId = typeof gameIds[number];

export type PokemonPreviewType =
  | 'pokemon_cwf_og'
  | 'pokemon_vwf_gen1recomp'
  | 'pokemon_gen2_asm'
  | 'pokemon_gen2_lua'
  | 'pokemon_gen2_vwf_asm'
  | 'pokemon_gen2_vwf_lua';

export type PreviewStatus = 'no-editor' | 'unsupported-file' | 'no-block' | 'ready';

export interface PreviewData {
  status: PreviewStatus;
  game: GameId;
  fileName?: string;
  blockName?: string;
  strings: string[];
  expectedExtension?: string;
  pokemonWindows?: PokemonWindow[];
}

export interface PokemonWindow {
  lines: string[];
  continuation: boolean;
  invalidLineBreak?: boolean;
}

export interface PreviewConfiguration {
  game: GameId;
  mmbnPreviewType: string;
  zoom: number;
  metroidDialogType: string;
  pokemonPreviewType: PokemonPreviewType;
}

export function isGameId(value: unknown): value is GameId {
  return gameIds.some((game) => game === value);
}
