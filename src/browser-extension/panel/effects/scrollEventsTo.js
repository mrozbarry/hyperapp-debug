let handle = null;
const ScrollEventsTo = (_dispatch, { eventIndex }) => {
  clearTimeout(handle);
  handle = setTimeout(() => {
    const target = document.querySelector(`.layout-events`);
    if (!target) {
      return;
    }
    console.log('scrolling', target, target.scrollWidth);
    target.scrollTo({
      left: target.scrollWidth,
      top: 0,
      behavior: 'smooth',
    });
  }, 100);
}

export const scrollEventsTo = props => [ScrollEventsTo, props];
