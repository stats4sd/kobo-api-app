/* tslint:disable:variable-name */

import { Request, Response } from "express";
import * as fs from "fs";
import * as request from "request";
import { config } from "../config/config";
import * as builder from "./formBuilder";
import * as postgresApi from "./postgresApi";

const koboURL = config.kobotoolbox.server;
let auth;

if (config.kobotoolbox.token !== "") {
  auth = `Token ${config.kobotoolbox.token}`;
} else if (config.kobotoolbox.password !== "") {
  const enc = new Buffer(
    config.kobotoolbox.username + ":" + config.kobotoolbox.password
  ).toString("base64");
  auth = `Basic ${enc}`;
}

// standard function to redirect non-custom requests directly to kobo
export const pipeRequest = (req, res) => {
  console.log(req.body);
  const options = setRequestOptions(req);
  sendRequest(options, res);
};

/************ Custom Endpoints ****************************************************
These are codeblocks called from api requests directly to the function name
e.g. /getForms
Additional parameters may appear either in POST message body or via path
e.g. /getForms/:formid
************************************************************************************/

// Example function that gets forms in same way standard api does (not used, just for refrence)
export const getForms = (req, res) => {
  if (req.method === "GET") {
    const options = setRequestOptions(req);
    sendRequest(options, res);
  } else {
    res.status(405).send(req.method + " method not allowed");
  }
};

export const customDeployForm = async (req: Request, res: Response) => {
  verifyRequest(req, res, ["POST"], ["choices", "survey"]);
  const form: builder.IBuilderForm = req.body;
  const build = await builder.buildXLSX(form);
  const filePath: string = build.filePath;
  const options: request.Options = setRequestOptions(req, "forms");
  // add formData to standard options object
  options.formData = {
    xls_file: fs.createReadStream(filePath)
  };
  sendRequest(options, res);
};

// Combination of customDeployForm above and customSetFormInfo code below
// could be better merged if included both form (fields) and formData (xlsform) fields
export const customUpdateForm = (req, res) => {
  if (req.method === "PATCH") {
    const form = req.body;
    // build form and send request to kobo forms api, returning forms object
    builder.buildXLSX(form).then(build => {
      const filePath: string = build.filePath;
      const options: any = setRequestOptions(req, `forms/${form.kobo_id}`);
      options.formData = {
        xls_file: {
          value: fs.createReadStream(filePath)
        }
      };
      sendRequest(options).then(body => {
        res.send({
          form: form,
          msg: body
        });
      });
    });
  } else {
    res.status(405).send(req.method + " method not allowed");
  }
};

// generic update form function, can be passed update values in body
// or passed from other functions
export const customSetFormInfo = (req, res, update?, urlToReplace?) => {
  if (req.method === "PATCH") {
    console.log("archive req body", req.body);
    const options: any = setRequestOptions(req, `forms/${req.body.kobo_id}`);
    // add form data using either supplied or body
    if (!update) {
      console.log("setting body as form", req.body, typeof req.body);
      update = req.body;
    }
    options.form = update;
    sendRequest(options, res);
  } else {
    res.status(405).send(req.method + " method not allowed");
  }
};

// Archive forms
export const customArchiveForm = (req, res) => {
  customSetFormInfo(req, res, { downloadable: "false" }, "customArchiveForm");
};

// Restore archived forms - same as above except {downloadable:'true'}
export const customRestoreForm = (req, res) => {
  customSetFormInfo(req, res, { downloadable: "true" }, "customRestoreForm");
};

// countRecords:
// Expects request to include a "kobo_id" property, containing an id of a form on the kobo server.
// Should send back a count of all data records found for that form.
export const countRecords = (req, res) => {
  console.log("countRecords request ", req.method, req.path);
  const body = req.body;
  if (!body.kobo_id) {
    res
      .status(400)
      .send("error - please include a kobo form id in the post request");
    return;
  }

  const options: any = setRequestOptions(
    req,
    "data/" + body.kobo_id + '?fields=["_id"]'
  );
  options.method = "GET";

  sendRequest(options).then((sendBack: any) => {
    // if request was successful, get the ids to count:
    if (sendBack.statusCode === 200) {
      const ids: any = JSON.parse(sendBack.body);
      res.send({
        count: ids.length,
        statusCode: sendBack.statusCode,
        kobo_id: body.kobo_id
      });
    } else {
      res.send({
        statusCode: sendBack.statusCode,
        body: sendBack.body
      });
    }
  });
};

// ******************************** To be organised **************************************

export const addCsv = (req, res) => {
  if (req.method === "POST") {
    const dataType = req.body.data_type;
    const dataValue = req.body.data_value;
    const xform = req.body.xform;
    const dataFile = req.body.data_file;

    // first,  check if the form already has an attached file with the given name.
    const checkOptions: any = setRequestOptions(req, "metadata?xform=" + xform);
    checkOptions.method = "GET";

    sendRequest(checkOptions).then((checkBack: any) => {
      console.log("checkback", checkBack);
      const metaData = JSON.parse(checkBack.body);
      let url = "";
      const fileExists: boolean = metaData.some((item, index) => {
        url = item.url;
        return (item.data_value = dataValue);
      });

      if (fileExists) {
        const deleteOptions = setRequestOptions(req);
        deleteOptions.method = "DELETE";
        deleteOptions.url = url;

        sendRequest(deleteOptions).then(deleteBack => {
          uploadCsv(req, res);
        });
      } else {
        uploadCsv(req, res);
      }
      console.log("#####");
      console.log("url = ", url);
      console.log("#####");
    });
  } else {
    res.status(405).send(req.method + " method not allowed");
  }
};

async function uploadCsv(req, res) {
  // convert data_file to csv;
  const dataType = req.body.data_type;
  const dataValue = req.body.data_value;
  const xform = req.body.xform;
  const dataFile = req.body.data_file;

  const filePath: string = await builder.buildCSV(dataFile, dataValue);
  const options: any = setRequestOptions(req, "metadata");

  options.formData = {
    data_type: dataType,
    data_value: dataValue,
    xform: xform,
    data_file: fs.createReadStream(filePath)
  };

  sendRequest(options).then((sendBack: any) => {
    let msg: any;
    try {
      msg = JSON.parse(sendBack.body);
    } catch (error) {
      msg = {
        body: sendBack.body,
        err: error
      };
    }
    res.send({
      responseCode: sendBack.responseCodes,
      msg: msg
    });
  }); // end sendRequest
}

/************ Helper functions ****************************************************
These are used internally to do common tasks like setting request options and
sending requests
************************************************************************************/

export function setRequestOptions(req?: Request, newPath?: string, newMethod?) {
  // headers sent by WordPress are getting in the way. Instead, reset headers and build custom set:
  let finalPath: string = newPath;
  // set options for method, url and headers, including any path update
  if (!newPath) {
    finalPath = req.path;
  }
  // check path starts '/' in case not set in config
  if (finalPath.charAt(0) !== "/") {
    finalPath = `/${finalPath}`;
  }
  const options: request.Options = {
    method: newMethod ? newMethod : req.method,
    url: koboURL + finalPath,
    headers: {
      authorization: auth
    }
  };
  return options;
}

// send request, optionally responding to initial incoming request with new response
export function sendRequest(options, res?) {
  return new Promise((resolve, reject) => {
    request(options, (err, response, body) => {
      // error handling
      if (err) {
        if (res) {
          res.status(400).send({
            error: err,
            options: options,
            response: response,
            body: body
          });
        } else {
          resolve({
            error: err,
            options: options,
            response: response,
            body: body
          });
        }
      }
      // handle response. If original res object specified automatically send response containing body; otherwise pass back to promise resolve.
      else {
        // handle non 200 responses, so status codes can be passed back to the originating app with the rest of the respnose.
        if (response.statusCode > 299 || response.statusCode < 200) {
          if (res) {
            res.status(response.statusCode).send({
              error: "unsuccessful request",
              options: options,
              response: response,
              body: body
            });
          }

          resolve(response);
        } else {
          try {
            // attempt to parse response to return an object, with fallback of returning string
            const bodyObj = JSON.parse(body);
            const sendBack = {
              body: bodyObj,
              statusCode: res.statusCode
            };

            if (res) {
              res.send(sendBack);
            }
            resolve(sendBack);
          } catch (error) {
            if (res) {
              res.send({ body: body, statusCode: response.statusCode });
            }
            resolve({ body: body, statusCode: response.statusCode });
          }
        }
      }
    });
  });
}

// check for errors in initial request method and body, responding appropriately
export function verifyRequest(
  req: Request,
  res: Response,
  allowedMethods: string[],
  expectedBodyFields?: string[]
) {
  // permitted method used
  if (!allowedMethods.includes(req.method)) {
    res.status(405).send(`${req.method} method not allowed`);
    throw new Error(`${req.method} method not allowed`);
  }
  // correct body fields provided
  if (expectedBodyFields) {
    const errors = [];
    if (!req.body) {
      const expectedStr = expectedBodyFields.join(",");
      res.status(400).send(`${expectedStr} fields expected`);
      throw new Error(`${expectedStr} fields expected`);
    }
    expectedBodyFields.forEach(field => {
      if (!req.body[field]) {
        errors.push(`${field} not specified`);
      }
    });
    if (errors.length > 0) {
      const errorsStr = errors.join(",");
      res.status(400).send(`${errorsStr}`);
      throw new Error(`${errorsStr}`);
    }
  }
}
