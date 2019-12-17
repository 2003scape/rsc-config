const JagBuffer = require('@2003scape/rsc-archiver/src/jag-buffer');
const decodeAll = require('./decode');
const { JagArchive } = require('@2003scape/rsc-archiver');
const { encodeStrings, encodeIntegers } = require('./encode');

const SECTIONS = [
    'items', 'npcs', 'textures', 'animations', 'objects', 'wallObjects',
    'roofs', 'tiles', 'spells', 'prayers', 'models' ];

class Config {
    constructor() {
        for (const section of SECTIONS) {
            this[section] = [];
        }
    }

    loadArchive(buffer) {
        const archive = new JagArchive();
        archive.readArchive(buffer);

        this.stringDat = new JagBuffer(archive.getEntry('string.dat'));
        this.integerDat = new JagBuffer(archive.getEntry('integer.dat'));

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
        let c;

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
        const archive = new JagArchive();
        archive.putEntry('string.dat', this.toStringDat());
        archive.putEntry('integer.dat', this.toIntegerDat());

        return archive.toArchive(true);
    }
}

module.exports = { Config, SECTIONS };
