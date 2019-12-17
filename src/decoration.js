// various colour and texture related encoding/decoding functions

const { cssColor, rgb2hex } = require('@swiftcarrot/color-fns');

const COLOUR_TRANSPARENT = 12345678;

function intToRgb(rgb) {
    const blue = rgb & 255;
    const green = (rgb >> 8) & 0xff;
    const red = (rgb >> 16) & 0xff;

    return `rgb(${red}, ${green}, ${blue})`;
}

function cssColourToInt(colour) {
    const { r, g, b } = cssColor(colour);
    return parseInt(rgb2hex(r, g, b).slice(1), 16);
}

function decorationColourToInt(r, g, b) {
    return -1 - ((r / 8) | 0) * 1024 - ((g / 8) | 0) * 32 - ((b / 8) | 0);
}

function encodeDecorationColour(colour) {
    const { r, g, b } = cssColor(colour);
    return decorationColourToInt(r, g, b);
}

function decodeDecoration(decoration) {
    decoration |= 0;

    let colour = null;
    let texture = null;

    if (decoration === COLOUR_TRANSPARENT) {
        colour = 'transparent';
    } else if (decoration < 0) {
        decoration = -(decoration) - 1;

        const red = decoration >> 10 & 0x1f;
        const green = decoration >> 5 & 0x1f;
        const blue = decoration & 0x1f;

        colour = intToRgb((red << 19) + (green << 11) + (blue << 3));
    } else {
        texture = decoration;
    }

    return { colour, texture };
}

function encodeDecoration(colour, texture) {
    let decoration = 0;

    if (colour === 'transparent') {
        decoration = COLOUR_TRANSPARENT;
    } else if (colour) {
        decoration = encodeDecorationColour(colour);
    } else {
        decoration = texture;
    }

    return decoration;
}

module.exports = {
    COLOUR_TRANSPARENT,
    cssColourToInt,
    decodeDecoration,
    decorationColourToInt,
    encodeDecoration,
    intToRgb
};
