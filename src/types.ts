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
  'mf-mzmlike'
] as const;

export type GameId = typeof gameIds[number];

export type PreviewStatus = 'no-editor' | 'unsupported-file' | 'no-block' | 'ready';

export interface PreviewData {
  status: PreviewStatus;
  game: GameId;
  fileName?: string;
  blockName?: string;
  strings: string[];
  expectedExtension?: string;
}

export interface PreviewConfiguration {
  game: GameId;
  mmbnPreviewType: string;
  zoom: number;
  metroidDialogType: string;
}

export function isGameId(value: unknown): value is GameId {
  return gameIds.some((game) => game === value);
}
