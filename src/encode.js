// encode config instance back into original format buffers

import { JagBuffer } from '@2003scape/rsc-archiver';
import { cssColourToInt, encodeDecoration } from './decoration.js';
import { encodeEquip } from './equip.js';

import TYPES from './types.js';

const TYPE_LENGTHS = {
    UByte: 1,
    UShort: 2,
    UInt4: 4
};

function integersToBuffer(integers) {
    const length = integers.reduce((a, b) => {
        return a + TYPE_LENGTHS[b.type];
    }, 0);

    const integerBuffer = new JagBuffer(Buffer.alloc(length));

    for (let { type, value } of integers) {
        if (type === 'UInt4') {
            if (value < 0) {
                value = 99999999 - value;
            }

            type = 'Int4';
        }

        integerBuffer[`write${type}`](value);
    }

    return integerBuffer.data;
}

function encodeStrings() {
    const strings = [];

    // items
    for (const key of ['name', 'description', 'command']) {
        for (const item of this.items) {
            strings.push(item[key]);
        }
    }

    // npcs
    for (const key of ['name', 'description', 'command']) {
        for (const npc of this.npcs) {
            strings.push(npc[key]);
        }
    }

    // textures
    for (const key of ['name', 'subName']) {
        for (const texture of this.textures) {
            strings.push(texture[key]);
        }
    }

    // animations
    for (const animation of this.animations) {
        strings.push(animation.name);
    }

    // game objects
    for (const key of ['name', 'description']) {
        for (const object of this.objects) {
            strings.push(object[key]);
        }
    }

    for (let i = 0; i < 2; i += 1) {
        for (const object of this.objects) {
            strings.push(object.commands[i]);
        }
    }

    for (const object of this.objects) {
        strings.push(object.model.name);
    }

    // wall objects
    for (const key of ['name', 'description']) {
        for (const wallObject of this.wallObjects) {
            strings.push(wallObject[key]);
        }
    }

    for (let i = 0; i < 2; i += 1) {
        for (const wallObject of this.wallObjects) {
            strings.push(wallObject.commands[i]);
        }
    }

    // spells
    for (const key of ['name', 'description']) {
        for (const spell of this.spells) {
            strings.push(spell[key]);
        }
    }

    // prayers
    for (const key of ['name', 'description']) {
        for (const prayer of this.prayers) {
            strings.push(prayer[key]);
        }
    }

    // convert each string to a buffer, add a 0 to the end of each and
    // concat them together
    return Buffer.concat(
        strings.map((str) => {
            const buffer = Buffer.alloc(str.length + 1);
            buffer.write(str);
            buffer[str.length] = 0;

            return buffer;
        })
    );
}

function encodeIntegers() {
    const integers = [];

    // items
    integers.push({ type: 'UShort', value: this.items.length });

    for (const item of this.items) {
        integers.push({ type: 'UShort', value: item.sprite });
    }

    for (const item of this.items) {
        integers.push({ type: 'UInt4', value: item.price });
    }

    for (const item of this.items) {
        integers.push({ type: 'UByte', value: !item.stackable });
    }

    for (const item of this.items) {
        integers.push({ type: 'UByte', value: item.special });
    }

    for (const item of this.items) {
        const value = !item.equip ? 0 : encodeEquip(item.equip);
        integers.push({ type: 'UShort', value });
    }

    for (const item of this.items) {
        const value = item.colour === null ? 0 : cssColourToInt(item.colour);
        integers.push({ type: 'UInt4', value });
    }

    for (const key of ['untradeable', 'members']) {
        for (const item of this.items) {
            integers.push({ type: 'UByte', value: item[key] });
        }
    }

    // npcs
    integers.push({ type: 'UShort', value: this.npcs.length });

    const npcKeys = ['attack', 'strength', 'hits', 'defense'];

    for (const key of npcKeys) {
        for (const npc of this.npcs) {
            integers.push({ type: 'UByte', value: npc[key] });
        }
    }

    for (const npc of this.npcs) {
        const value = TYPES.hostility.indexOf(npc.hostility);
        integers.push({ type: 'UByte', value });
    }

    for (const npc of this.npcs) {
        for (let animation of npc.animations) {
            animation = animation === null ? 255 : animation;
            integers.push({ type: 'UByte', value: animation });
        }
    }

    for (const colour of ['hair', 'top', 'bottom', 'skin']) {
        for (const npc of this.npcs) {
            let value = npc[`${colour}Colour`];
            value = value === null ? 0 : cssColourToInt(value);

            integers.push({ type: 'UInt4', value });
        }
    }

    for (const key of ['width', 'height']) {
        for (const npc of this.npcs) {
            integers.push({ type: 'UShort', value: npc[key] });
        }
    }

    for (const key of ['walkModel', 'combatModel', 'combatAnimation']) {
        for (const npc of this.npcs) {
            integers.push({ type: 'UByte', value: npc[key] });
        }
    }

    // textures
    integers.push({ type: 'UShort', value: this.textures.length });

    // animations
    integers.push({ type: 'UShort', value: this.animations.length });

    for (const animation of this.animations) {
        let value = animation.colour === null ? 0 : animation.colour;
        value = cssColourToInt(animation.colour);
        integers.push({ type: 'UInt4', value });
    }

    for (const key of ['genderModel', 'hasA', 'hasF']) {
        for (const animation of this.animations) {
            integers.push({ type: 'UByte', value: animation[key] });
        }
    }

    for (let i = 0; i < this.animations.length; i += 1) {
        integers.push({ type: 'UByte', value: 0 });
    }

    // objects
    integers.push({ type: 'UShort', value: this.objects.length });

    for (const key of ['width', 'height']) {
        for (const object of this.objects) {
            integers.push({ type: 'UByte', value: object[key] });
        }
    }

    for (const object of this.objects) {
        const value = TYPES.objects.indexOf(object.type);
        integers.push({ type: 'UByte', value });
    }

    for (const object of this.objects) {
        integers.push({ type: 'UByte', value: object.itemHeight });
    }

    // wall objects
    integers.push({ type: 'UShort', value: this.wallObjects.length });

    for (const wallObject of this.wallObjects) {
        integers.push({ type: 'UShort', value: wallObject.height });
    }

    for (const dir of ['Front', 'Back']) {
        for (const wallObject of this.wallObjects) {
            const value = encodeDecoration(
                wallObject[`colour${dir}`],
                wallObject[`texture${dir}`]
            );
            integers.push({ type: 'UInt4', value });
        }
    }

    for (const key of ['blocked', 'invisible']) {
        for (const wallObject of this.wallObjects) {
            integers.push({ type: 'UByte', value: wallObject[key] });
        }
    }

    // roofs
    integers.push({ type: 'UShort', value: this.roofs.length });

    for (const key of ['height', 'texture']) {
        for (const roof of this.roofs) {
            integers.push({ type: 'UByte', value: roof[key] });
        }
    }

    // tiles
    integers.push({ type: 'UShort', value: this.tiles.length });

    for (const tile of this.tiles) {
        const value = encodeDecoration(tile.colour, tile.texture);
        integers.push({ type: 'UInt4', value });
    }

    for (const tile of this.tiles) {
        const value = TYPES.tiles.indexOf(tile.type);
        integers.push({ type: 'UByte', value });
    }

    for (const tile of this.tiles) {
        integers.push({ type: 'UByte', value: tile.blocked });
    }

    integers.push({ type: 'UShort', value: this.projectileSprite });

    // spells
    integers.push({ type: 'UShort', value: this.spells.length });

    for (const spell of this.spells) {
        integers.push({ type: 'UByte', value: spell.level });
    }

    for (const spell of this.spells) {
        integers.push({ type: 'UByte', value: spell.runes.length });
    }

    for (const spell of this.spells) {
        const value = TYPES.spells.indexOf(spell.type);
        integers.push({ type: 'UByte', value });
    }

    for (const spell of this.spells) {
        integers.push({ type: 'UByte', value: spell.runes.length });

        for (const rune of spell.runes) {
            integers.push({ type: 'UShort', value: rune.id });
        }
    }

    for (const spell of this.spells) {
        integers.push({ type: 'UByte', value: spell.runes.length });

        for (const rune of spell.runes) {
            integers.push({ type: 'UByte', value: rune.amount });
        }
    }

    // prayers
    integers.push({ type: 'UShort', value: this.prayers.length });

    for (const key of ['level', 'drain']) {
        for (const prayer of this.prayers) {
            integers.push({ type: 'UByte', value: prayer[key] });
        }
    }

    return integersToBuffer(integers);
}

export { encodeStrings, encodeIntegers };
