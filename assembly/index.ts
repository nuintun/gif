/**
 * @module index
 */

import ByteArray from './ByteArray';

export { ByteArray };

export const Uint8Array_ID = idof<Uint8Array>();

const bytes: Uint8Array = new Uint8Array(6);

(<u8[]>[64, 104, 101, 108, 108, 111]).forEach((byte: u8, index: i32) => {
  bytes[index] = byte;
});

// String.UTF8.decode(bytes.subarray(1, 6).buffer);

export function test(): Uint8Array {
  const view = new DataView(bytes.subarray(1, 6).buffer);

  view.setUint8(0, 66);

  return Uint8Array.wrap(view.buffer);
}
