const Table = require('cli-table');

/** @typedef {{timestamp: number, name: string}} TimelineRecord */

const makeTimelineTable = () => new Table({
  head: ['Name', 'Elapsed', 'Total', 'Timestamp'],
  // colWidths: [100, 100, 100, 100]
});

const makeProfilerTable = () => new Table({
  head: ['Function', 'Average', 'Total', 'Called']
});

function z(num, digits = 2) {
  const str = num.toString();
  digits -= str.length;
  const zeros = [];
  while (digits--) {
    zeros.push('0');
  }
  return `${ zeros.join('') }${ str }`;
}

function printTimestamp(timestamp) {
  const d = new Date(timestamp);
  return `${ z(d.getHours()) }:${ z(d.getMinutes()) }:${ z(d.getSeconds()) }:${ z(d.getMilliseconds(), 3) }`;
}

export class Timeline {
  constructor (timelineName) {
    /**
     * @type {TimelineRecord[]}
     */
    this.records = [];
    this.name = timelineName;
    Timeline.timelines[timelineName] = this;
    /** @type {(Timeline|Profiler)[]}*/
    this.linkedInstances = [];
  }

  /**
   * 
   * @param {string} timelineName 
   * @returns {Timeline}
   */
  static get(timelineName) {
    return Timeline.timelines[timelineName] || new Timeline(timelineName);
  }

  add(name = 'entry') {
    this.records.push({ timestamp: Date.now(), name });
  }

  addEnd(name = 'entry', log = console.log, deleteFromTimelines = true) {
    this.add(name);
    this.end(log, deleteFromTimelines);
  }

  /**
   * 
   * @param {string} name 
   * @param {Promise} promise 
   */
  addPromise(name, promise) {
    const add = this.add.bind(this);
    add(name);

    return new Promise(function (resolve, reject) {
      promise.then((...args) => {
        add(name + ' resolved');
        resolve(...args);
      })
        .catch(error => {
          add(name + ' rejected');
          reject(error);
        });
    });
  }

  end(log = console.log, deleteFromTimelines = true) {
    const table = makeTimelineTable();

    log(`********** Timeline: ${ this.name } **********\n`);

    const firstEntry = this.records[0].timestamp;
    let lastEntry = firstEntry;
    this.records.forEach(({ timestamp, name }) => {
      //log(`\t${timestamp}\t+${timestamp - lastEntry} ms\ttot: ${(timestamp - firstEntry) / 1000} s\t${name}`);
      table.push([name, timestamp - lastEntry, timestamp - firstEntry, printTimestamp(timestamp)]);
      lastEntry = timestamp;
    });
    log(table.toString());
    log();
    log(`Total Timeline Time: ${ lastEntry - firstEntry } ms`);

    log(`******** Timeline End: ${ this.name } ********`);
    if (deleteFromTimelines) {
      delete Timeline.timelines[this.name];
    }

    this.linkedInstances.forEach(li => li.end(log, deleteFromTimelines));
  }

  /**
   * 
   * @param {Timeline | Profiler} diag 
   */
  link(diag) {
    this.linkedInstances.push(diag);
  }
}
Timeline.timelines = {};

export class Profiler {
  constructor (name) {
    this.name = name;
    this.functions = {};
  }

  /**
  * 
  * @param {string} profileName
  * @returns {Profiler}
  */
  static get(profileName) {
    return Profiler.profiles[profileName] || (Profiler.profiles[profileName] = new Profiler(profileName));
  }

  getFunction(functionName) {
    const func = this.functions[functionName] || (this.functions[functionName] = []);
    return func;
  }

  enter(functionName) {
    const func = this.getFunction(functionName);
    func.push({ enter: Date.now() });
  }

  exit(functionName) {
    const func = this.getFunction(functionName);
    func[func.length - 1].exit = Date.now();
  }

  end(log = console.log, deleteFromProfiles = true) {
    // ['Function', 'Average', 'Total', 'Called']
    const table = makeProfilerTable();
    Object.keys(this.functions).forEach(functionName => {
      let total = 0;
      const entries = this.functions[functionName];
      entries.forEach(({ enter, exit }) => {
        total += exit - enter;
      });

      table.push([functionName, `${ ((1000 * total) / entries.length).toFixed(2) }μs`, total, entries.length]);
    });

    log(`############ Profile:     ${ this.name } ############\n`);
    log(table.toString());
    log(`\n############ Profile End: ${ this.name } ############`);

    if (deleteFromProfiles) {
      delete Profiler.profiles[this.name];
    }
  }
}
Profiler.profiles = {};