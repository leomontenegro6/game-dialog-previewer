function previousText(lines: string[], currentLine: number): string {
  const collected: string[] = [];

  for (let line = currentLine - 1; line >= 0; line--) {
    const text = lines[line].trim();
    const waitInput = text.lastIndexOf('{WAITINPUT}');
    const csvFieldStart = text.lastIndexOf(',"');
    const boundary = Math.max(waitInput, csvFieldStart);

    if (boundary >= 0) {
      const markerLength = waitInput >= csvFieldStart ? '{WAITINPUT}'.length : 2;
      collected.unshift(text.slice(boundary + markerLength));
      break;
    }

    collected.unshift(text);
  }

  return collected.join('');
}

function nextText(lines: string[], currentLine: number): string {
  const collected: string[] = [];

  for (let line = currentLine; line < lines.length; line++) {
    const text = lines[line].trim();
    const waitInput = text.indexOf('{WAITINPUT}');

    if (waitInput >= 0) {
      collected.push(text.slice(0, waitInput));
      break;
    }

    const closingQuote = text.indexOf('"\n');
    if (closingQuote >= 0) {
      collected.push(text.slice(0, closingQuote));
      break;
    }

    if (line === lines.length - 1 && text.endsWith('"')) {
      collected.push(text.slice(0, -1));
      break;
    }

    collected.push(text);
  }

  return collected.join('');
}

export function parseCastlevaniaBlock(lines: string[], currentLine: number): string {
  if (lines.length === 0 || currentLine < 0 || currentLine >= lines.length) {
    return '';
  }

  return `${previousText(lines, currentLine)}${nextText(lines, currentLine)}`
    .replace(/{[^}]*}/g, '')
    .replace(/\\n/g, '\n')
    .trim();
}
