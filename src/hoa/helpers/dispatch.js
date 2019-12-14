import { serialize as serializeObject } from './serialize';

export const serialize = (action, props) => ({
  action: serializeObject(action),
  props: serializeObject(props),
});
