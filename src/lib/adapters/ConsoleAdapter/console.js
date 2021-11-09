export class Console {
  constructor(data = []) {
    this.data = data;
  }

  append(...data) {
    return new Console(
      [...this.data, ...data.filter(d => d !== undefined)],
    );
  }

  text(...data) {
    return this.append(...data);
  }

  style(string, ...styles) {
    return new Console(
      [...this.data, string, ...styles],
    );
  }

  output(type) {
    console[type](...this.data);
    return new Console();
  }

  log() {
    return this.output('log');
  }

  info() {
    return this.output('info');
  }

  warn() {
    return this.output('warn');
  }

  group(groupFn) {
    console.group(...this.data);
    groupFn();
    console.groupEnd();
    return this;
  }

  groupCollapsed(groupFn) {
    console.groupCollapsed(...this.data);
    groupFn();
    console.groupEnd();
    return this;
  }
}

