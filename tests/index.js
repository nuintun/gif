// import { __getString, __newString, ByteArray } from '../es5';

const { __getString, __newString, ByteArray, __getUint8Array, Uint8Array_ID, __newArray } = require('../es5');

const bytes = new ByteArray();
const world = 'ByteArray，你好！';

bytes.writeInt8(-128);
bytes.writeUint8(255);
bytes.writeUint16(Buffer.byteLength(world));
bytes.write(__newString(world));

bytes.offset = 0;

const int8 = bytes.readInt8();
const uint8 = bytes.readUint8();
const uint16 = bytes.readUint16();

console.log(int8, uint8, uint16, __getString(bytes.read(uint16)), __getString(bytes.toString()));

const buffer = __getUint8Array(bytes.bytes);

console.log(buffer);
// console.log(__getUint8Array(test(__newArray(Uint8Array_ID, buffer))));

const bytes1 = ByteArray.wrap(ByteArray.from(__newArray(Uint8Array_ID, buffer)));

bytes1.offset = 0;

console.log(__getUint8Array(bytes1.bytes));

// const int81 = bytes1.readInt8();
// const uint81 = bytes1.readUint8();
// const uint161 = bytes1.readUint16();

// console.log(int81, uint81, uint161, __getString(bytes1.read(uint161)), __getString(bytes1.toString()));
