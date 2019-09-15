chrome.devtools.panels
  .create(
    'Hyperapp Dev Tools',
    '/icons/hyperapp.jpg',
    '/panel/index.html',
    (panel) => {
      console.log('[panel]', 'created', panel);

      const port = chrome.runtime.connect({ name: 'panel' });

      panel.onShown.addListener(() => {
        console.log('[devtool]', '------ panel shown ------');
        port.postMessage({
          target: 'app',
          type: 'message',
          payload: {
            action: 'fire-messages',
          },
        });
      });

      panel.onHidden.addListener(() => {
        console.log('[devtool]', '------ panel hidden ------');
        port.postMessage({
          target: 'app',
          type: 'message',
          payload: {
            action: 'queue-messages',
          },
        });
      });
    }
  );
