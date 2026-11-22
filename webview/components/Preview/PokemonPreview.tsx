import React, { useEffect, useRef, useState } from 'react';
import type { PokemonPreviewType, PokemonWindow } from '../../../src/types';
import { POKEMON_GEN2_CHAR_MAP } from '../../charmaps/pokemon/gen2';
import { getPokemonAssetUri } from '../../utils/spriteUtils';

export interface NormalizedPokemonText {
  text: string;
  highlighted: boolean[];
}

export function normalizeTextWithHighlights(text: string): NormalizedPokemonText {
  const pattern = /#|(\{PLAYER\}|<PLAYER>)|(\{STRBUF\}|<STRBUF>)|(\{NUM\}|<NUM>)/gi;
  const parts: string[] = [];
  const highlighted: boolean[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const append = (value: string, isHighlighted: boolean) => {
    parts.push(value);
    highlighted.push(...Array.from(value).map(() => isHighlighted));
  };

  while ((match = pattern.exec(text)) !== null) {
    append(text.slice(lastIndex, match.index), false);
    append(match[0] === '#' ? 'POK\u00E9' : match[1] ? 'NmJogad' : match[2] ? 'ItemOuPok\u00E9mo' : '10', match[0] !== '#');
    lastIndex = pattern.lastIndex;
  }

  append(text.slice(lastIndex), false);
  return { text: parts.join(''), highlighted };
}

export function normalizeText(text: string): string {
  return normalizeTextWithHighlights(text).text;
}

const PokemonLine: React.FC<{ text: string; vwf: boolean }> = ({ text, vwf }) => {
  const normalized = normalizeTextWithHighlights(text);

  if (vwf) {
    const characters = Array.from(normalized.text);
    const parts: React.ReactNode[] = [];
    let plainText = '';
    let highlightedText = '';
    let highlighted = false;

    const flush = () => {
      if (plainText) {
        parts.push(plainText);
        plainText = '';
      }
      if (highlightedText) {
        parts.push(<span className="pokemon-vwf-placeholder" key={parts.length}>{highlightedText}</span>);
        highlightedText = '';
      }
    };

    characters.forEach((character, index) => {
      const characterHighlighted = normalized.highlighted[index];
      if (characterHighlighted !== highlighted) {
        flush();
        highlighted = characterHighlighted;
      }
      if (highlighted) {
        highlightedText += character;
      } else {
        plainText += character;
      }
    });
    flush();

    return <div className="pokemon-line">{parts}</div>;
  }

  return (
    <div className="pokemon-line">
      {Array.from(normalized.text).map((character, index) => {
        const position = POKEMON_GEN2_CHAR_MAP[character];
        const highlighted = normalized.highlighted[index];

        const positionValue = position
          ? `${-(position.x * 8)}px ${-(position.y * 8)}px`
          : undefined;
        const fontUri = getPokemonAssetUri('font.png');

        return (
          <span
            className={`pokemon-char${highlighted ? ' pokemon-placeholder' : ''}`}
            key={`${character}-${index}`}
            style={{
              backgroundPosition: positionValue,
              backgroundImage: position && !highlighted ? `url("${fontUri}")` : 'none',
              maskImage: position && highlighted ? `url("${fontUri}")` : undefined,
              WebkitMaskImage: position && highlighted ? `url("${fontUri}")` : undefined,
              maskPosition: positionValue,
              WebkitMaskPosition: positionValue,
              maskRepeat: position && highlighted ? 'no-repeat' : undefined,
              WebkitMaskRepeat: position && highlighted ? 'no-repeat' : undefined
            }}
          />
        );
      })}
    </div>
  );
};

function groupPokemonWindows(windows: PokemonWindow[]): PokemonWindow[][] {
  return windows.reduce<PokemonWindow[][]>((groups, window) => {
    if (!window.continuation || groups.length === 0) {
      groups.push([window]);
    } else {
      groups[groups.length - 1].push(window);
    }

    return groups;
  }, []);
}

const PokemonWindow: React.FC<{ windows: PokemonWindow[]; vwf: boolean }> = ({ windows, vwf }) => {
  const lineCount = windows.reduce((count, window) => count + window.lines.slice(0, 2).length, 0);
  const bodyHeight = Math.max(32, lineCount * 16);
  const windowRef = useRef<HTMLDivElement>(null);
  const [overflowRight, setOverflowRight] = useState(false);
  const invalidLineBreak = windows.some((window, index) => {
    const maxLines = window.continuation ? 1 : 2;
    const isFirstContinuationSeparator = index === 1
      && window.continuation
      && windows[0].lines.length < 2;

    return window.invalidLineBreak
      || window.lines.length > maxLines
      || isFirstContinuationSeparator;
  });
  let precedingLineCount = 0;

  useEffect(() => {
    const body = windowRef.current?.querySelector<HTMLElement>('.pokemon-window-body');
    if (!body) {
      return;
    }

    const updateOverflow = () => {
      const overflowing = Array.from(body.querySelectorAll<HTMLElement>('.pokemon-line'))
        .some((line) => line.scrollWidth > line.clientWidth + 1);
      setOverflowRight(overflowing);
    };

    updateOverflow();
    const observer = new ResizeObserver(updateOverflow);
    observer.observe(body);
    body.querySelectorAll('.pokemon-line').forEach((line) => observer.observe(line));
    void document.fonts?.ready.then(updateOverflow);

    return () => observer.disconnect();
  }, [vwf, windows]);

  return (
    <div
      ref={windowRef}
      className={`pokemon-window${overflowRight ? ' pokemon-window-overflow-right' : ''}${invalidLineBreak ? ' pokemon-window-invalid-break' : ''}`}
    >
      <div
        className="pokemon-window-start"
        style={{ backgroundImage: `url("${getPokemonAssetUri('window_start.png')}")` }}
      />
      <div className="pokemon-window-body" style={{ height: `${bodyHeight}px` }}>
        {windows.map((window, windowIndex) => {
          const lines = window.lines.slice(0, 2);
          const continuationTop = (precedingLineCount * 16) - 8;
          precedingLineCount += lines.length;

          return (
            <React.Fragment key={windowIndex}>
              {windowIndex > 0 && (
                <div className="pokemon-continuation" style={{ top: `${continuationTop}px` }}>
                  {'\u25BC'}
                </div>
              )}
              {lines.map((line, lineIndex) => (
                <PokemonLine text={line} vwf={vwf} key={`${windowIndex}-${lineIndex}`} />
              ))}
            </React.Fragment>
          );
        })}
      </div>
      <div
        className="pokemon-window-end"
        style={{ backgroundImage: `url("${getPokemonAssetUri('window_end.png')}")` }}
      />
    </div>
  );
};

export const PokemonPreview: React.FC<{
  windows: PokemonWindow[];
  previewType: PokemonPreviewType;
  zoom: number;
}> = ({ windows, previewType, zoom }) => {
  const vwf = previewType === 'pokemon_vwf_gen1recomp'
    || previewType === 'pokemon_gen2_vwf_asm'
    || previewType === 'pokemon_gen2_vwf_lua';

  return (
    <div
      className={`pokemon-preview${vwf ? ' pokemon-vwf-preview' : ''}`}
      style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
    >
      {groupPokemonWindows(windows).map((group, index) => (
        <PokemonWindow windows={group} vwf={vwf} key={index} />
      ))}
    </div>
  );
};
