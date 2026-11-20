import * as path from 'path';
import * as vscode from 'vscode';
import { parseCastlevaniaBlock } from './parsers/castlevania';
import { parseMetroidBlock } from './parsers/metroid';
import { parseMmbnBlock } from './parsers/mmbn';
import { PreviewerProvider } from './previewerProvider';
import { GameId, PreviewConfiguration, PreviewData, gameIds, isGameId } from './types';

const defaultConfiguration: PreviewConfiguration = {
  game: 'mmbn1',
  mmbnPreviewType: 'mmbn1_dialogues',
  zoom: 2,
  metroidDialogType: 'twolines'
};

function getConfiguration(): PreviewConfiguration {
  const settings = vscode.workspace.getConfiguration('gameDialogPreviewer');
  const selectedGame = settings.get<unknown>('game');
  const normalizedGame = selectedGame === 'cdos' ? 'castlevania' : selectedGame;
  const previewType = settings.get<string>('mmbnPreviewType', defaultConfiguration.mmbnPreviewType);
  const zoom = settings.get<number>('zoom', defaultConfiguration.zoom);
  const dialogType = settings.get<string>('metroidDialogType', defaultConfiguration.metroidDialogType);

  return {
    game: isGameId(normalizedGame) ? normalizedGame : defaultConfiguration.game,
    mmbnPreviewType: previewType,
    zoom: zoom === 1 || zoom === 2 || zoom === 3 ? zoom : defaultConfiguration.zoom,
    metroidDialogType: dialogType
  };
}

function getFileExpectation(game: GameId): { extension: string; expected: string } {
  if (game.startsWith('mmbn')) {
    return { extension: '.tpl', expected: '.tpl or .tlp' };
  }
  if (game === 'castlevania') {
    return { extension: '.csv', expected: '.csv' };
  }
  return { extension: '.asm', expected: '.asm' };
}

function createPreview(
  editor: vscode.TextEditor | undefined,
  game: GameId
): PreviewData {
  if (!editor) {
    return { status: 'no-editor', game, strings: [] };
  }

  const fileName = path.basename(editor.document.fileName);
  const extension = path.extname(fileName).toLowerCase();
  const expectation = getFileExpectation(game);
  const isMmbnFile = game.startsWith('mmbn') && (extension === '.tpl' || extension === '.tlp');

  if (!isMmbnFile && extension !== expectation.extension) {
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
): value is 'game' | 'mmbnPreviewType' | 'zoom' | 'metroidDialogType' {
  return value === 'game'
    || value === 'mmbnPreviewType'
    || value === 'zoom'
    || value === 'metroidDialogType';
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
      provider.updatePreview(createPreview(editor, configuration.game));
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
