/**
 * @module clean
 * @license MIT
 * @author nuintun
 */

import rimraf from 'rimraf';

export default function clean() {
  ['es5', 'esnext', 'typings'].forEach(path => rimraf.sync(path));
}
