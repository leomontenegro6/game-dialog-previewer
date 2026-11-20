import { CharacterData } from '../types';
import { CHAR_MAP_MF_MZMLIKE } from '../charmaps/mf/mzmlike';
import { CHAR_MAP_MF_VANILLA } from '../charmaps/mf/vanilla';
import { CHAR_MAP_MZM_PROJECTZM } from '../charmaps/mzm/projectzm';
import { CHAR_MAP_MZM_VANILLA } from '../charmaps/mzm/vanilla';

export const getCharacterMap = (gameType: string): { [key: string]: CharacterData } => {
  switch (gameType) {
    case 'mzm-projectzm':
      return CHAR_MAP_MZM_PROJECTZM;
    case 'mf-vanilla':
      return CHAR_MAP_MF_VANILLA;
    case 'mf-mzmlike':
      return CHAR_MAP_MF_MZMLIKE;
    case 'mzm-vanilla':
    default:
      return CHAR_MAP_MZM_VANILLA;
  }
};

function getAssetsBase(): string {
  return document.getElementById('root')?.getAttribute('data-assets-base') ?? '';
}

export const getFontSpriteUri = (gameType: string): string => {
  const gamePath = gameType.replace('-', '/');
  return `${getAssetsBase()}/metroid/${gamePath}/font-sprite.png`;
};

export const getWindowSpriteUri = (dialogType: string): string =>
  `${getAssetsBase()}/metroid/window-${dialogType}.png`;

export const getSpritePosition = (x: number, y: number): { spriteX: number; spriteY: number } => ({
  spriteX: -(x * 8),
  spriteY: -(y * 16)
});

export const buildSpriteClassNames = (color: string, withBorder: boolean): string =>
  withBorder
    ? `char-sprite color-${color} with-border`
    : `char-sprite color-${color}`;
