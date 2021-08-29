import * as hljs from 'highlight.js/lib/core';
import jsonLang from 'highlight.js/lib/languages/json';
import 'highlight.js/styles/github.css';

hljs.registerLanguage('json', jsonLang);

const highlightFx = (dispatch, { state, language, onRender }) => {
  dispatch(onRender, hljs.highlight(JSON.stringify(state, null, 2), { language }).value);
};
export const highlight = props => [highlightFx, props];
