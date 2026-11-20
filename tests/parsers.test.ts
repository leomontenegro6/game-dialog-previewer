import assert from 'node:assert/strict';
import test from 'node:test';
import { parseCastlevaniaBlock } from '../src/parsers/castlevania';
import { parseMetroidBlock } from '../src/parsers/metroid';
import { parseMmbnBlock } from '../src/parsers/mmbn';

test('MMBN parser extracts multiple messages and multiline text', () => {
  const lines = [
    '{',
    '"First message"',
    'clearMsg',
    '"""',
    'Second',
    'message',
    '"""',
    '}'
  ];

  assert.deepEqual(parseMmbnBlock(lines, 1), ['First message', 'Second\nmessage']);
});

test('Castlevania parser stops at WAITINPUT and converts escaped newlines', () => {
  const lines = ['entry,"', 'Hello\\nworld{WAITINPUT}next message'];

  assert.equal(parseCastlevaniaBlock(lines, 1), 'Hello\nworld');
});

test('Metroid parser extracts only strings in the cursor block', () => {
  const lines = [
    'block_10_str_2:',
    '.stringn "First"',
    '.stringn "Second"',
    'db 0x00, 0xFF',
    'block_10_str_3:',
    '.stringn "Other"'
  ];

  assert.deepEqual(parseMetroidBlock(lines, 1), {
    blockName: 'block_10_str_2',
    strings: ['First', 'Second']
  });
});

test('Metroid parser extracts strings with trailing assembly comments', () => {
  const lines = [
    'block_10_str_2:',
    '.stringn "First" ; first line comment',
    '.stringn "Second"',
    'db 0x00, 0xFF'
  ];

  assert.deepEqual(parseMetroidBlock(lines, 1), {
    blockName: 'block_10_str_2',
    strings: ['First', 'Second']
  });
});

test('Metroid parser reports when the cursor is outside a labeled block', () => {
  assert.deepEqual(parseMetroidBlock(['.stringn "text"'], 0), {
    blockName: null,
    strings: []
  });
});
