// node module imports
import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as express from "express";
import * as functions from "firebase-functions";

// custom module imports
import { config } from "../config/config";
import * as kobo from "./koboApi";
import * as koboExport from "./koboExportApi";
import * as koboShare from "./koboShareApi";
import * as postgresApi from "./postgresApi";

const app = express();

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

// use bodyparse to create json object from body
app.use(
  bodyParser.json({
    limit: "1mb"
  })
);
app.use(bodyParser.urlencoded({ extended: false }));

// dev only
const buildNumber = 101;

/************ GET and POST requests ************************************************
Redirect requests so that if a custom endpoint function exists on koboApi call it,
otherwise pipe request directly to kobo native API
************************************************************************************/

app.all("*", (req, res, next) => {
  // log the version number for dev / tracking:
  // console.log('api build number', buildNumber)
  // get the endpoint based on the request path
  const endpoint = req.path.split("/")[1];

  if (kobo[endpoint]) {
    kobo[endpoint](req, res);
  } else if (postgresApi[endpoint]) {
    postgresApi[endpoint](req, res);
  } else if (koboShare[endpoint]) {
    koboShare[endpoint](req, res);
  } else if (koboExport[endpoint]) {
    koboExport[endpoint](req, res);
  } else {
    // otherwise pass to kobo native api
    kobo.pipeRequest(req, res);
  }
});

// Expose Express API as a single Cloud Function:
exports.api = functions.https.onRequest(app);

app.listen(3000, "localhost", listen => {
  console.log("Kobo API listening on port 3000");
});

// add export so can be used by test
export default app;
