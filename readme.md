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
__add setup instructions here__

Comments:
* Make sure the port is accessible for GET, POST, PUT requests (probably via port forwarding through Nginx or Apache).

__add something about security / access / kobo accounts.__

## Endpoints / Functions list:

### KoboAPi.ts
* getForms
* customDeployForm
* customUpdateForm
* customSetFormInfo
* customArchiveForm
* customRestoreForm
* viewData
* countRecords
* pullData



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
