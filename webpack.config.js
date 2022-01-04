/* eslint-disable @typescript-eslint/no-var-requires */
const neutrino = require('neutrino');

const confManifestV2 = require('./.neutrinorc-v2.js');

const configV3 = neutrino().webpack(); // by default neutrino load .neutrinorc.js
const configV2 = neutrino(confManifestV2).webpack();

module.exports = [configV2, configV3];
