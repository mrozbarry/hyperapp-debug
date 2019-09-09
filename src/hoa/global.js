window.__HYPERAPP_V2_DEBUG__ = window.__HYPERAPP_V2_DEBUG__ || {
  registerApp: (domElement) => {
    const self = window.__HYPERAPP_V2_DEBUG__;
    const id = Math.random().toString(36).slice(2);

    if (self.apps[id]) {
      console.warn('Unable to register second app with id', id);
      return self.apps[id];
    }

    const broadcastEvent = (event) => {
      console.log({ ...event, $appId: id });
      // for(const cb of self.apps[id].listeners) {
      //   cb({ ...event, $appId: id });
      // }
    };

    const deregister = () => {
      delete self.apps[id];
    };

    self.apps[id] = {
      listeners: [],
      domElement,
      broadcastEvent,
      deregister,
    };

    return self.apps[id];
  },
  apps: {},
};
