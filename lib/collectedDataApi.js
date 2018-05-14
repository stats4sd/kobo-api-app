"use strict";
/*
Api endpoints for handling data collected via the ODK forms on Kobo
 */
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const ini_config = require("./config");
const config = ini_config.config;
//Connect to postgres local db
const pool = new pg_1.Pool({
    database: config.pg.db_name,
    user: config.pg.username,
    host: config.pg.host,
    password: config.pg.password,
    port: config.pg.port
});
const koboURL = config.kobotoolbox.server;
const auth = "Basic" + config.kobotoolbox.token;
exports.jsonPOST = function (req, res) {
    console.log('receiving data from json POST', req.method, req.path);
    if (req.method != "GET" && req.method != "POST") {
        res.status(405).send("Please use a different method");
    }
    if (req.method == "GET") {
        res.status(200).send("This is working. If you don't GET it, you might GET it");
    }
    if (req.method == "POST") {
        //receive data; 
        //
        let record = req.body;
        console.log("##############################");
        console.log("record = ", record);
        console.log("##############################");
        /*
        POSTGRES TABLE:
  
        field_name -> thing to populate with
  
        record_id -> record._uuid
        form_id -> record._form_pmt_id
        record_data -> record;
         */
        const query = {
            text: "INSERT INTO xls_collected_data(record_id,form_id,record_data) VALUES($1,$2,$3)",
            values: [
                record._uuid,
                record._form_kobo_id,
                record
            ]
        };
        pool.connect()
            .then(function (client) {
            return client.query(query)
                .then(function (queryRes) {
                console.log("queryRes: ", queryRes);
                if (res) {
                    res.status(200).send({
                        rows: queryRes.rows
                    });
                }
                else {
                    return true;
                }
                client.release();
                console.log("done - client released");
            });
        });
    } //END IF POST
};
//# sourceMappingURL=collectedDataApi.js.map