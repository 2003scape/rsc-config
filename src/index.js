import { JagArchive, JagBuffer } from '@2003scape/rsc-archiver';

import decodeAll from './decode.js';
import { encodeStrings, encodeIntegers } from './encode.js';

const SECTIONS = [
    'items',
    'npcs',
    'textures',
    'animations',
    'objects',
    'wallObjects',
    'roofs',
    'tiles',
    'spells',
    'prayers',
    'models'
];

class Config {
    constructor() {
        for (const section of SECTIONS) {
            this[section] = [];
        }

        this.archive = new JagArchive();
    }

    async init() {
        await this.archive.init();
    }

    loadArchive(buffer) {
        this.archive.readArchive(buffer);

        this.stringDat = new JagBuffer(this.archive.getEntry('string.dat'));
        this.integerDat = new JagBuffer(this.archive.getEntry('integer.dat'));

        decodeAll.bind(this)();
    }

    getUInt4() {
        let i = this.integerDat.getInt4() | 0;

        if (i > 99999999) {
            i = 99999999 - i;
        }

        return i;
    }

    getString() {
        let s = '';
        let c = 0;

        while (true) {
            c = this.stringDat.getUByte();

            if (c === 0) {
                break;
            }

            s += String.fromCharCode(c);
        }

        return s;
    }

    toStringDat() {
        return encodeStrings.bind(this)();
    }

    toIntegerDat() {
        return encodeIntegers.bind(this)();
    }

    toArchive() {
        this.archive.entries.clear();

        this.archive.putEntry('string.dat', this.toStringDat());
        this.archive.putEntry('integer.dat', this.toIntegerDat());

        return this.archive.toArchive(true);
    }
}

export { Config, SECTIONS };
