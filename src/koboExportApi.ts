import { Request, Response } from "express";
import * as fs from "fs";
import * as request from "request";
import { config } from "../config/config";
import * as builder from "./formBuilder";
import { sendRequest, setRequestOptions, verifyRequest } from "./koboApi";
import { postgresJsonPOST } from "./postgresApi";

// wrapper around /data to pull form submissions, optionally adding query params to get submissions
// after a given submission _id number
export const customPullData = async (req: Request, res: Response) => {
  verifyRequest(req, res, ["POST"], ["formID"]);
  const body: IPullDataBody = req.body;
  const pullDataRes = getLatestSubmissions(
    body.formID,
    body.latestSubmissionID
  );
  res.status(200).send(pullDataRes);
};

export async function getLatestSubmissions(
  formID: number,
  latestSubmissionID?
) {
  const options: request.Options = setRequestOptions(
    {},
    "/data/" + formID,
    "GET"
  );
  const dataRequest = (await sendRequest(options)) as Request;
  let submissions: IFormSubmission[] = JSON.parse(dataRequest.body);
  const countTotal = submissions.length;
  let countNew = null;
  //   filter
  if (latestSubmissionID) {
    submissions = submissions.filter(s => {
      return s._id > latestSubmissionID;
    });
    countNew = submissions.length;
  }
  // send response
  const pullDataRes: IPullDataRes = {
    _formID: formID,
    _latestSubmissionID: latestSubmissionID,
    data: submissions,
    countTotal: countTotal,
    countNew: countNew
  };
  return pullDataRes;
}

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

/************ Interfaces ***********************************************************
These help to define the expected data structures
************************************************************************************/
export interface IPullDataBody {
  formID: number;
  latestSubmissionID?: number;
}
export interface IPullDataRes {
  countTotal: number;
  countNew: number;
  data: IFormSubmission[];
  _formID: number;
  _latestSubmissionID: number;
}

export interface IFormSubmission {
  _notes: any[];
  "meta/instanceID": string;
  _submission_time: string;
  _uuid: string;
  _bamboo_dataset_id: string;
  _tags: any[];
  _attachments: any[];
  _submitted_by: null;
  _geolocation: number[];
  _xform_id_string: "akMawtHntF9XGX8mttEDvB";
  _status: "submitted_via_web";
  _id: number;
  __version__: "2049830";
  ["questionKey"]: ["responseVal"];
}
