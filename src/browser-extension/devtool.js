chrome.devtools.panels
  .create(
    'Hyperapp Dev Tools',
    '/icons/hyperapp.jpg',
    '/panel/index.html',
    (panel) => {
      console.log('panel created', panel);

      panel.onShown.addListener(() => {
      });

      panel.onHidden.addListener(() => {
      });
    }
  );
