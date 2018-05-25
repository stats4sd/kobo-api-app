import * as chai from "chai";
import chaiHttp = require("chai-http");
import * as mocha from "mocha";
import * as randomstring from "randomstring";
import { config } from "../config/config";
import app from "../src/index";
import * as koboShareApi from "../src/koboShareApi";

chai.use(chaiHttp);
const expect = chai.expect;

const testProjectName = `project-${randomstring.generate({
  charset: "alphabetic",
  length: 6
})}`;

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
          expect(res, JSON.stringify(res.body)).to.have.status(200);
          done();
        });
    }
  });
});

describe("delete project", () => {
  it("should delete created project", done => {
    if (config.kobotoolbox.username === "") {
      throw new Error("no user provided in config");
    } else {
      chai
        .request(app)
        .post("/customDeleteProject")
        .send({ name: testProjectName })
        .end((err, res) => {
          expect(res, JSON.stringify(res.body)).to.have.status(200);
          done();
        });
    }
  });
});

// describe("delete project", () => {
//   it("should return forms", () => {
//     return chai
//       .request(app)
//       .get("/forms")
//       .then(res => {
//         expect(res.status, `${res.body.body.length} forms returned`).eql(200);
//       });
//   });
// });
