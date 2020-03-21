let logs = [];

function add(log) {
  logs.push(log);
  logs.length > 200 && logs.shift();
}

exports.getLogs = () => logs;
  
exports.getLog = (index) => logs[index];

exports.log = function(...args) {
  add(args)
  if (__DEV__) {
    let info = args.concat();
    info[0] = "%c" + info[0];
    info.splice(1, 0, 'color: #2d8cf0');
    console.log(...info);
  }
}

exports.logWarm = function(...args) {
  add(args)
  if (__DEV__) {
    let info = args.concat();
    info[0] = "%c" + info[0];
    info.splice(1, 0, 'color: orange');
    console.log(...info);
  }
}

exports.logErr = function(...args) {
  add(args)
  if (__DEV__) {
    let info = args.concat();
    info[0] = "%c" + info[0];
    info.splice(1, 0, 'color: red');
    console.log(...info);
  }
}