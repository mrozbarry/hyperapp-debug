let handle = null;
const ScrollEventsTo = (_dispatch, { eventIndex }) => {
  clearTimeout(handle);
  handle = setTimeout(() => {
    const target = document.querySelector(`.layout-events`);
    if (!target) {
      return;
    }
    const left = (eventIndex * 138);
    target.scrollTo({
      left, // : target.scrollWidth,
      top: 0,
      behavior: 'smooth',
    });
  }, 50);
}

export const scrollEventsTo = props => [ScrollEventsTo, props];
