import { Request, Response } from "express";
import * as fs from "fs";
import * as request from "request";
import { config } from "../config/config";
import * as builder from "./formBuilder";
import { sendRequest, setRequestOptions, verifyRequest } from "./koboApi";
import * as postgresApi from "./postgresApi";

const koboURL = config.kobotoolbox.server;



//can be done by vanilla API, so probably can be removed once general pipe request is working
export const shareFormWithUser = async (req: Request, res: Response) => {
  verifyRequest(req, res, ["POST"], ["username", "formid","role"]);
  const body: any = req.body;
  const options: request.Options = setRequestOptions(req,`forms/${body.formid}/share`);
  options.formData = {
    username: body.username,
    role: body.role
  };

  options.headers.Referer = "https://nrc-kobocat.stats4sdtest.online/";
  sendRequest(options,res).catch(err => console.log("error",err));
}

export const shareFormWithProject = async (req: Request, res: Response) => {
  verifyRequest(req,res,["POST"],["formid"]);
  const body: any = req.body;
  const options: request.Options = setRequestOptions(req,`projects/${body.projectid}/forms`);
  options.formData = {
    formid: body.formid
  };

  options.headers.Referer = "https://nrc-kobocat.stats4sdtest.online/";
  sendRequest(options,res).catch(err => console.log("error",err));
}


export const customRegisterTeam = async (req: Request, res: Response) => {
  verifyRequest(req,res,["POST"],["name"]);
  const body: any = req.body;
  const options: request.Options = setRequestOptions(req,`teams`);
  options.formData = {
    name: body.name,
    organization: "NRC"
  };

  options.headers.Referer = "https://nrc-kobocat.stats4sdtest.online/";
  sendRequest(options,res).catch(err => console.log("error",err));
}

export const customRegisterUser = async (req: Request, res: Response) => {
  verifyRequest(req,res,["POST"],["email","username"]);
  const body: any = req.body;
  const options: request.Options = setRequestOptions(req,`profiles`);
  options.formData = {
    name: body.username,
    username: body.username,
    email: body.email
  };
  console.log("data",options.formData);
  options.headers.Referer = "https://nrc-kobocat.stats4sdtest.online/";
  sendRequest(options,res).catch(err => console.log("error",err));
}

export const customAddUserToTeam = async (req: Request, res: Response) => {
  verifyRequest(req,res,["POST"],["username","team_id"]);
  const body: any = req.body;
  const options: request.Options = setRequestOptions(req,`teams/${body.team_id}/members`);
  options.formData = {
    username: body.username,
  };

  options.headers.Referer = "https://nrc-kobocat.stats4sdtest.online/";
  sendRequest(options,res).catch(err => console.log("error",err));
}

// wrapper around kobo /projects post (to avoid typing full user id path)
export const customRegisterProject = async (req: Request, res: Response) => {
  verifyRequest(req, res, ["POST"], ["name", "owner"]);
  const body: IRegisterProjectBody = req.body;
  const options: request.Options = setRequestOptions(req, "projects");
  options.formData = {
    name: body.name || null,
    owner: `${config.kobotoolbox.server}/users/${body.owner || null}`
  };
  sendRequest(options, res).catch(err => console.log("error", err));
};

// takes array of user objects (interface below) and adds to project, returning
// a list of all project users after operation
export const customAddUsersToProject = async (req: Request, res: Response) => {
  verifyRequest(req, res, ["POST"], ["users", "projectid"]);
  const body: IAddUsersBody = req.body;
  const projectid = body.projectid;
  console.log("adding users", body);
  const options = setRequestOptions(
    null,
    `/projects/${projectid}/share`,
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
  const updatedProject: IProject = await getProjectByID(projectid);
  console.log("updated project", updatedProject);
  // *** returns current project users array in all cases (even if operation not successful)
  // additional validation needed client-side (see example in test)
  res.status(200).send(updatedProject.users);
};

// remove user from project

// remove form from project

/************ Helper functions ****************************************************
These are used internally to do common tasks like setting request options and
sending requests
************************************************************************************/
async function getProjectByName(projectName: string) {
  const options: request.Options = setRequestOptions(null, "projects", "GET");
  const getProjects: any = await sendRequest(options);
  const allProjects: IProject[] = JSON.parse(getProjects.body);
  const project = allProjects.find(p => {
    return p.name === projectName;
  });
  return project;
}

// request project by id and parse response to return an IProject object
async function getProjectByID(projectid: number) {
  const options: request.Options = setRequestOptions(
    null,
    `projects/${projectid}`,
    "GET"
  );
  const projectRequest = (await sendRequest(options)) as Request;
  const project: IProject = JSON.parse(projectRequest.body);
  console.log("project", project);
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
  projectid: number;
}
export interface IAddUsersBody {
  users: IAddUsersBodyUser[];
  projectid: number;
}
export interface IAddUsersBodyUser {
  username: string;
  role: "readonly" | "dataentry" | "editor" | "manager";
  remove?: boolean;
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
