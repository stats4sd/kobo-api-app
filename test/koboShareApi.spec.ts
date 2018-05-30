/* tslint:disable:no-unused-expression */
import * as chai from "chai";
import chaiHttp = require("chai-http");
import * as mocha from "mocha";
import * as randomstring from "randomstring";
import { config } from "../config/config";
import app from "../src/index";
import * as koboShareApi from "../src/koboShareApi";

chai.use(chaiHttp);
const expect = chai.expect;

let projectid;

describe("create project", () => {
  it("should create new project", done => {
    if (config.kobotoolbox.username === "") {
      throw new Error("no user provided in config");
    } else {
      chai
        .request(app)
        .post("/customRegisterProject")
        .send({ owner: config.kobotoolbox.username, name: testProjectName })
        .end((err, res) => {
          console.log("project created", res.body.body);
          projectid = res.body.body.projectid;
          console.log("projectid", projectid);
          expect(res.body.body.name).to.eql(testProjectName);
          done();
        });
    }
  });
});

describe("add users to project", () => {
  it("should add all users successfully to project", done => {
    if (config.kobotoolbox.username === "") {
      throw new Error("no user provided in config");
    } else {
      const testProject = addUsersTestData;
      testProject.projectid = projectid;
      chai
        .request(app)
        .post("/customAddUsersToProject")
        .send(testProject)
        .end((err, res) => {
          // *** need to take a closer look at response objects to see if actually successful or not
          const allUsers: koboShareApi.IProjectUsers[] = res.body;
          console.log("project users", allUsers);
          const allUsersLists = allUsers.map(u => {
            return u.user;
          });
          // check all of the users provided exist
          const wasSuccess = addUsersTestData.users.every(user => {
            return allUsersLists.includes(user.username);
          });
          wasSuccess ? done() : done(new Error(JSON.stringify(allUsers)));
        });
    }
  });
});

describe("delete project", () => {
  it("should delete created project", done => {
    if (config.kobotoolbox.username === "") {
      throw new Error("no user provided in config");
    } else {
      console.log("deleting project", projectid);
      chai
        .request(app)
        .del(`/projects/${projectid}`)
        .then(res => {
          console.log("project deleted", res.body);
          expect(res.body.statusCode).to.have.status(200);
          done();
        });
    }
  });
});

/* dynamic project name to be created when running tests
// note: if using public kobo server best to just stick to using same one as they still leave a
// trace after deletion (project ids are numbered sequentially across all site)
*/
const testProjectName = `project-${randomstring.generate({
  charset: "alphabetic",
  length: 6
})}`;

/* example fixed project name (create once and remove delete methods) */
// const testProjectName = "testProject1";

// *** would be better to setup more dummy accounts to test different roles too
const addUsersTestData: koboShareApi.IAddUsersBody = {
  users: [{ username: "stats4sd_demos", role: "editor" }],
  projectid: null
};
