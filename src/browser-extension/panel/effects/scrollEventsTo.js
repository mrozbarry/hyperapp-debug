let handle = null;
const ScrollEventsTo = (_dispatch, { eventIndex, animate }) => {
  clearTimeout(handle);
  handle = setTimeout(() => {
    const target = document.querySelector('.layout-events .stream-container');
    if (!target) {
      return;
    }
    const left = (eventIndex * 138);
    target.scrollTo({
      left, // : target.scrollWidth,
      top: 0,
      behavior: animate ? 'smooth' : 'auto',
    });
  }, 50);
};

export const scrollEventsTo = props => [ScrollEventsTo, props];
