// node module imports
import * as request from 'request';
import * as fs from 'fs';

// custom module imports
import * as collectedData from './collectedData';
import * as builder from './formBuilder';
import { config } from '../config/config';
import { Request, Response } from 'express';

const koboURL = config.kobotoolbox.server
let auth

if (config.kobotoolbox.token) {
    const auth = "Basic" + config.kobotoolbox.token
}

// standard function to redirect non-custom requests directly to kobo
export const pipeRequest = function (req, res) {
    console.log('piping request', req.method, req.path)
    // pipe requests directly to kobo api
    const options = _setOptions(req)
    _sendRequest(options, res)
}

/************ Custom Endpoints ****************************************************
These are codeblocks called from api requests directly to the function name
e.g. /getForms
Additional parameters may appear either in POST message body or via path
e.g. /getForms/:formID
************************************************************************************/

// Example function that gets forms in same way standard api does (not used, just for refrence)
export const getForms = function (req, res) {
    if (req.method === "GET") {
        const options = _setOptions(req)
        _sendRequest(options, res)
    }
    else { res.status(405).send(req.method + " method not allowed") }
}

// Receives JSON form data, builds form and deploys to kobo
export const customDeployForm = async function (req: Request, res: Response) {
    if (req.method === "POST") {
        const form = req.body
        // build form and send request to kobo forms api, returning forms object
        const build = await builder.buildXLSX(form)
        const filePath: string = build['filePath']
        const options: any = _setOptions(req, 'forms')
        // add formData to standard options object
        console.log(filePath)
        options.formData = {
            xls_file: fs.createReadStream(filePath)
        }
        // example intercepting standard response object from _sendRequest function
        // probably not necessary as sending same form back that was sent (more for dev)
        const sendback:any = await _sendRequest(options)
        const msg = JSON.parse(sendback.body)
        res.send({
            form: form,
            msg: msg,
            responseCode: sendback.responseCodes
        })
    }
    else {
        res.status(405).send(req.method + " method not allowed")
    }
}

// Combination of customDeployForm above and customSetFormInfo code below
// could be better merged if included both form (fields) and formData (xlsform) fields
export const customUpdateForm = function (req, res) {
    if (req.method === "PATCH") {
        const form: koboForm = req.body
        // build form and send request to kobo forms api, returning forms object
        builder.buildXLSX(form).then(
            build => {
                const filePath: string = build['filePath']
                const options: any = _setOptions(req, 'forms/' + form.kobo_id)
                options.formData = {
                    xls_file: fs.createReadStream(filePath)
                }
                _sendRequest(options).then(body => {
                    res.send({
                        form: form,
                        msg: body,
                    })
                })
            })
    }
    else {
        res.status(405).send(req.method + " method not allowed")
    }
}

// generic update form function, can be passed update values in body 
// or passed from other functions
export const customSetFormInfo = function (req, res, _update?, _urlToReplace?) {
    if (req.method === "PATCH") {
        console.log("archive req body", req.body);
        const options: any = _setOptions(req, "forms/" + req.body.kobo_id)
        // add form data using either supplied or body
        let update = _update
        if (!_update) {
            console.log('setting body as form', req.body, typeof req.body)
            update = req.body
        }
        options.form = update
        _sendRequest(options, res)
    }
    else { res.status(405).send(req.method + " method not allowed") }
}

// Archive forms
export const customArchiveForm = function (req, res) {
    customSetFormInfo(req, res, { downloadable: 'false' }, 'customArchiveForm')
}

// Restore archived forms - same as above except {downloadable:'true'}
export const customRestoreForm = function (req, res) {
    customSetFormInfo(req, res, { downloadable: 'true' }, 'customRestoreForm')
}

// countRecords:
// Expects request to include a "kobo_id" property, containing an id of a form on the kobo server. 
// Should send back a count of all data records found for that form.
export const countRecords = function (req, res) {
    console.log("countRecords request ", req.method, req.path);

    const body = req.body;

    if (!body.kobo_id) {
        res.status(400).send("error - please include a kobo form id in the post request");
        return;
    }

    const options: any = _setOptions(req, 'data/' + body.kobo_id + '?fields=["_id"]');
    options.method = "GET";

    _sendRequest(options).then(function (sendBack: any) {

        //if request was successful, get the ids to count:
        if (sendBack.statusCode === 200) {
            const ids: any = JSON.parse(sendBack.body);

            console.log("status_code:", sendBack.statusCode)
            console.log(ids.length);
            res.send({
                count: ids.length,
                statusCode: sendBack.statusCode,
                kobo_id: body.kobo_id
            });
        }


        else {
            res.send({
                statusCode: sendBack.statusCode,
                body: sendBack.body
            })
        }


    })


}

// pullData:
// Goal - to send a form_id and a set of existing record IDs, and return only 'new' record data.

// This needs refinement - I wrote it pretty quickly and without a clear picture of what I would be sending in the req and getting back in the res.

// I initially thought that I'd need to be able to get data from multiple kobo forms in a single request, but given we need to send one request per form to the actual kobo server regardless of what happens here, I now don't think doing anything fancy like the for loop on kobo_ids actually helps much.

// So it probably makes sense to simplify this and just say it takes a req as {kobo_id:int, existing_ids:array} and gives back a set of 'new' records for that single form.
export const pullData = function (req, res) {
    console.log('view request', req.method, req.path)

    if (req.method === "POST") {
        const requestBody = req.body;
        const existing_ids = JSON.parse(requestBody.existing_ids)
        console.log(existing_ids)
        let cleanIds = [];
        existing_ids.forEach(function (id, index) {
            if (id !== null) {
                cleanIds = existing_ids[index];
            }
        })

        console.log("new existing IDs list = ", cleanIds)
        //reqest data for every kobo_id sent in the reqeust
        for (const kobo_id of requestBody.kobo_ids) {
            //make the the kobo_id is not null
            if (kobo_id !== null) {

                /*
                2018 - April: NOTE - The Kobo API documentation describes a way of querying records by tag, using "?tags=tag1,tag2" as a GET parameter, (and also "?not_tagged=tag1", which would be ideal for this). Annoyingly, this doesn't work, and these parameterrs do nothing to modify the data returned from the GET request.

                For now - we request ALL the records, then filter within this code. Not efficient, as we must pull all the data every time, but it's the best we can do quickly for now.
                */
                console.log("kobo_id = ", kobo_id)
                const options: any = _setOptions(req, 'data/' + kobo_id)
                options.method = "GET";

                console.log("options: ", options);

                _sendRequest(options).then(function (sendBack: any) {

                    //body is the full set of records from form with id = kobo_id;
                    const records: any = JSON.parse(sendBack.body);
                    //console.log(records);
                    //keep only NEW records (i.e. ones without the "pulled" tag)


                    let count: number = 0;
                    const newRecords: any = [];
                    let newCount: number = 0;

                    console.log("##################################")
                    //console.log("records:",records)
                    console.log("##################################")
                    for (const record of records) {
                        //console.log("record = ",record);
                        count++

                        // find records without the "pulled tag" and add them to the new records array;
                        if (!existing_ids.some(function (id, index) {
                            return id === record._uuid;
                        })) {
                            record._form_kobo_id = kobo_id;
                            newRecords.push(record);
                            newCount++;


                            const upload = collectedData.jsonPOST({
                                method: "POST",
                                body: record
                            })
                        }

                    } //end for records

                    console.log("new Records = ", newRecords);


                    console.log("##################################")
                    console.log("count = ", count)
                    console.log("##################################")


                    console.log("##################################")
                    console.log("newCount = ", newCount)
                    console.log("##################################")

                    /// NOTE - the kobo tagging system for records  doesn't work reliably.
                    //send a request to Kobotools that adds the "pulled" tag to all the form records (as they've now been pulled)
                    //
                    //We can do this by adding the tag to the form, which automatically applies the tag to all the existing records. (much easier than tagging each record individually!).
                    // const updateOptions: any = _setOptions(req, 'forms/'+kobo_id+"/labels");
                    // updateOptions.body = {"tags":"pulled"};
                    // updateOptions.json = true;

                    // _sendRequest(updateOptions).then(function(sendBack: any){
                    // console.log("tags updated for form: ", sendBack.body );
                    //send the new records back.
                    res.send({
                        request: requestBody,
                        body: newRecords
                    })
                })
            } // end if kobo_id != null
        } // end for kobo_ids
    } //end if POST
    else {
        res.status(405).send(req.method + " method not allowed");
    }
}



export const addCsv = function (req, res) {
    if (req.method === "POST") {

        const dataType = req.body.data_type;
        const dataValue = req.body.data_value;
        const xform = req.body.xform;
        const dataFile = req.body.data_file;

        //first,  check if the form already has an attached file with the given name.
        const checkOptions: any = _setOptions(req, 'metadata?xform=' + xform);
        checkOptions.method = "GET";

        _sendRequest(checkOptions).then(function (checkBack: any) {
            console.log("checkback", checkBack);
            const metaData = JSON.parse(checkBack.body);
            let url = ""
            const fileExists: boolean = metaData.some(function (item, index) {
                url = item.url;
                return item.data_value = dataValue;
            })

            if (fileExists) {
                const deleteOptions = _setOptions(req);
                deleteOptions.method = "DELETE";
                deleteOptions.url = url;

                _sendRequest(deleteOptions).then(function (deleteBack) {
                    uploadCsv(req, res);
                })
            }
            else {
                uploadCsv(req, res)
            }
            console.log("#####")
            console.log("url = ", url);
            console.log("#####");


        })
    }
    else {
        res.status(405).send(req.method + " method not allowed")
    }
}

function uploadCsv(req, res) {
    //convert data_file to csv;
    const dataType = req.body.data_type;
    const dataValue = req.body.data_value;
    const xform = req.body.xform;
    const dataFile = req.body.data_file;

    builder.buildCSV(dataFile, dataValue).then(build => {
        const filePath: string = build['filePath']
        const options: any = _setOptions(req, 'metadata')

        options.formData = {
            data_type: dataType,
            data_value: dataValue,
            xform: xform,
            data_file: fs.createReadStream(filePath)
        }


        _sendRequest(options).then(function (sendBack: any) {
            let msg: any;
            try {
                msg = JSON.parse(sendBack.body)
            }
            catch (error) {

                msg = {
                    body: sendBack.body,
                    err: error
                }
            }
            res.send({
                responseCode: sendBack.responseCodes,
                msg: msg
            })
        }) //end sendRequest

    })
}


// share one form with one user
export const shareForm = function (req, res) {
    if (req.method === "POST") {

        const form_id = req.body.form_id.toString();
        const username = req.body.username;
        const role = req.body.role;

        const options: any = _setOptions(req, "forms/" + form_id + "/share");

        // add specific options:
        options.formData = {
            "username": username,
            "role": role
        };

        _sendRequest(options, res).then(function (sendback: any) { })
    }
    else {
        res.status(405).send(req.method + " method not allowed")
    }
}


/************ Helper functions ****************************************************
These are used internally to do common tasks like setting request options and
sending requests
************************************************************************************/

function _setOptions(req, newPath?) {

    /*********** IMPORTANT! ***********************************
    for dev purposes adding admin auth credentials.
    Ideally these should be passed in request and this
    line removed. Also spoofing origin (remove on live)
    *********************************************************/

    //headers sent by WordPress are getting in the way. Instead, reset headers and build custom set:
    req.headers = {};

    //add authorization - currently admin-only, will be passed from WordPress soon
    req.headers.authorization = auth
    req.headers.origin = "api.stats4sdtest.online"
    req.headers.host = "stats4sdtest.online"

    let finalPath = newPath;

    console.log("finalPath", finalPath);
    // set options for method, url and headers, including any path update
    if (!newPath) {
        finalPath = req.path;
    }

    const options = {
        method: req.method,
        url: koboURL + finalPath,
        headers: req.headers
    };

    //console.log("options",options);
    return options
}

function _sendRequest(options, res?) {
    // send request to kobo
    return new Promise((resolve, reject) => {
        request(options, function (err, response, body) {
            // console.log('response error', err)
            // fs.writeFile('/tmp/test.json',JSON.stringify(response,null,2),function(err){
            //     if(err){
            //         console.log(err);
            //     }
            //     console.log("response written to file");
            // })
            // console.log('response body', body)
            // handle errors
            if (err) {
                if (res) {
                    res.status(400).send({
                        error: err,
                        options: options,
                        response: response,
                        body: body
                    })
                }
                else {
                    resolve({
                        error: err,
                        options: options,
                        response: response,
                        body: body
                    })
                }

            }
            // handle response. If original res object specified automatically send response containing body; otherwise pass back to promise resolve.
            else {
                //handle non 200 responses, so status codes can be passed back to the originating app with the rest of the respnose.
                if (response.statusCode > 299 || response.statusCode < 200) {
                    if (res) {
                        res.status(response.statusCode).send({
                            error: "unsuccessful request",
                            options: options,
                            response: response,
                            body: body
                        })
                    }

                    resolve(response)
                }
                else {
                    try {
                        // attempt to parse response to return an object, with fallback of returning string
                        const bodyObj = JSON.parse(body);
                        const sendBack = {
                            body: bodyObj,
                            statusCode: res.statusCode
                        }

                        if (res) { res.send(sendBack) }
                        resolve(sendBack)

                    } catch (error) {
                        if (res) { res.send({ body: body, statusCode: response.statusCode }) }
                        resolve({ body: body, statusCode: response.statusCode })
                    }
                }
            }
        })
    })
}

interface koboForm {
    kobo_id: string
}






