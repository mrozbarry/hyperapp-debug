import './index.styl';
import { h } from 'hyperapp';
import * as Debug from './debug';

export const debug = (app) => (appState, appActions, appView, ...rest) => {
  const div = document.createElement('div');
  div.id = "hyperapp-debugger"
  document.body.appendChild(div);
  const debug = app(Debug.initialState, Debug.actions, Debug.view, div);

  const realApp = app(
    appState,
    { ...appActions, $debugSetState: state => state },
    (state, actions) => (
      h('div', {
        onupdate: () => debug.pushState(state),
      }, [appView(state, actions)])
    ),
    ...rest
  );

  debug.importAppActions(realApp);
  debug.pushState(appState);

  return realApp;
};
