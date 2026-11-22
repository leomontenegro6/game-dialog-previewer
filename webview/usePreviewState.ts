import { useEffect, useState } from 'react';
import type { PreviewConfiguration, PreviewData } from '../src/types';
import type { PreviewMessage } from './types';

const vscodeApi = acquireVsCodeApi();

const defaults: PreviewConfiguration = {
  game: 'mmbn1',
  mmbnPreviewType: 'mmbn1_dialogues',
  zoom: 2,
  metroidDialogType: 'twolines',
  pokemonPreviewType: 'pokemon_cwf_og'
};

export function usePreviewState() {
  const [configuration, setConfiguration] = useState(defaults);
  const [preview, setPreview] = useState<PreviewData>({
    status: 'no-editor',
    game: defaults.game,
    strings: []
  });
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const onMessage = (event: MessageEvent<PreviewMessage>) => {
      const message = event.data;
      if (message.type === 'initialize' && message.configuration && message.preview) {
        setConfiguration(message.configuration);
        setPreview(message.preview);
        setInitialized(true);
      } else if (message.type === 'configuration' && message.data) {
        setConfiguration(message.data);
      } else if (message.type === 'preview' && message.data) {
        setPreview(message.data);
      }
    };

    window.addEventListener('message', onMessage);
    vscodeApi.postMessage({ type: 'ready' });
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const updateConfiguration = (key: keyof PreviewConfiguration, value: string | number) => {
    setConfiguration((current) => ({ ...current, [key]: value }));
    vscodeApi.postMessage({ type: 'updateConfig', key, value });
  };

  return { configuration, preview, initialized, updateConfiguration };
}
