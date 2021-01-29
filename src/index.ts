import wasm from '../build/optimized.wasm';
import { instantiateSync } from '@assemblyscript/loader';

let buffer: ArrayBuffer;

if (Buffer && Buffer.from) {
  buffer = Buffer.from(wasm, 'base64');
} else {
  const source = globalThis.atob(wasm);
  const { length: sourceLength } = source;
  const bytes = new Uint8Array(sourceLength);

  for (let i = 0; i < sourceLength; i++) {
    bytes[i] = source.charCodeAt(i);
  }

  buffer = bytes.buffer;
}

export default instantiateSync(buffer).exports;
