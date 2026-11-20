export interface MetroidBlock {
  blockName: string | null;
  strings: string[];
}

const blockLabelPattern = /^block_\d+_str_\d+:$/;

export function parseMetroidBlock(lines: string[], currentLine: number): MetroidBlock {
  let blockStart = -1;
  let blockName: string | null = null;

  for (let line = currentLine; line >= 0; line--) {
    const text = lines[line].trim();
    if (blockLabelPattern.test(text)) {
      blockStart = line;
      blockName = text.slice(0, -1);
      break;
    }
  }

  if (blockStart < 0) {
    return { blockName: null, strings: [] };
  }

  const strings: string[] = [];
  for (let line = blockStart + 1; line < lines.length; line++) {
    const text = lines[line].trim();

    if (text === 'db 0x00, 0xFF' || blockLabelPattern.test(text)) {
      break;
    }

    const stringMatch = text.match(/^\.stringn\s+"((?:\\.|[^"\\])*)"/);
    if (stringMatch) {
      strings.push(stringMatch[1]);
    }
  }

  return { blockName, strings };
}
