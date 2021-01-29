const { __getString, __newString, ByteArray, Uint8Array_ID, __newArray, __getUint8Array, __pin } = require('..');

const bytes = new ByteArray();

const bytes1 = new ByteArray();

bytes.writeUTF8(__newString('你好'));
bytes.writeUint8(255);

bytes.offset = 0;

bytes.copy(bytes1);

bytes1.offset = 0;

const bytes2 = ByteArray.wrap(__pin(ByteArray.from(__newArray(Uint8Array_ID, __getUint8Array(bytes.bytes)))));

bytes2.offset = 0;

console.log(__getString(bytes2.readUTF8()), bytes2.readUint8());
