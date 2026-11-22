import type { PokemonWindow } from '../types';

export interface PokemonDialog {
  blockName: string | null;
  windows: PokemonWindow[];
}

type Token = { kind: 'text' | 'line' | 'cont' | 'para'; text?: string };

function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  const pattern = /\\(011|012|n)|([^\\]+)/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match[1] === '011') {
      tokens.push({ kind: 'cont' });
    } else if (match[1] === '012') {
      tokens.push({ kind: 'para' });
    } else if (match[1] === 'n') {
      tokens.push({ kind: 'line' });
    } else if (match[2]) {
      tokens.push({ kind: 'text', text: match[2] });
    }
  }

  return tokens;
}

function buildWindows(tokens: Token[]): PokemonWindow[] {
  const windows: PokemonWindow[] = [{ lines: [], continuation: false }];
  let currentLine = '';

  const pushLine = () => {
    if (currentLine.length > 0) {
      windows[windows.length - 1].lines.push(currentLine);
    }
    currentLine = '';
  };

  const startWindow = () => {
    pushLine();
    if (windows[windows.length - 1].lines.length > 0) {
      windows.push({ lines: [], continuation: false });
    }
  };

  for (const token of tokens) {
    currentLine += token.text ?? '';

    if (token.kind === 'line') {
      pushLine();
    } else if (token.kind === 'cont' || token.kind === 'para') {
      startWindow();
      windows[windows.length - 1].continuation = token.kind === 'cont';
    }
  }

  pushLine();
  return windows
    .filter((window) => window.lines.some((line) => line.length > 0))
    .map((window) => {
      const maxLines = window.continuation ? 1 : 2;
      return window.lines.length > maxLines
        ? { ...window, invalidLineBreak: true }
        : window;
    });
}

function decodeQuotedText(value: string): string {
  return value
    .replace(/\\\\/g, '\\')
    .replace(/\\"/g, '"');
}

export function parsePokemonAsmBlock(lines: string[], currentLine: number): PokemonDialog {
  let blockStart = -1;
  let blockName: string | null = null;

  for (let line = currentLine; line >= 0; line--) {
    const label = lines[line].match(/^\s*([A-Za-z0-9_]+):\s*$/);
    if (label) {
      blockStart = line;
      blockName = label[1];
      break;
    }
  }

  if (blockStart < 0) {
    return { blockName: null, windows: [] };
  }

  const tokens: Token[] = [];
  for (let line = blockStart + 1; line < lines.length; line++) {
    const source = lines[line].trim();
    if (/^(done|db\s+0x00,\s*0xFF)\b/i.test(source)) {
      break;
    }

    const match = source.match(/^(text|line|cont|para)\s+"((?:\\.|[^"\\])*)"/i);
    if (match) {
      const kind = match[1].toLowerCase() as Token['kind'];
      const text = decodeQuotedText(match[2]);
      if (kind === 'cont' || kind === 'para') {
        tokens.push({ kind });
      }
      tokens.push({ kind: 'text', text });
      tokens.push({ kind: 'line' });
    }
  }

  return { blockName, windows: buildWindows(tokens) };
}

export function parsePokemonLuaBlock(lines: string[], currentLine: number): PokemonDialog {
  let entryLine = -1;
  let blockName: string | null = null;

  for (let line = currentLine; line >= 0; line--) {
    const entry = lines[line].match(/^\s*\["([^"]+)"\]\s*=\s*"((?:\\.|[^"\\])*)"/);
    if (entry) {
      entryLine = line;
      blockName = entry[1];
      const text = decodeQuotedText(entry[2]);
      return { blockName, windows: buildWindows(tokenize(text)) };
    }
  }

  return { blockName: entryLine >= 0 ? blockName : null, windows: [] };
}

export function parsePokemonBlock(
  lines: string[],
  currentLine: number,
  format: 'asm' | 'lua'
): PokemonDialog {
  return format === 'lua'
    ? parsePokemonLuaBlock(lines, currentLine)
    : parsePokemonAsmBlock(lines, currentLine);
}
