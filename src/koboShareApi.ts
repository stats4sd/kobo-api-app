import { Request, Response } from "express";
import * as fs from "fs";
import * as request from "request";
import { config } from "../config/config";
import * as builder from "./formBuilder";
import { sendRequest, setRequestOptions, verifyRequest } from "./koboApi";
import * as postgresApi from "./postgresApi";

import * as tough from "tough-cookie";

const koboURL = config.kobotoolbox.server;


/************ USER Handling ****************************************************/
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

// ***** TEAM HANDLING
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

export const customResetPassword = async (req: Request, res: Response) => {
  verifyRequest(req,res,["POST"],["current_password","new_password","username"]);
  const body: any = req.body;
  const username: string = body.username
  const options: request.Options = setRequestOptions(null,`profiles/${username}/change_password`,"POST");
  options.formData = {
    current_password: body.current_password,
    new_password: body.new_password
  }

  console.log("data",options.formData);

  // Get cookie and set CSRF header for extra-special password-changing auth:

  const jar: request.CookieJar = request.jar();

  const cookieGet = (await sendRequest({
    url: config.kobotoolbox.server_root,
    jar: jar
  })) as Request;


  options.jar = jar;

  //unpack cookie to get at csrftoken:
  const cookies: tough.Cookie[] = jar.getCookies(config.kobotoolbox.server_root);
  const cookieJSON = cookies[0].toJSON()
  
  if(cookieJSON.key === "csrftoken"){
    options.headers['X-CSRFToken'] = cookieJSON.value
  }

 options.headers.Referer = config.kobotoolbox.server_root;
 sendRequest(options,res).catch(err => console.log("error",err));
}

/************ Project Handling ****************************************************/
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
// takes array of user objects (interface below) and adds to project, returning
// a list of all project users after operation
export const customRemoveUsersFromProject = async (req: Request, res: Response) => {
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
      role: user.role,
      remove: true
    };
    await sendRequest(options);
  }
  const updatedProject: IProject = await getProjectByID(projectid);
  console.log("updated project", updatedProject);
  // *** returns current project users array in all cases (even if operation not successful)
  // additional validation needed client-side (see example in test)
  res.status(200).send(updatedProject.users);
};


/************ Sharing Forms ****************************************************/
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

// can be done by vanilla API, so probably can be removed once general pipe request is working
export const customShareFormWithUsers = async (req: Request, res: Response) => {
  verifyRequest(req, res, ["POST"], ["users", "formid"]);
  const body: any = req.body;
  const formid: any = body.formid;
  const options: request.Options = setRequestOptions(
                                                     null,
                                                     `/forms/${body.formid}/share`,
                                                     "POST");
  options.headers.Referer = "https://nrc-kobocat.stats4sdtest.online/";

  for (const user of body.users){
    options.formData = {
      username: user.username,
      role: user.role
    };
    await sendRequest(options);
  }
  const updatedForm = await getFormByID(formid);
  res.status(200).send(updatedForm);
}

export const shareFormWithProject = async (req: Request, res: Response) => {
  verifyRequest(req,res,["POST"],["formid","projectid"]);
  const body: any = req.body;
  const options: request.Options = setRequestOptions(req,`projects/${body.projectid}/forms`);
  options.formData = {
    formid: body.formid
  };

  options.headers.Referer = "https://nrc-kobocat.stats4sdtest.online/";
  sendRequest(options,res).catch(err => console.log("error",err));
}


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

async function getFormByID(formid: number) {
  const options: request.Options = setRequestOptions(
                                                     null,`forms/${formid}`,
                                                     "GET"
                                                     );
  const formRequest = (await sendRequest(options)) as Request;
  const form: any = JSON.parse(formRequest.body);
  return form;
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

export interface IAddUserToProjectsBody {
  user: IAddUsersBodyUser;
  projects: number[];
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
