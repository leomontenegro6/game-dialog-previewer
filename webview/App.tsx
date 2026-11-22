import React from 'react';
import { DialogPreview } from './components/Preview/DialogPreview';
import { CastlevaniaPreview } from './components/Preview/CastlevaniaPreview';
import { PokemonPreview } from './components/Preview/PokemonPreview';
import { MmbnPreview } from './components/Preview/MmbnPreview';
import { usePreviewState } from './usePreviewState';

const gameOptions = [
  { value: 'mmbn1', label: 'MegaMan Battle Network' },
  { value: 'mmbn2', label: 'MegaMan Battle Network 2' },
  { value: 'mmbn3', label: 'MegaMan Battle Network 3' },
  { value: 'mmbn4', label: 'MegaMan Battle Network 4' },
  { value: 'mmbn5', label: 'MegaMan Battle Network 5' },
  { value: 'castlevania', label: 'Castlevania: Dawn of Sorrow' },
  { value: 'mzm-vanilla', label: 'Metroid Zero Mission' },
  { value: 'mf-vanilla', label: 'Metroid Fusion' },
  { value: 'pokemon', label: 'Pokémon RBY / GSC' }
];

const gameGroups = [
  { label: 'MMBN', options: gameOptions.slice(0, 5) },
  { label: 'Castlevania', options: gameOptions.slice(5, 6) },
  { label: 'Metroid', options: gameOptions.slice(6, 8) },
  { label: 'Pokemon', options: gameOptions.slice(8) }
];

const mmbnPreviewOptions: Record<string, Array<{ value: string; label: string }>> = {
  mmbn1: [
    { value: 'mmbn1_dialogues', label: 'Dialogues' },
    { value: 'mmbn1_chips', label: 'Chips' }
  ],
  mmbn2: [
    { value: 'mmbn2_dialogues', label: 'Dialogues' },
    { value: 'mmbn2_dialogues_vwf', label: 'Dialogues (VWF)' },
    { value: 'mmbn2_chips', label: 'Chips' },
    { value: 'mmbn2_chips_vwf', label: 'Chips (VWF)' }
  ],
  mmbn3: [
    { value: 'mmbn3_dialogues', label: 'Dialogues' },
    { value: 'mmbn3_dialogues_vwf', label: 'Dialogues (VWF)' },
    { value: 'mmbn3_chips', label: 'Chips' },
    { value: 'mmbn3_chips_vwf', label: 'Chips (VWF)' }
  ],
  mmbn4: [
    { value: 'mmbn4_dialogues', label: 'Dialogues' },
    { value: 'mmbn4_dialogues_vwf_ptbr', label: 'Dialogues (VWF PT-BR)' },
    { value: 'mmbn4_chips', label: 'Chips' }
  ],
  mmbn5: [
    { value: 'mmbn5_dialogues', label: 'Dialogues' },
    { value: 'mmbn5_dialogues_vwf_ptbr', label: 'Dialogues (VWF PT-BR)' },
    { value: 'mmbn5_chips', label: 'Chips' }
  ]
};

const dialogOptions = [
  { value: 'mfdialog', label: 'MF Dialog' },
  { value: 'multilines-black', label: 'Multilines (Black)' },
  { value: 'multilines-elevator', label: 'Multilines (Elevator)' },
  { value: 'multilines-zerosuit', label: 'Multilines (Zero Suit)' },
  { value: 'twolines', label: 'Twolines' }
];

function getExpectedFormat(game: string): string {
  if (game.startsWith('mmbn')) {
    return '.tpl or .tlp';
  }
  if (game === 'castlevania') {
    return '.csv';
  }
  return '.asm';
}

export const App: React.FC = () => {
  const { configuration, preview, initialized, updateConfiguration } = usePreviewState();
  const game = configuration.game;
  const isMmbn = game.startsWith('mmbn');
  const isMetroid = game.startsWith('mzm-') || game.startsWith('mf-');
  const isPokemon = game === 'pokemon';
  const selectedMetroidFontType = game === 'mzm-vanilla'
    ? configuration.metroidFontType === 'projectzm' ? 'projectzm' : 'vanilla'
    : configuration.metroidFontType === 'mzmlike' ? 'mzmlike' : 'vanilla';
  const metroidGameType = game === 'mzm-vanilla'
    ? selectedMetroidFontType === 'projectzm' ? 'mzm-projectzm' : 'mzm-vanilla'
    : selectedMetroidFontType === 'mzmlike' ? 'mf-mzmlike' : 'mf-vanilla';
  const previewOptions = mmbnPreviewOptions[game] ?? [];
  const selectedMmbnPreviewType = previewOptions.some(
    (option) => option.value === configuration.mmbnPreviewType
  )
    ? configuration.mmbnPreviewType
    : previewOptions[0]?.value;

  const changeGame = (newGame: string) => {
    updateConfiguration('game', newGame);
    if (
      (newGame === 'mzm-vanilla' && configuration.metroidFontType === 'mzmlike')
      || (newGame === 'mf-vanilla' && configuration.metroidFontType === 'projectzm')
    ) {
      updateConfiguration('metroidFontType', 'vanilla');
    }
    const newPreviewOptions = mmbnPreviewOptions[newGame];
    if (newPreviewOptions && !newPreviewOptions.some(
      (option) => option.value === configuration.mmbnPreviewType
    )) {
      updateConfiguration('mmbnPreviewType', newPreviewOptions[0].value);
    }
  };

  if (!initialized) {
    return <main className="app-shell">Loading preview settings...</main>;
  }

  return (
    <main className="app-shell">
      <div className="controls">
        <label className="control-group">
          <span>Game</span>
          <select value={game} onChange={(event) => changeGame(event.target.value)}>
            {gameGroups.map((group) => (
              <optgroup label={group.label} key={group.label}>
                {group.options.map((option) => (
                  <option value={option.value} key={option.value}>{option.label}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>

        {isMmbn && (
          <label className="control-group">
            <span>Preview</span>
            <select
              value={selectedMmbnPreviewType}
              onChange={(event) => updateConfiguration('mmbnPreviewType', event.target.value)}
            >
              {previewOptions.map((option) => (
                <option value={option.value} key={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
        )}

        {isMetroid && (
          <label className="control-group">
            <span>Dialog</span>
            <select
              value={configuration.metroidDialogType}
              onChange={(event) => updateConfiguration('metroidDialogType', event.target.value)}
            >
              {dialogOptions.map((option) => (
                <option value={option.value} key={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
        )}

        {isMetroid && (
          <label className="control-group">
            <span>Font type</span>
            <select
              value={selectedMetroidFontType}
              onChange={(event) => updateConfiguration('metroidFontType', event.target.value)}
            >
              {game === 'mzm-vanilla' ? (
                <>
                  <option value="vanilla">Vanilla</option>
                  <option value="projectzm">ProjectZM</option>
                </>
              ) : (
                <>
                  <option value="vanilla">Vanilla</option>
                  <option value="mzmlike">MZM-like</option>
                </>
              )}
            </select>
          </label>
        )}

        {isPokemon && (
          <label className="control-group">
            <span>Preview type</span>
            <select
              value={configuration.pokemonPreviewType}
              onChange={(event) => updateConfiguration('pokemonPreviewType', event.target.value)}
            >
              <option value="pokemon_cwf_og">CWF (Original)</option>
              <option value="pokemon_vwf_gen1recomp">VWF (gen1recomp)</option>
            </select>
          </label>
        )}

      {game !== 'castlevania' && (
          <label className="control-group">
            <span>Zoom</span>
            <select
              value={configuration.zoom}
              onChange={(event) => updateConfiguration('zoom', Number(event.target.value))}
            >
              {[1, 2, 3].map((zoom) => <option value={zoom} key={zoom}>{zoom}x</option>)}
            </select>
          </label>
        )}
      </div>

      {preview.status === 'ready' && isMmbn && (
        <MmbnPreview
          strings={preview.strings}
          previewType={selectedMmbnPreviewType ?? 'mmbn1_dialogues'}
          zoom={configuration.zoom}
        />
      )}
      {preview.status === 'ready' && game === 'castlevania' && (
        <CastlevaniaPreview strings={preview.strings} />
      )}
      {preview.status === 'ready' && isMetroid && (
        <div className="metroid-preview">
          <DialogPreview
            currentLine={{
              fileName: preview.fileName ?? '',
              lineNumber: 0,
              column: 0,
              blockName: preview.blockName ?? null,
              strings: preview.strings,
              timestamp: ''
            }}
            gameType={metroidGameType}
            dialogType={configuration.metroidDialogType}
            zoom={configuration.zoom}
          />
        </div>
      )}
      {preview.status === 'ready' && isPokemon && (
        <PokemonPreview
          windows={preview.pokemonWindows ?? (preview.strings.length > 0
            ? [{ lines: preview.strings.slice(0, 2), continuation: false }]
            : [])}
          previewType={configuration.pokemonPreviewType}
          zoom={configuration.zoom}
        />
      )}

      {preview.status !== 'ready' && (
        <div className="preview-message">
          {preview.status === 'no-editor' && 'Open a supported script and place the cursor in a dialogue block.'}
          {preview.status === 'unsupported-file' && `This game expects ${preview.expectedExtension ?? getExpectedFormat(game)} files.`}
          {preview.status === 'no-block' && 'No previewable text block was found at the cursor.'}
          {preview.fileName && <small>{preview.fileName}</small>}
        </div>
      )}
    </main>
  );
};
