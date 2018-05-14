
import { utils, write, WorkBook, writeFile } from 'xlsx';
import * as path from 'path'
import * as fs from 'fs'
import * as os from 'os'
import * as randomstring from 'randomstring'
import { Parser } from 'json2csv'


/*
This file contains the main function to convert form data into an xlsx file, which is then written to the file system for passing into kobo
Input requires a 'form' object, which contains keys for 'survey' and 'choices', and corresponding arrays of question objects


*/

export const buildXLSX = function (form) {
    // take form with survey data, convert to xlsx and write file to tmp location
    return new Promise((resolve, reject) => {
        // build survey sheet
        const ws_name = 'survey';
        const wb: WorkBook = { SheetNames: [], Sheets: {} };
        const ws: any = utils.json_to_sheet(form.survey);
        wb.SheetNames.push(ws_name);
        wb.Sheets[ws_name] = ws;
        // build choices sheet
        const ws_name2 = 'choices';
        const ws2: any = utils.json_to_sheet(form.choices);
        wb.SheetNames.push(ws_name2);
        wb.Sheets[ws_name2] = ws2;

        // build settings sheet
        const ws_name3 = 'settings';
        const ws3: any = utils.json_to_sheet(form.settings);
        wb.SheetNames.push(ws_name3);
        wb.Sheets[ws_name3] = ws3;


        // write data to xls file
        let wbout
        try { wbout = write(wb, { bookType: 'xlsx', bookSST: true, type: 'binary' }); }
        catch (error) { resolve('no form written') }
        // write xls file to temp dir on file system
        let fileName
        if(form._previewMode){fileName='_draft_'+randomstring.generate({
            // charset:'alphabetic',
            length:15
        })}
        else{fileName = form.title}
        const filePath = path.join(os.tmpdir(), fileName+'.xlsx')
        fs.writeFile(filePath, wbout, 'binary', (err) => {
            if (err) throw err;
            else { console.log('xlsx file written successfully') }
            resolve({
                filePath:filePath,
                err:err
            })
        })
    })

}

export const buildCSV = function(json,filename) {
    //convert the json file into a csv string:
    
    return new Promise((resolve,reject) => {

        const parser = new Parser();

        const csv = parser.parse(json);
        const filePath = path.join(os.tmpdir(), filename)
        fs.writeFile(filePath,csv,'binary',(err)=> {
            if(err) throw err;
            else console.log('csv file written successfully')
            resolve({
                filePath:filePath,
                err:err
            })

        })
    })
}
