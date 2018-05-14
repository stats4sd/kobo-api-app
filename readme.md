# What is this?

A node app that essentially exposes a set of API endpoints for interacting with Kobotoolbox in various ways.

It extends the functionality of the https://kc.kobotoolbox.org/api/v1/ apis, allowing other applications to create forms and users, assign sharing permissions, and extract data from these forms.

## Deployment and testing

Running the app requires npm / node to be installed.

On a server as a node app:
1. Clone the repository into a folder on your server.
2. Run `npm install` or `yarn` to install the node module dependancies
3. Run `node lib/index.js` to start the app on port 3000.

On a firebase project using Firebase Functions:

TODO: add setup instructions.

Comments:
* Make sure the port is accessible for GET, POST, PUT requests (probably via port forwarding through Nginx or Apache).

TODO: add something about security / access / kobo accounts.

## Endpoints / Functions list:
__TODO: add better explanations of functions__
### KoboAPi.ts
* **getForms**: example function - just passes the request onto the kobo API.
* **customDeployForm** - receives an XLSX Form in JSON format, builds it and deploys to kobo.
* **customUpdateForm** - overwrites an existing form with a new XLSX form, received in JSON format.
* **customSetFormInfo** - updates form information (name, etc)
* **customArchiveForm** - uses the customSetFormInfo to set a given form as "downloadable: false" (effectively archiving it on Kobotools)
* **customRestoreForm** - uses the customSetFormInfo to set a given form as "downloadable: true".
* **countRecords**: gets the number of records submitted for a given form_id.
* **pullData**: _needs refactoring / testing_ - receives a form_id and set of existing record UUIDs, and gets only the new records from kobo.
* **addCsv**: _probaly needs checking_ receives data in JSON form (via res.body.data_file), converts it into a csv file via buildCSV, and then uploads that file to the given kobo form. Current version checks first to see if an existing media file exists with the same name, and deletes it if it does to avoid conflict.
* **uploadCsv**: _probaly needs checking_ seperated function from addCsv.
* **shareForm**: _is pretty basic, could be extended by allowing many users to be added to one form, or one user to be added to many forms._ Shares a form (specified via req.body.form_id) with a user (specified by req.body.username) and grants a role (specified by req.body.role);

### collectedData.ts
* **jsonPOST**: _no idea if this currently works..._ acts as a listener for JSON POST requests sent directly by Kobotools. Receives a JSON POST record and inserts it into a local database. 

**NOTE**: The jsonPOST function is a placeholder (and not well tested). It's setup to run with a postgresql database, but could be configured to do anything with the receiving data.

TODO: write up the jsonPOST options using examples from various previous node apps that do the same thing.

### formBuilter.ts
* **buildXLSX**: takes a JSON object containing a form definition (must include a survey, choices and settings object), and builds a complete xlsx file.
* **buildCSV**: takes a JSON object (that should be 1 level deep) and turns the data into a csv file. Keys not present in every JSON entry will be included, with nulls for the rows that did not contain that key.


## Possible next features
Investigate using kobotools 'projects' to easily share multiple forms with multiple users. This would involve functions to:

* Add form(s) to a project
* Remove form(s) from a project
* Add user(s) to a project
* Remove user(s) from a project


## Development notes

The functions are written in typescript, you can still extend with javascript if desired. The main difference will be how external packages are imports:
`const pckgName = require('npm-package-name')` -> `import * as pckgName from 'npm-package-name'`
`exports.myFunction = firebaseFunctions.{type}.{...}` - > `export const myFunction = firebaseFunctions.{type}.{...}`

more info can be found at: https://firebase.google.com/docs/functions/typescript
and: https://github.com/firebase/functions-samples/tree/master/typescript-getting-started

Note. Linting has been added on compile/deploy to flag issues, and is useful to pick up on common mistakes before deployment. To support windows environment `$RESOURCE_DIR` has been changed to `%RESOURCE_DIR%` in the main repo folder firebase.json. You may need to change back for linux environment

 - If the .eslintrc.json file is not pulled with github, you migth need to initialise it: `eslint --init`

### Setting up ts compiling on Mac:

 - Ensure typescript is installed: `npm install -g typescript`
 - run `tsc -w` within the functions folder to set typescript to watch the folder and compile on save (it will watch the `src` folder, as defined by the tsconfig.json file);
 

### Converting functions code to run as Node app (not on Firebase)
 - Added "app.listsn()" directive to the main index.ts tile.
 - Run `node lib/index.js` to run node app.

Now, this can be run locally or deployed to a server to run (e.g. with pm2 for continuous running), like any other Node / express project.

Note: in this config, you do not need to add the 'api' to the url when sending requests to the api. (As that's the name of the Firebase cloud function, but we're skipping that part when running on Node)


## Future development.
This makes use of the https://kc.kobotoolbox.org/api/v1/ apis. Given the lack of updates and unclear / incomplete / sometimes incorrect documentation given for this API, this should probably be rewritten at some point to interact with the newer API (e.g. kf.kobotoolbox.org/assets/ ). But, for now, the older version works ok for what we're trying to achieve.
