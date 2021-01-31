// import { __getString, __getUint8Array, __newArray, __newString, ByteArray, Uint8Array_ID } from '../es5';

const hex = require('./hex');
const { __getString, __getUint8Array, __newArray, __newString, ByteArray, Uint8Array_ID } = require('../es5');

// const buffer = new ByteArray();
// const world = 'ByteArray，你好！';

// buffer.writeInt8(-128);
// buffer.writeUint8(255);
// buffer.writeUint16(Buffer.byteLength(world));
// buffer.write(__newString(world));

// const bytes = __getUint8Array(buffer.bytes);

// buffer.offset = 0;

// const int8 = buffer.readInt8();
// const uint8 = buffer.readUint8();
// const uint16 = buffer.readUint16();

// console.log(bytes);
// console.log(int8, uint8, uint16, __getString(buffer.read(uint16)));
// console.log(__getString(buffer.inspect()));

// const buffer_1 = new ByteArray();

// buffer_1.copy(buffer);

// buffer_1.offset = 0;

// console.log(__getUint8Array(buffer_1.bytes));

// const int8_1 = buffer_1.readInt8();
// const uint8_1 = buffer_1.readUint8();
// const uint16_1 = buffer_1.readUint16();

// console.log(int8_1, uint8_1, uint16_1, __getString(buffer_1.read(uint16_1)));
// console.log(__getString(buffer_1.inspect()));

const x = new ByteArray();

x.writeBytes(__newArray(Uint8Array_ID, new Uint8Array([84, 121, 112, 101, 69, 114, 114, 111, 114, 58])));

x.write(__newString(`TypeError: Cannot read property 'toString' of undefined，你哦`), __newString('utf-8'));

// console.log(__getUint8Array(ByteArray.wrap(x.valueOf()).bytes), '\r\n');

hex(__getUint8Array(x.bytes));
