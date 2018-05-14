"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const xlsx_1 = require("xlsx");
const path = require("path");
const fs = require("fs");
const os = require("os");
const randomstring = require("randomstring");
/*
This file contains the main function to convert form data into an xlsx file, which is then written to the file system for passing into kobo
Input requires a 'form' object, which contains keys for 'survey' and 'choices', and corresponding arrays of question objects


*/
exports.buildXLSX = function (form) {
    // take form with survey data, convert to xlsx and write file to tmp location
    return new Promise((resolve, reject) => {
        // build survey sheet
        const ws_name = 'survey';
        const wb = { SheetNames: [], Sheets: {} };
        const ws = xlsx_1.utils.json_to_sheet(form.survey);
        wb.SheetNames.push(ws_name);
        wb.Sheets[ws_name] = ws;
        // build choices sheet
        const ws_name2 = 'choices';
        const ws2 = xlsx_1.utils.json_to_sheet(form.choices);
        wb.SheetNames.push(ws_name2);
        wb.Sheets[ws_name2] = ws2;
        // build settings sheet
        const ws_name3 = 'settings';
        const ws3 = xlsx_1.utils.json_to_sheet(form.settings);
        wb.SheetNames.push(ws_name3);
        wb.Sheets[ws_name3] = ws3;
        // write data to xls file
        let wbout;
        try {
            wbout = xlsx_1.write(wb, { bookType: 'xlsx', bookSST: true, type: 'binary' });
        }
        catch (error) {
            resolve('no form written');
        }
        // write xls file to temp dir on file system
        let fileName;
        if (form._previewMode) {
            fileName = '_draft_' + randomstring.generate({
                // charset:'alphabetic',
                length: 15
            });
        }
        else {
            fileName = form.title;
        }
        const filePath = path.join(os.tmpdir(), fileName + '.xlsx');
        fs.writeFile(filePath, wbout, 'binary', (err) => {
            if (err)
                throw err;
            else {
                console.log('xlsx file written successfully');
            }
            resolve({
                filePath: filePath,
                err: err
            });
        });
    });
};
//# sourceMappingURL=formBuilder.js.map