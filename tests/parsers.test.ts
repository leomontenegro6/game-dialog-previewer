import assert from 'node:assert/strict';
import test from 'node:test';
import { parseCastlevaniaBlock } from '../src/parsers/castlevania';
import { parseMetroidBlock } from '../src/parsers/metroid';
import { parseMmbnBlock } from '../src/parsers/mmbn';
import { parsePokemonBlock } from '../src/parsers/pokemon';
import { POKEMON_GEN2_CHAR_MAP } from '../webview/charmaps/pokemon/gen2';
import { normalizeText, normalizeTextWithHighlights } from '../webview/components/Preview/PokemonPreview';

test('MMBN parser extracts multiple messages and multiline text', () => {
  const lines = ['{', '"First message"', 'clearMsg', '"""', 'Second', 'message', '"""', '}'];
  assert.deepEqual(parseMmbnBlock(lines, 1), ['First message', 'Second\nmessage']);
});

test('Castlevania parser stops at WAITINPUT and converts escaped newlines', () => {
  const lines = ['entry,"', 'Hello\\nworld{WAITINPUT}next message'];
  assert.equal(parseCastlevaniaBlock(lines, 1), 'Hello\nworld');
});

test('Metroid parser extracts only strings in the cursor block', () => {
  const lines = ['block_10_str_2:', '.stringn "First"', '.stringn "Second"', 'db 0x00, 0xFF', 'block_10_str_3:', '.stringn "Other"'];
  assert.deepEqual(parseMetroidBlock(lines, 1), { blockName: 'block_10_str_2', strings: ['First', 'Second'] });
});

test('Metroid parser extracts strings with trailing assembly comments', () => {
  const lines = ['block_10_str_2:', '.stringn "First" ; first line comment', '.stringn "Second"', 'db 0x00, 0xFF'];
  assert.deepEqual(parseMetroidBlock(lines, 1), { blockName: 'block_10_str_2', strings: ['First', 'Second'] });
});

test('Metroid parser reports when the cursor is outside a labeled block', () => {
  assert.deepEqual(parseMetroidBlock(['.stringn "text"'], 0), { blockName: null, strings: [] });
});

test('Pokemon ASM parser groups line and cont tags into windows', () => {
  const lines = ['Text_Example:', '  text "First line"', '  line "Second line"', '  para "New window"', '  line "Second window line"', '  cont "Continued line"', '  done'];
  assert.deepEqual(parsePokemonBlock(lines, 3, 'asm'), {
    blockName: 'Text_Example',
    windows: [
      { lines: ['First line', 'Second line'], continuation: false },
      { lines: ['New window', 'Second window line'], continuation: false },
      { lines: ['Continued line'], continuation: true }
    ]
  });
});

test('Pokemon Lua parser converts escaped control tags', () => {
  const lines = ['["example"] = "First\\nSecond\\011Continued\\012Last",'];
  assert.deepEqual(parsePokemonBlock(lines, 0, 'lua'), {
    blockName: 'example',
    windows: [
      { lines: ['First', 'Second'], continuation: false },
      { lines: ['Continued'], continuation: true },
      { lines: ['Last'], continuation: false }
    ]
  });
});

test('Pokemon Gen 2 character map uses the Portuguese font coordinates', () => {
  assert.deepEqual(POKEMON_GEN2_CHAR_MAP['\u00C9'], { x: 8, y: 4 });
  assert.deepEqual(POKEMON_GEN2_CHAR_MAP['\u00E9'], { x: 10, y: 4 });
  assert.deepEqual(POKEMON_GEN2_CHAR_MAP['!'], { x: 7, y: 6 });
  assert.deepEqual(POKEMON_GEN2_CHAR_MAP['9'], { x: 15, y: 7 });
  assert.deepEqual(POKEMON_GEN2_CHAR_MAP['\u00C7'], { x: 14, y: 4 });
  assert.deepEqual(POKEMON_GEN2_CHAR_MAP['\u00E7'], { x: 15, y: 4 });
});

test('Pokemon text normalization replaces game variables with preview placeholders', () => {
  assert.equal(
    normalizeText('#MON {PLAYER} <PLAYER> {STRBUF} <STRBUF>'),
    'POK\u00E9MON NmJogad NmJogad ItemOuPok\u00E9mo ItemOuPok\u00E9mo'
  );
});

test('Pokemon text normalization marks only replaced variables for highlighting', () => {
  const normalized = normalizeTextWithHighlights('Oi {PLAYER}! <STRBUF> #MON');
  assert.equal(normalized.text, 'Oi NmJogad! ItemOuPok\u00E9mo POK\u00E9MON');
  assert.deepEqual(normalized.highlighted.slice(0, 3), [false, false, false]);
  assert.equal(normalized.highlighted.slice(3, 10).every(Boolean), true);
  assert.deepEqual(normalized.highlighted.slice(10, 12), [false, false]);
  assert.equal(normalized.highlighted.slice(12, 24).every(Boolean), true);
  assert.equal(normalized.highlighted.slice(24).every((value) => !value), true);
});
