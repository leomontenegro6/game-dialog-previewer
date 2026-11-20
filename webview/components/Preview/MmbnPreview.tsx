import React from 'react';

const characterClasses: Record<string, string> = {
  ' ': 'space', '!': 'exclamation', '"': 'double-quotes', '#': 'hashtag',
  '$': 'money-sign', '%': 'percent', '&': 'ampersand', "'": 'quotes',
  '(': 'open-parenthesis', ')': 'close-parenthesis', '*': 'asterisk',
  '+': 'plus', ',': 'comma', '-': 'minus', '.': 'dot', '/': 'slash',
  ':': 'colon', ';': 'semicolon', '<': 'less-than', '=': 'equal', '>': 'greater-than',
  '?': 'interrogation', '@': 'at-sign', '©': 'copyright',
  '[': 'open-square-brackets', ']': 'close-square-brackets', '_': 'underscore',
  '¡': 'inverted-exclamation', '¿': 'inverted-interrogation', 'º': 'o-ordinal',
  'ª': 'a-ordinal', '…': 'reticences', '⋯': 'mid-reticences',
  'α': 'alpha', 'β': 'beta', 'Σ': 'sigma', 'Ω': 'omega',
  'À': 'A-grave', 'Á': 'A-acute', 'Â': 'A-circumflex', 'Ã': 'A-tilde',
  'Ä': 'A-diaeresis', 'Ç': 'C-cedilla', 'È': 'E-grave', 'É': 'E-acute',
  'Ê': 'E-circumflex', 'Ë': 'E-diaeresis', 'Ẽ': 'E-tilde', 'Ì': 'I-grave',
  'Í': 'I-acute', 'Ï': 'I-diaeresis', 'Î': 'I-circumflex', 'Ò': 'O-grave',
  'Ó': 'O-acute', 'Ô': 'O-circumflex', 'Õ': 'O-tilde', 'Ö': 'O-diaeresis',
  'Ù': 'U-grave', 'Ú': 'U-acute', 'Û': 'U-circumflex', 'Ü': 'U-diaeresis',
  'Ñ': 'N-tilde', 'Ÿ': 'Y-diaeresis',
  'à': 'a-grave', 'á': 'a-acute', 'â': 'a-circumflex', 'ã': 'a-tilde',
  'ä': 'a-diaeresis', 'ç': 'c-cedilla', 'è': 'e-grave', 'é': 'e-acute',
  'ê': 'e-circumflex', 'ẽ': 'e-tilde', 'ë': 'e-diaeresis', 'ì': 'i-grave',
  'í': 'i-acute', 'ï': 'i-diaeresis', 'î': 'i-circumflex', 'ò': 'o-grave',
  'ó': 'o-acute', 'ô': 'o-circumflex', 'õ': 'o-tilde', 'ö': 'o-diaeresis',
  'ù': 'u-grave', 'ú': 'u-acute', 'û': 'u-circumflex', 'ü': 'u-diaeresis',
  'ñ': 'n-tilde', 'ÿ': 'y-diaeresis'
};

function getCharacterClass(character: string): string {
  if (character >= '0' && character <= '9') {
    return `n${character}`;
  }
  if ((character >= 'A' && character <= 'Z') || (character >= 'a' && character <= 'z')) {
    return character;
  }
  return characterClasses[character] ?? 'unknown';
}

interface MmbnPreviewProps {
  strings: string[];
  previewType: string;
  zoom: number;
}

export const MmbnPreview: React.FC<MmbnPreviewProps> = ({ strings, previewType, zoom }) => (
  <div className="mmbn-preview">
    <div id="text-window" data-preview-type={previewType} data-zoom={`${zoom}x`}>
      {strings.map((text, blockIndex) => (
        <span className="block" key={blockIndex}>
          <span className="letters">
            {Array.from(text).map((originalCharacter, characterIndex) => {
              const character = originalCharacter === '\\' ? '"' : originalCharacter;
              return character === '\n'
                ? <br key={characterIndex} />
                : <span
                  className={`letter ${getCharacterClass(character)}`}
                  key={characterIndex}
                >
                  &nbsp;
                </span>;
            })}
          </span>
        </span>
      ))}
    </div>
  </div>
);
