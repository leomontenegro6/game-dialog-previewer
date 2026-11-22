import * as path from 'path';
import * as vscode from 'vscode';
import { parseCastlevaniaBlock } from './parsers/castlevania';
import { parseMetroidBlock } from './parsers/metroid';
import { parsePokemonBlock } from './parsers/pokemon';
import { parseMmbnBlock } from './parsers/mmbn';
import { PreviewerProvider } from './previewerProvider';
import { GameId, PokemonPreviewType, PreviewConfiguration, PreviewData, gameIds, isGameId } from './types';

const defaultConfiguration: PreviewConfiguration = {
  game: 'mmbn1',
  mmbnPreviewType: 'mmbn1_dialogues',
  zoom: 2,
  metroidDialogType: 'twolines',
  pokemonPreviewType: 'pokemon_cwf_og'
};

function normalizePokemonPreviewType(value: unknown): PokemonPreviewType {
  switch (value) {
    case 'pokemon_vwf_gen1recomp':
    case 'pokemon_gen2_vwf_asm':
    case 'pokemon_gen2_vwf_lua':
      return 'pokemon_vwf_gen1recomp';
    case 'pokemon_cwf_og':
    case 'pokemon_gen2_asm':
    case 'pokemon_gen2_lua':
      return 'pokemon_cwf_og';
    default:
      return defaultConfiguration.pokemonPreviewType;
  }
}

function getConfiguration(): PreviewConfiguration {
  const settings = vscode.workspace.getConfiguration('gameDialogPreviewer');
  const selectedGame = settings.get<unknown>('game');
  const normalizedGame = selectedGame === 'cdos'
    ? 'castlevania'
    : selectedGame === 'pokemon-gen1' || selectedGame === 'pokemon-gen2'
      ? 'pokemon'
      : selectedGame;
  const previewType = settings.get<string>('mmbnPreviewType', defaultConfiguration.mmbnPreviewType);
  const zoom = settings.get<number>('zoom', defaultConfiguration.zoom);
  const dialogType = settings.get<string>('metroidDialogType', defaultConfiguration.metroidDialogType);
  const pokemonPreviewType = normalizePokemonPreviewType(settings.get<unknown>('pokemonPreviewType'));

  return {
    game: isGameId(normalizedGame) ? normalizedGame : defaultConfiguration.game,
    mmbnPreviewType: previewType,
    zoom: zoom === 1 || zoom === 2 || zoom === 3 ? zoom : defaultConfiguration.zoom,
    metroidDialogType: dialogType,
    pokemonPreviewType
  };
}

function getFileExpectation(
  game: GameId,
  pokemonPreviewType: PokemonPreviewType
): { extension: string; expected: string } {
  if (game.startsWith('mmbn')) {
    return { extension: '.tpl', expected: '.tpl or .tlp' };
  }
  if (game === 'castlevania') {
    return { extension: '.csv', expected: '.csv' };
  }
  if (game === 'pokemon') {
    return { extension: '.asm', expected: '.asm or .lua' };
  }
  return { extension: '.asm', expected: '.asm' };
}

function createPreview(
  editor: vscode.TextEditor | undefined,
  game: GameId,
  pokemonPreviewType: PokemonPreviewType
): PreviewData {
  if (!editor) {
    return { status: 'no-editor', game, strings: [] };
  }

  const fileName = path.basename(editor.document.fileName);
  const extension = path.extname(fileName).toLowerCase();
  const expectation = getFileExpectation(game, pokemonPreviewType);
  const isMmbnFile = game.startsWith('mmbn') && (extension === '.tpl' || extension === '.tlp');
  const isPokemonFile = game === 'pokemon' && (extension === '.asm' || extension === '.lua');
  const isOtherSupportedFile = !game.startsWith('mmbn')
    && game !== 'pokemon'
    && extension === expectation.extension;

  if (!isMmbnFile && !isPokemonFile && !isOtherSupportedFile) {
    return {
      status: 'unsupported-file',
      game,
      fileName,
      strings: [],
      expectedExtension: expectation.expected
    };
  }

  const lines = editor.document.getText().split(/\r?\n/);
  const currentLine = editor.selection.active.line;

  if (game.startsWith('mmbn')) {
    const strings = parseMmbnBlock(lines, currentLine);
    return {
      status: strings.length > 0 ? 'ready' : 'no-block',
      game,
      fileName,
      strings
    };
  }

  if (game === 'castlevania') {
    const text = parseCastlevaniaBlock(lines, currentLine);
    return {
      status: text.length > 0 ? 'ready' : 'no-block',
      game,
      fileName,
      strings: text ? [text] : []
    };
  }

  if (game === 'pokemon') {
    const block = parsePokemonBlock(
      lines,
      currentLine,
      extension === '.lua' ? 'lua' : 'asm'
    );
    return {
      status: block.blockName && block.windows.length > 0 ? 'ready' : 'no-block',
      game,
      fileName,
      blockName: block.blockName ?? undefined,
      strings: block.windows.flatMap((window) => window.lines),
      pokemonWindows: block.windows
    };
  }

  const block = parseMetroidBlock(lines, currentLine);
  return {
    status: block.blockName && block.strings.length > 0 ? 'ready' : 'no-block',
    game,
    fileName,
    blockName: block.blockName ?? undefined,
    strings: block.strings
  };
}

function isConfigurationKey(
  value: string
): value is 'game' | 'mmbnPreviewType' | 'zoom' | 'metroidDialogType' | 'pokemonPreviewType' {
  return value === 'game'
    || value === 'mmbnPreviewType'
    || value === 'zoom'
    || value === 'metroidDialogType'
    || value === 'pokemonPreviewType';
}

export function activate(context: vscode.ExtensionContext): void {
  let configuration = getConfiguration();
  let activeEditor = vscode.window.activeTextEditor;
  let refreshTimer: NodeJS.Timeout | undefined;

  const provider = new PreviewerProvider(
    context.extensionUri,
    configuration,
    (key, value) => {
      if (!isConfigurationKey(key)) {
        return;
      }

      void vscode.workspace.getConfiguration('gameDialogPreviewer')
        .update(key, value, vscode.ConfigurationTarget.Global)
        .then(() => {
          configuration = getConfiguration();
          provider.updateConfiguration(configuration);
          refreshPreview();
        }, (error: unknown) => {
          const detail = error instanceof Error ? error.message : String(error);
          void vscode.window.showErrorMessage(`Could not save preview settings: ${detail}`);
        });
    }
  );

  const refreshPreview = (editor = activeEditor) => {
    if (refreshTimer) {
      clearTimeout(refreshTimer);
    }

    refreshTimer = setTimeout(() => {
      configuration = getConfiguration();
      provider.updatePreview(createPreview(editor, configuration.game, configuration.pokemonPreviewType));
    }, 100);
  };

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(PreviewerProvider.viewType, provider),
    vscode.commands.registerCommand('gameDialogPreviewer.refresh', () => refreshPreview()),
    vscode.window.onDidChangeTextEditorSelection((event) => {
      activeEditor = event.textEditor;
      refreshPreview(activeEditor);
    }),
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      activeEditor = editor;
      refreshPreview(editor);
    }),
    vscode.workspace.onDidChangeTextDocument((event) => {
      if (activeEditor && event.document.uri.toString() === activeEditor.document.uri.toString()) {
        refreshPreview(activeEditor);
      }
    })
  );

  refreshPreview();
}

export function deactivate(): void { }
