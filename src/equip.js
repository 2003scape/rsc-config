// encode/decode equipment bitmasks into arrays

import Bitfield from 'bitfield';

// the bit-order of boolean attributes for equipable items. slots with "replace"
// will replace the corresponding character sprite rather than overlap; for
// e.g. plate body will be drawn instead of the torso rather than overlapping it
// like a chain body.
const EQUIP_NAMES = {
    2: '2-handed',
    4: 'cape',
    5: 'chest',
    6: 'feet',
    7: 'hands',
    8: 'legs',
    9: 'body',
    10: 'head',
    11: 'right-hand',
    12: 'left-hand',
    13: 'replace-legs',
    14: 'replace-body',
    15: 'replace-head'
};

const EQUIP_SLOTS = {};

for (const [slot, name] of Object.entries(EQUIP_NAMES)) {
    EQUIP_SLOTS[name] = +slot;
}

function decodeEquip(equipMask) {
    const equipBuffer = Buffer.alloc(2);
    equipBuffer.writeUInt16BE(equipMask);

    const equipField = new Bitfield(equipBuffer);

    const slots = [];

    for (let i = 0; i < 16; i += 1) {
        if (equipField.get(i)) {
            slots.push(EQUIP_NAMES[i]);
        }
    }

    return slots;
}

function encodeEquip(slots) {
    const equipBuffer = Buffer.alloc(2);
    const equipField = new Bitfield(equipBuffer);

    for (const name of slots) {
        equipField.set(EQUIP_SLOTS[name], true);
    }

    return equipField.buffer.readUInt16BE(0);
}

export { decodeEquip, encodeEquip };
