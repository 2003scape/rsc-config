const typeNames = require('../res/types');
const { decodeEquip } = require('./equip');
const { decodeDecoration, intToRgb } = require('./decoration');

const decoders = [
    function decodeItems() {
        this.items.length = this.integerDat.getUShort();

        for (let i = 0; i < this.items.length; i += 1) {
            this.items[i] = { name: this.getString() };
        }

        for (const key of ['description', 'command']) {
            for (const item of this.items) {
                item[key] = this.getString();
            }
        }

        for (const item of this.items) {
            item.sprite = this.integerDat.getUShort();
        }

        for (const item of this.items) {
            item.price = this.getUInt4();
        }

        for (const item of this.items) {
            item.stackable = !this.integerDat.getUByte();
        }

        for (const item of this.items) {
            item.special = !!this.integerDat.getUByte();
        }

        for (const item of this.items) {
            item.equip = decodeEquip(this.integerDat.getUShort());

            if (!item.equip.length) {
                item.equip = null;
            }
        }

        for (const item of this.items) {
            const value = this.getUInt4();
            item.colour = value === 0 ? null : intToRgb(value);
        }

        for (const key of ['untradeable', 'members']) {
            for (const item of this.items) {
                item[key] = !!this.integerDat.getUByte();
            }
        }
    },
    function decodeNpcs() {
        this.npcs.length = this.integerDat.getUShort();

        for (let i = 0; i < this.npcs.length; i += 1) {
            this.npcs[i] = { name: this.getString() };
        }

        for (const key of ['description', 'command']) {
            for (const npc of this.npcs) {
                npc[key] = this.getString();
            }
        }

        for (const key of ['attack', 'strength', 'hits', 'defense']) {
            for (const npc of this.npcs) {
                npc[key] = this.integerDat.getUByte();
            }
        }

        for (const npc of this.npcs) {
            let hostility = this.integerDat.getUByte();
            hostility = hostility > 3 ? 3 : hostility;
            npc.hostility = typeNames.hostility[hostility];
        }

        for (const npc of this.npcs) {
            npc.animations = [];

            for (let i = 0; i < 12; i += 1) {
                const animation = this.integerDat.getUByte();
                npc.animations.push(animation === 255 ? null : animation);
            }
        }

        for (const colour of ['hair', 'top', 'bottom', 'skin']) {
            for (const npc of this.npcs) {
                const value = this.getUInt4();
                npc[`${colour}Colour`] = value === 0 ? null : intToRgb(value);
            }
        }

        for (const key of ['width', 'height']) {
            for (const npc of this.npcs) {
                npc[key] = this.integerDat.getUShort();
            }
        }

        for (const key of ['walkModel', 'combatModel', 'combatAnimation']) {
            for (const npc of this.npcs) {
                npc[key] = this.integerDat.getUByte();
            }
        }
    },
    function decodeTextures() {
        this.textures.length = this.integerDat.getUShort();

        for (let i = 0; i < this.textures.length; i += 1) {
            this.textures[i] = { name: this.getString() };
        }

        for (const texture of this.textures) {
            texture.subName = this.getString()
        }
    },
    function decodeAnimations() {
        this.animations.length = this.integerDat.getUShort();

        for (let i = 0; i < this.animations.length; i += 1) {
            this.animations[i] = { name: this.getString() };
        }

        for (const animation of this.animations) {
            animation.colour = intToRgb(this.getUInt4());
        }

        for (const animation of this.animations) {
            animation.genderModel = this.integerDat.getUByte();
        }

        for (const key of ['hasA', 'hasF']) {
            for (const animation of this.animations) {
                animation[key] = !!this.integerDat.getUByte();
            }
        }

        // the client does use these, but all of them are 0?
        this.integerDat.caret += this.animations.length;
    },
    function decodeObjects() {
        this.objects.length = this.integerDat.getUShort();

        for (let i = 0; i < this.objects.length; i += 1) {
            this.objects[i] = { name: this.getString() };
        }

        for (const object of this.objects) {
            object.description = this.getString();
        }

        for (const object of this.objects) {
            object.commands = [this.getString()];
        }

        for (const object of this.objects) {
            object.commands.push(this.getString());
        }

        for (const object of this.objects) {
            const modelName = this.getString();
            let index = this.models.indexOf(modelName);

            if (index < 0) {
                index = this.models.push(modelName);
            }

            object.model = { name: modelName, id: index };
        }

        for (const key of ['width', 'height']) {
            for (const object of this.objects) {
                object[key] = this.integerDat.getUByte();
            }
        }

        for (const object of this.objects) {
            object.type = typeNames.objects[this.integerDat.getUByte()];
        }

        for (const object of this.objects) {
            object.itemHeight = this.integerDat.getUByte();
        }
    },
    function decodeWallObjects() {
        this.wallObjects.length = this.integerDat.getUShort();

        for (let i = 0; i < this.wallObjects.length; i += 1) {
            this.wallObjects[i] = { name: this.getString() };
        }

        for (const wallObject of this.wallObjects) {
            wallObject.description = this.getString();
        }

        for (const wallObject of this.wallObjects) {
            wallObject.commands = [this.getString()];
        }

        for (const wallObject of this.wallObjects) {
            wallObject.commands.push(this.getString());
        }

        for (const wallObject of this.wallObjects) {
            wallObject.height = this.integerDat.getUShort();
        }

        for (const dir of ['Front', 'Back']) {
            for (const wallObject of this.wallObjects) {
                const decoration = decodeDecoration(this.getUInt4());
                wallObject[`colour${dir}`] = decoration.colour;
                wallObject[`texture${dir}`] = decoration.texture;
            }
        }

        for (const key of ['blocked', 'invisible']) {
            for (const wallObject of this.wallObjects) {
                wallObject[key] = !!this.integerDat.getUByte();
            }
        }
    },
    function decodeRoofs() {
        this.roofs.length = this.integerDat.getUShort();

        for (let i = 0; i < this.roofs.length; i += 1) {
            this.roofs[i] = { height: this.integerDat.getUByte() };
        }

        for (const roof of this.roofs) {
            roof.texture = this.integerDat.getUByte();
        }
    },
    function decodeTiles() {
        this.tiles.length = this.integerDat.getUShort();

        for (let i = 0; i < this.tiles.length; i += 1) {
            const decoration = decodeDecoration(this.getUInt4());

            this.tiles[i] = {
                colour: decoration.colour,
                texture: decoration.texture
            };
        }

        for (const tile of this.tiles) {
            tile.type = typeNames.tiles[this.integerDat.getUByte()];
        }

        for (const tile of this.tiles) {
            tile.blocked = !!this.integerDat.getUByte();
        }
    },
    function decodeProjectile() {
        this.projectileSprite = this.integerDat.getUShort();
    },
    function decodeSpells() {
        this.spells.length = this.integerDat.getUShort();

        for (let i = 0; i < this.spells.length; i += 1) {
            this.spells[i] = { name: this.getString() };
        }

        for (const spell of this.spells) {
            spell.description = this.getString();
        }

        for (const spell of this.spells) {
            spell.level = this.integerDat.getUByte();
        }

        // skip the amount of runes since they're also indicated later
        this.integerDat.caret += this.spells.length;

        for (const spell of this.spells) {
            spell.type = typeNames.spells[this.integerDat.getUByte()];
        }

        for (const spell of this.spells) {
            const runeAmount = this.integerDat.getUByte();

            spell.runes = [];

            for (let i = 0; i < runeAmount; i += 1) {
                spell.runes.push({ id: this.integerDat.getUShort() });
            }
        }

        for (const spell of this.spells) {
            const runeAmount = this.integerDat.getUByte();

            for (let i = 0; i < runeAmount; i += 1) {
                spell.runes[i].amount = this.integerDat.getUByte();
            }
        }
    },
    function decodePrayers() {
        this.prayers.length = this.integerDat.getUShort();

        for (let i = 0; i < this.prayers.length; i += 1) {
            this.prayers[i] = { name: this.getString() };
        }

        for (const prayer of this.prayers) {
            prayer.description = this.getString();
        }

        for (const key of ['level', 'drain']) {
            for (const prayer of this.prayers) {
                prayer[key] = this.integerDat.getUByte();
            }
        }
    }
];

function decodeAll() {
    for (const decoder of decoders) {
        decoder.bind(this)();
    }
}

module.exports = decodeAll;
