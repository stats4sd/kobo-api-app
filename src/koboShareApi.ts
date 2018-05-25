import { Request, Response } from "express";
import * as fs from "fs";
import * as request from "request";
import { config } from "../config/config";
import * as collectedData from "./collectedData";
import * as builder from "./formBuilder";
import { _sendRequest, _setOptions } from "./koboApi";

// wrapper around kobo /projects post to avoid typing full user id path
export const customRegisterProject = async (req: Request, res: Response) => {
  if (req.method === "POST") {
    console.log("custom register project", req.body);
    if (req.body && req.body.name && req.body.owner) {
      const body: IRegisterProjectBody = req.body;
      const options: request.Options = _setOptions(req, "/projects");
      options.formData = {
        name: body.name || null,
        owner: `${config.kobotoolbox.server}/users/${body.owner || null}`
      };
      _sendRequest(options, res).catch(err => console.log("error", err));
    } else {
      res.status(400).send("bad request, make sure owner and name specified");
    }
  } else {
    res.status(405).send(`${req.method} method not allowed`);
  }
};

// wrapper around projects to lookup id from project name and delete
// takes body {name:projectName}
// alternatively could keep track of project ID numbers
export const customDeleteProject = async (req: Request, res: Response) => {
  if (req.method === "POST") {
    const options: request.Options = _setOptions({}, "/projects", "GET");
    const projectName = req.body.name;
    if (!projectName) {
      res.status(400).send("bad request, include name");
    } else {
      const getProjects: any = await _sendRequest(options);
      const allProjects: IProject[] = JSON.parse(getProjects.body);
      const toDelete = allProjects.find(p => {
        return p.name === projectName;
      });
      if (toDelete) {
        const newOptions = _setOptions(
          {},
          `/projects/${toDelete.projectid}`,
          "DELETE"
        );
        _sendRequest(newOptions, res);
      }
    }
  } else {
    res.status(405).send(`${req.method} method not allowed`);
  }
};

// import list of usernames into project

// import list of forms into project

// remove list of users from project

// remove list of forms from project

interface IRegisterProjectBody {
  owner: string;
  name: string;
}

interface IRequestBody {
  username: string;
  role: string;
}

interface IProject {
  url: string;
  projectid: number;
  owner: string;
  created_by: string;
  metadata: any;
  starred: boolean;
  users: IProjectUsers[];
  forms: any[];
  public: boolean;
  tags: any[];
  num_datasets: number;
  last_submission_date: any[];
  name: string;
  shared: boolean;
  date_created: string;
  date_modified: string;
}

interface IProjectUsers {
  role: string;
  user: string;
  permissions: string[];
}

// // share one form with one user
// export const shareForm = async (req: IShareRequest, res) => {
//   if (req.method === "POST") {
//     const formId = req.body.form_id.toString();
//     const username = req.body.username;
//     const role = req.body.role;
//     const options: any = _setOptions(req, "forms/" + formId + "/share");
//     // add specific options:
//     options.formData = {
//       username: username,
//       role: role
//     };
//     try {
//       const sendback = await _sendRequest(options, res);
//     } catch (error) {
//       res.status(500).send("there was an error");
//     }
//   } else {
//     res.status(405).send(req.method + " method not allowed");
//   }
// };
