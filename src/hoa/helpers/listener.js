export default (eventName, fn, bubbles = false) => {
  window.addEventListener(eventName, fn, bubbles);
  return () => {
    window.removeEventListener(eventName, fn);
  };
};
