import * as vscode from 'vscode';
import { PreviewConfiguration, PreviewData, isGameId } from './types';

const mmbnPreviewTypes = [
  'mmbn1_dialogues',
  'mmbn1_chips',
  'mmbn2_dialogues',
  'mmbn2_dialogues_vwf',
  'mmbn2_chips',
  'mmbn2_chips_vwf',
  'mmbn3_dialogues',
  'mmbn3_dialogues_vwf',
  'mmbn3_chips',
  'mmbn3_chips_vwf',
  'mmbn4_dialogues',
  'mmbn4_dialogues_vwf_ptbr',
  'mmbn4_chips',
  'mmbn5_dialogues',
  'mmbn5_dialogues_vwf_ptbr',
  'mmbn5_chips'
];

const metroidDialogTypes = [
  'mfdialog',
  'multilines-black',
  'multilines-elevator',
  'multilines-zerosuit',
  'twolines'
];

const pokemonPreviewTypes = [
  'pokemon_cwf_og',
  'pokemon_vwf_gen1recomp',
  'pokemon_gen2_asm',
  'pokemon_gen2_lua',
  'pokemon_gen2_vwf_asm',
  'pokemon_gen2_vwf_lua'
];

interface ConfigurationMessage {
  type: 'updateConfig';
  key: 'game' | 'mmbnPreviewType' | 'zoom' | 'metroidDialogType' | 'pokemonPreviewType';
  value: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isConfigurationMessage(value: unknown): value is ConfigurationMessage {
  if (!isRecord(value) || value.type !== 'updateConfig') {
    return false;
  }

  return value.key === 'game'
    || value.key === 'mmbnPreviewType'
    || value.key === 'zoom'
    || value.key === 'metroidDialogType'
    || value.key === 'pokemonPreviewType';
}

function isValidValue(key: ConfigurationMessage['key'], value: unknown): boolean {
  switch (key) {
    case 'game':
      return isGameId(value);
    case 'mmbnPreviewType':
      return typeof value === 'string' && mmbnPreviewTypes.includes(value);
    case 'zoom':
      return value === 1 || value === 2 || value === 3;
    case 'metroidDialogType':
      return typeof value === 'string' && metroidDialogTypes.includes(value);
    case 'pokemonPreviewType':
      return typeof value === 'string' && pokemonPreviewTypes.includes(value);
  }
}

export class PreviewerProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'gameDialogPreviewer.preview';

  private view?: vscode.WebviewView;
  private configuration: PreviewConfiguration;
  private preview: PreviewData;

  constructor(
    private readonly extensionUri: vscode.Uri,
    configuration: PreviewConfiguration,
    private readonly onConfigurationChange: (
      key: ConfigurationMessage['key'],
      value: string | number
    ) => void
  ) {
    this.configuration = configuration;
    this.preview = {
      status: 'no-editor',
      game: configuration.game,
      strings: []
    };
  }

  public resolveWebviewView(view: vscode.WebviewView): void {
    this.view = view;
    view.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri]
    };
    view.webview.html = this.getHtml(view.webview);

    const messageListener = view.webview.onDidReceiveMessage((message: unknown) => {
      if (isRecord(message) && message.type === 'ready') {
        this.sendInitialState();
        return;
      }

      if (
        isConfigurationMessage(message)
        && isValidValue(message.key, message.value)
        && (typeof message.value === 'string' || typeof message.value === 'number')
      ) {
        this.onConfigurationChange(message.key, message.value);
      }
    });
    view.onDidDispose(() => {
      messageListener.dispose();
      this.view = undefined;
    });
  }

  public updateConfiguration(configuration: PreviewConfiguration): void {
    this.configuration = configuration;
    this.postMessage({
      type: 'configuration',
      data: configuration
    });
  }

  public updatePreview(preview: PreviewData): void {
    this.preview = preview;
    this.postMessage({
      type: 'preview',
      data: preview
    });
  }

  private sendInitialState(): void {
    this.postMessage({
      type: 'initialize',
      configuration: this.configuration,
      preview: this.preview
    });
  }

  private postMessage(message: unknown): void {
    if (this.view) {
      void this.view.webview.postMessage(message);
    }
  }

  private getHtml(webview: vscode.Webview): string {
    const nonce = this.getNonce();
    const resource = (...segments: string[]) => webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, ...segments)
    );
    const styleUris = [
      resource('webview', 'styles', 'mmbn', 'preview.css'),
      resource('webview', 'styles', 'metroid', 'preview.css'),
      ...['mmbn1', 'mmbn2', 'mmbn3', 'mmbn4', 'mmbn5'].map((game) =>
        resource('webview', 'styles', 'mmbn', game, 'preview.css')
      ),
      resource('webview', 'styles', 'castlevania', 'preview.css'),
      resource('webview', 'styles', 'pokemon', 'preview.css')
    ];
    const links = styleUris
      .map((uri) => `<link rel="stylesheet" href="${uri}">`)
      .join('\n');
    const assetsBase = resource('assets').toString().replace(/\/$/, '');
    const scriptUri = resource('dist', 'webview.js');
    const stylesUri = resource('dist', 'styles.css');

    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} data:; font-src ${webview.cspSource} data:; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
        <link rel="stylesheet" href="${stylesUri}">
        ${links}
      </head>
      <body>
        <div id="root" data-assets-base="${assetsBase}"></div>
        <script nonce="${nonce}" src="${scriptUri}"></script>
      </body>
      </html>`;
  }

  private getNonce(): string {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length: 32 }, () =>
      possible.charAt(Math.floor(Math.random() * possible.length))
    ).join('');
  }
}
