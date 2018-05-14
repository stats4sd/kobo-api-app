"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ini = require("ini");
const fs = require("fs");
// https://www.npmjs.com/package/ini
// This is seperated from the main index.ts to make it easier for version controlling.
// Uses an ini file to store config stuff, like server location and user api token.
// Ini file used rather then something like json or ts module for compatibility with other systems._sendRequest(
// The ini file references needs a section with the following format:
// [kobotoolbox]
// server = https://kc.kobotoolboxdomainname/api/v1/
// token = admin-user-token
// If a token is not supplied here, every call to the app's API endpoints will require an Auth header that contains that token as a "BASIC" auth. (e.g. "Basic xtjxgfhdrthdrtysryseafsdfs")
exports.config = ini.parse(fs.readFileSync('/opt/nrc_conini.php', 'utf-8'));
//# sourceMappingURL=config.js.map