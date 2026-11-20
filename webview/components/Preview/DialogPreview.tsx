import React from 'react';
import { CursorInfo } from '../../types';
import { TextRenderer } from './TextRenderer';
import { CenterCalculator } from '../Calculator/CenterCalculator';
import { parseColorTags } from '../../utils/textProcessing';
import { getWindowSpriteUri } from '../../utils/spriteUtils';

interface DialogPreviewProps {
  currentLine: CursorInfo;
  gameType: string;
  dialogType: string;
  zoom: number;
}

export const DialogPreview: React.FC<DialogPreviewProps> = ({
  currentLine,
  gameType,
  dialogType,
  zoom
}) => {
  const renderLines = () => {
    if (dialogType === 'mfdialog') {
      return currentLine.strings.slice(0, 2).map((text, index) => (
        <div key={index} className="preview-line">
          <TextRenderer text={text} gameType={gameType} dialogType={dialogType} maxWidth={240} />
        </div>
      ));
    }

    if (dialogType.startsWith('multilines')) {
      const topMargin = dialogType === 'multilines-black' || dialogType === 'multilines-zerosuit'
        ? Math.max(0, (144 - currentLine.strings.length * 16) / 2)
        : 0;
      return (
        <div style={{ marginTop: `${topMargin}px` }}>
          {currentLine.strings.map((text, index) => (
            <div key={index} className="preview-line">
              <TextRenderer text={text} gameType={gameType} dialogType={dialogType} maxWidth={240} />
            </div>
          ))}
        </div>
      );
    }

    return currentLine.strings.slice(0, 2).map((text, index) => {
      const segments = parseColorTags(text);
      const centerValue = segments[0]?.centerValue ?? 0;
      return (
        <div key={index} className="preview-line" style={{ paddingLeft: `${centerValue}px` }}>
          <TextRenderer text={text} gameType={gameType} dialogType={dialogType} maxWidth={240} />
        </div>
      );
    });
  };

  const height = dialogType === 'mfdialog' ? 64 : dialogType.startsWith('multilines') ? 160 : 70;
  const padding = dialogType === 'mfdialog'
    ? '24px 8px'
    : dialogType.startsWith('multilines')
      ? '8px'
      : '38px 8px';

  return (
    <div>
      <div
        className="preview-container"
        style={{
          backgroundImage: `url("${getWindowSpriteUri(dialogType)}")`,
          transform: `scale(${zoom})`,
          height: `${height}px`
        }}
      >
        <div className="preview-content" style={{ padding }}>
          {renderLines()}
        </div>
      </div>
      {dialogType === 'twolines' && (
        <CenterCalculator strings={currentLine.strings} gameType={gameType} zoom={zoom} />
      )}
    </div>
  );
};
