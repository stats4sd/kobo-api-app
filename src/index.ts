//node module imports
import * as functions from 'firebase-functions';
import * as express from 'express';
import * as bodyParser from 'body-parser'
import * as cors from 'cors';

//custom module imports
import {config}  from '../config/config';
import * as kobo from './koboApi';
import * as collectedData from './collectedData';


const app = express();

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

// use bodyparse to create json object from body
app.use(bodyParser.json({
    limit: "1mb"
}));

// dev only
const buildNumber = 100

/************ GET and POST requests ************************************************
Redirect requests so that if a custom endpoint function exists on koboApi call it,
otherwise pipe request directly to kobo native API
************************************************************************************/

app.all('*', function (req, res, next) {

    //log the version number for dev / tracking:
    console.log('api build number', buildNumber)
    
    //get the endpoint based on the request path
    const endpoint = req.path.split('/')[1]
    
    if (kobo[endpoint]) {
        // run custom function if exists
        console.log('running custom function', req.method, endpoint)
        kobo[endpoint](req, res)
    }
    else{
        //added option to pipe request to data handling:
    
        if(collectedData[endpoint]){
            console.log("running custom data function", req.method, endpoint);
            collectedData[endpoint](req, res);
        }
        
        else {
            // otherwise pass to kobo native api
            console.log('piping request', req.method, endpoint)
            kobo.pipeRequest(req, res)
        }
    }
    
})


// Expose Express API as a single Cloud Function:
exports.api = functions.https.onRequest(app);

app.listen(3000, "localhost", function(listen){
    console.log("Kobo API listening on port 3000");
})

// add export so can be used by test
export default app






