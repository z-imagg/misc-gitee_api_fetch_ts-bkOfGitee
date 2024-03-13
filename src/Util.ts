// nodejs版本>=9.3时， 阻塞式sleep实现如下，参考  https://www.npmjs.com/package/sleep
function msleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}
function sleep(seconds) {
  msleep(seconds*1000);
}
