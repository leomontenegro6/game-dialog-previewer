export function parseMmbnBlock(lines: string[], currentLine: number): string[] {
  if (lines.length === 0 || currentLine < 0 || currentLine >= lines.length) {
    return [];
  }

  let start = currentLine;
  while (start > 0 && !lines[start - 1].trim().endsWith('{')) {
    start--;
  }
  if (start > 0) {
    start--;
  }

  let end = currentLine;
  while (end < lines.length - 1 && !lines[end].trim().endsWith('}')) {
    end++;
  }

  const blocks = [''];
  let blockIndex = 0;
  let insideMultilineString = false;

  for (const rawLine of lines.slice(start, end + 1)) {
    const line = rawLine.trim();

    if (line.startsWith('"""')) {
      insideMultilineString = !insideMultilineString;
      continue;
    }

    if (insideMultilineString) {
      blocks[blockIndex] += `${line}\n`;
    } else if (line.startsWith('"') && line.endsWith('"') && line.length > 3) {
      blocks[blockIndex] += line.replaceAll('"', '');
    }

    if (line.includes('clearMsg')) {
      blockIndex++;
      blocks.push('');
    }
  }

  return blocks
    .map((block) => block.trimEnd())
    .filter((block, index) => block.length > 0 || index < blocks.length - 1);
}
