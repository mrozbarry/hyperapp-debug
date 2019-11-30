import test from 'ava';
import jsdom from 'jsdom';

const { JSDOM } = jsdom;

export const browserTest = (name, fn) => {
  test(name, (t) => {
    const dom = new JSDOM();

    global.window = dom.window;

    fn(t);

    global.window.close();
    delete global.window;
  });
};
