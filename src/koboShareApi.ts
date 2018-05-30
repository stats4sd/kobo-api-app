import { Request, Response } from "express";
import * as fs from "fs";
import * as request from "request";
import { config } from "../config/config";
import * as builder from "./formBuilder";
import { sendRequest, setRequestOptions, verifyRequest } from "./koboApi";
import * as postgresApi from "./postgresApi";

// wrapper around kobo /projects post (to avoid typing full user id path)
export const customRegisterProject = async (req: Request, res: Response) => {
  verifyRequest(req, res, ["POST"], ["name", "owner"]);
  const body: IRegisterProjectBody = req.body;
  const options: request.Options = setRequestOptions(req, "/projects");
  options.formData = {
    name: body.name || null,
    owner: `${config.kobotoolbox.server}/users/${body.owner || null}`
  };
  sendRequest(options, res).catch(err => console.log("error", err));
};

// wrapper around projects to lookup id from project name and delete
// takes body {name:projectName}
// alternatively could keep track of project ID numbers
export const customDeleteProject = async (req: Request, res: Response) => {
  verifyRequest(req, res, ["POST"], ["name"]);
  const body: IDeleteProjectBody = req.body;
  const options: request.Options = setRequestOptions({}, "/projects", "GET");
  const projectName = req.body.name;
  const projectToDelete = await getProjectByName(projectName);
  if (projectToDelete) {
    const newOptions = setRequestOptions(
      {},
      `/projects/${projectToDelete.projectid}`,
      "DELETE"
    );
    sendRequest(newOptions, res);
  }
};

// takes array of user objects (interface below) and adds to project, returning
// a list of all project users after operation
export const customAddUsersToProject = async (req: Request, res: Response) => {
  verifyRequest(req, res, ["POST"], ["users", "project"]);
  const body: IAddUsersBody = req.body;
  const projectName = body.project;
  let project = await getProjectByName(projectName);
  if (!project) {
    res.status(400).send("project not found");
  } else {
    const options = setRequestOptions(
      {},
      `/projects/${project.projectid}/share`,
      "PUT"
    );
    // main loop to sequentially add user to project
    for (const user of body.users) {
      options.formData = {
        username: user.username,
        role: user.role
      };
      await sendRequest(options);
    }
    project = await getProjectByName(projectName);
    // *** returns current project users array in all cases (even if operation not successful)
    // additional validation needed client-side (see example in test)
    res.status(200).send(project.users);
  }
};

// add forms to project (by name)
// (not currently required as done individuallyi with project id number and /projects/{pk}/forms POST request)

// remove user from project

// remove form from project

/************ Helper functions ****************************************************
These are used internally to do common tasks like setting request options and
sending requests
************************************************************************************/
async function getProjectByName(projectName: string) {
  const options: request.Options = setRequestOptions({}, "/projects", "GET");
  const getProjects: any = await sendRequest(options);
  const allProjects: IProject[] = JSON.parse(getProjects.body);
  const project = allProjects.find(p => {
    return p.name === projectName;
  });
  return project;
}

/************ Interfaces ***********************************************************
These help to define the expected data structures
************************************************************************************/

// enpoint request bodies, exported to be available to test
export interface IRegisterProjectBody {
  owner: string;
  name: string;
}
export interface IDeleteProjectBody {
  name: string;
}
export interface IAddUsersBody {
  users: IAddUsersBodyUser[];
  project: string;
}
export interface IAddUsersBodyUser {
  username: string;
  role: "readonly" | "dataentry" | "editor" | "manager";
  remove?:boolean
}

// kobo api repsponses
export interface IProject {
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

export interface IProjectUsers {
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
//     const options: any = setRequestOptions(req, "forms/" + formId + "/share");
//     // add specific options:
//     options.formData = {
//       username: username,
//       role: role
//     };
//     try {
//       const sendback = await sendRequest(options, res);
//     } catch (error) {
//       res.status(500).send("there was an error");
//     }
//   } else {
//     res.status(405).send(req.method + " method not allowed");
//   }
// };
