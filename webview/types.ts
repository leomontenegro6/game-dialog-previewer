import type { GameId, PreviewConfiguration, PreviewData } from '../src/types';

export interface CharacterData {
  x: number;
  y: number;
  width: number;
  marginRight?: number;
}

export interface TextSegment {
  text: string;
  color: string;
  centerValue: number;
  startIndex: number;
  endIndex: number;
}

export interface CursorInfo {
  fileName: string;
  lineNumber: number;
  column: number;
  blockName: string | null;
  strings: string[];
  timestamp: string;
}

export interface WebviewInitialization {
  configuration: PreviewConfiguration;
  preview: PreviewData;
}

export type PreviewMessage =
  | { type: 'initialize'; configuration: PreviewConfiguration; preview: PreviewData }
  | { type: 'configuration'; data: PreviewConfiguration }
  | { type: 'preview'; data: PreviewData };

export type SelectedGame = GameId;
