import * as fs from "fs";
import { Parser } from "json2csv";
import * as os from "os";
import * as path from "path";
import * as randomstring from "randomstring";
import { utils, WorkBook, write, writeFile } from "xlsx";

/*
This file contains the main function to convert form data into an xlsx file, which is then written to the file system for passing into kobo
Input requires a 'form' object, which contains keys for 'survey' and 'choices', and corresponding arrays of question objects
*/

export const buildXLSX = async (form: IBuilderForm) => {
  console.log("building xlsx", form);
  // take form with survey data, convert to xlsx and write file to tmp location

  // build survey sheet
  const wsName = "survey";
  const wb: WorkBook = { SheetNames: [], Sheets: {} };
  const ws: any = utils.json_to_sheet(form.survey);
  wb.SheetNames.push(wsName);
  wb.Sheets[wsName] = ws;
  // build choices sheet
  const wsName2 = "choices";
  const ws2: any = utils.json_to_sheet(form.choices);
  wb.SheetNames.push(wsName2);
  wb.Sheets[wsName2] = ws2;
  // build settings sheet
  const wsName3 = "settings";
  const ws3: any = utils.json_to_sheet(form.settings);
  wb.SheetNames.push(wsName3);
  wb.Sheets[wsName3] = ws3;
  // write data to xls file
  let wbout;
  try {
    wbout = write(wb, { bookType: "xlsx", bookSST: true, type: "binary" });
  } catch (error) {
    throw error;
  }
  // write xls file to temp dir on file system
  let fileName;
  if (form._previewMode) {
    fileName =
      "_draft_" +
      randomstring.generate({
        // charset:'alphabetic',
        length: 15
      });
  } else {
    fileName = form.title;
  }
  const filePath = path.join(os.tmpdir(), fileName + ".xlsx");
  console.log("writing file");
  await fs.writeFile(filePath, wbout, "binary", err => {
    if (err) {
      throw err;
    } else {
      console.log("xlsx file written successfully");
    }
  });
  console.log("resolving successfully", filePath);
  return {
    err: null,
    filePath: filePath
  };
};

export const buildCSV = (json, filename) => {
  // convert the json file into a csv string:
  return new Promise((resolve, reject) => {
    const parser = new Parser();
    const csv = parser.parse(json);
    const filePath = path.join(os.tmpdir(), filename);
    fs.writeFile(filePath, csv, "binary", err => {
      if (err) {
        throw err;
      } else {
        console.log("csv file written successfully");
      }
      resolve({
        filePath,
        err
      });
    });
  });
};

// *** rough interface for testing, to be properly defined
export interface IBuilderForm {
  choices: any[];
  questionGroups: any[];
  survey: any[];
  settings: any[];
  title: string;
  _created: string;
  _previewMode: boolean;
}
