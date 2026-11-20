import React from 'react';

const characterClasses: Record<string, string> = {
  ' ': 'space', '!': 'exclamation', '"': 'double-quotes', '#': 'hashtag',
  '$': 'money-sign', '%': 'percent', '&': 'ampersand', "'": 'quotes',
  '(': 'open-parenthesis', ')': 'close-parenthesis', '*': 'asterisk',
  '+': 'plus', ',': 'comma', '-': 'minus', '.': 'dot', '/': 'slash',
  ':': 'colon', ';': 'semicolon', '<': 'less-than', '=': 'equal', '>': 'greater-than',
  '?': 'interrogation', '@': 'at-sign', '©': 'copyright', '[': 'open-square-brackets',
  '\\': 'backslash', ']': 'close-square-brackets', '^': 'circumflex',
  '_': 'underscore', '¡': 'inverted-exclamation', '¿': 'inverted-interrogation',
  'º': 'o-ordinal', 'ª': 'a-ordinal', '…': 'reticences',
  'α': 'alpha', 'β': 'beta', 'Σ': 'sigma', 'Ω': 'omega',
  '{': 'open-curly-brackets', '|': 'pipe', '}': 'close-curly-brackets',
  '~': 'tilde', '·': 'middot',
  'À': 'A-grave', 'Á': 'A-acute', 'Â': 'A-circumflex', 'Ã': 'A-tilde',
  'Ç': 'C-cedilla', 'É': 'E-acute', 'Ê': 'E-circumflex', 'Í': 'I-acute',
  'Ó': 'O-acute', 'Ô': 'O-circumflex', 'Ò': 'O-grave', 'Õ': 'O-tilde',
  'Ú': 'U-acute', 'Ü': 'U-diaeresis',
  'à': 'a-grave', 'á': 'a-acute', 'â': 'a-circumflex', 'ã': 'a-tilde',
  'ç': 'c-cedilla', 'é': 'e-acute', 'ê': 'e-circumflex', 'í': 'i-acute',
  'ó': 'o-acute', 'ô': 'o-circumflex', 'ò': 'o-grave', 'õ': 'o-tilde',
  'ú': 'u-acute', 'ü': 'u-diaeresis'
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

interface CastlevaniaPreviewProps {
  strings: string[];
}

function renderLetters(text: string): React.ReactNode[] {
  return Array.from(text).map((character, characterIndex) => {
    if (character === '\n') {
      return <br key={characterIndex} />;
    }

    return (
      <span className={`letter ${getCharacterClass(character)}`} key={characterIndex}>
        &nbsp;
      </span>
    );
  });
}

export const CastlevaniaPreview: React.FC<CastlevaniaPreviewProps> = ({ strings }) => (
  <div className="castlevania-preview">
    <div id="text-window">
      {strings.map((text, blockIndex) => (
        <span className="block" key={blockIndex}>
          <span className="letters">{renderLetters(text)}</span>
        </span>
      ))}
    </div>
  </div>
);
