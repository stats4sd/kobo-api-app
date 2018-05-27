/*
Api endpoints for handling data collected via the ODK forms on Kobo
 */

import * as fs from "fs";
import { Client, Pool } from "pg";
import * as request from "request";
import { config } from "../config/config";
import { getLatestSubmissions, IPullDataBody } from "./koboExportApi";

// Connect to postgres local db
const pool = new Pool({
  database: config.pg.db_name,
  user: config.pg.username,
  host: config.pg.host,
  password: config.pg.password,
  port: config.pg.port
});

const koboURL = config.kobotoolbox.server;
const auth = "Basic" + config.kobotoolbox.token;

// check postgres records for a given form and compare to kobo,
// pull missing records and update accordingly
export const postgresUpdateForm = async (req, res) => {
  const body: IPullDataBody = req.body;
  const pullDataRes = await getLatestSubmissions(
    body.formID,
    body.latestSubmissionID
  );
  for (const record of pullDataRes.data) {
    const upload = await postgresJsonPOST({
      method: "POST",
      body: record
    });
  }
  res.send(pullDataRes);
};

export const postgresJsonPOST = async (req, res?) => {
  console.log("receiving data from json POST", req.method, req.path);
  switch (req.method) {
    case "GET":
      res
        .status(200)
        .send("This is working. If you don't GET it, you might GET it");
      break;

    case "POST":
      const record = req.body;
      console.log(
        ` 📰Record
        ${record}
      `
      );
      /*
      POSTGRES TABLE:
  
      field_name -> thing to populate with
  
      record_id -> record._uuid
      form_id -> record._form_pmt_id
      record_data -> record;
       */

      const query = {
        text:
          "INSERT INTO xls_collected_data(record_id,form_id,record_data) VALUES($1,$2,$3)",
        values: [record._uuid, record._form_kobo_id, record]
      };

      pool.connect().then(client => {
        return client.query(query).then(queryRes => {
          console.log("queryRes: ", queryRes);
          if (res) {
            res.status(200).send({
              rows: queryRes.rows
            });
          } else {
            return true;
          }
          client.release();
          console.log("done - client released");
        });
      });
      break;

    default:
      res.status(405).send("Please use a different method");
      break;
  }
};
