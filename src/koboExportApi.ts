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

// This is not an endpoint, but used by various endpoints to pull form submissions
export async function getLatestSubmissions(
  formID: number,
  latestSubmissionID?
) {
  // get data from /data/{pk} endpoint
  const options: request.Options = setRequestOptions(
    null,
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
