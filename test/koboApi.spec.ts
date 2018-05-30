import * as chai from "chai";
import chaiHttp = require("chai-http");
import * as mocha from "mocha";
import * as randomstring from "randomstring";
import * as request from "request";
import { IBuilderForm } from "../src/formBuilder";
import app from "../src/index";
import { exampleForm } from "./formBuilder.spec";
chai.use(chaiHttp);
const expect = chai.expect;

// this will be populated on successful creation so that it can also be deleted
let testFormID;

// test if correctly piping through to kobo api, checking the /forms endpoint
describe("pipeRequest", () => {
  it("should return forms", () => {
    return chai
      .request(app)
      .get("/forms")
      .then(res => {
        console.log(`${res.body.body.length} forms returned`);
        expect(res.status).to.eql(200);
      });
  });
});

describe("deploy custom json form", () => {
  it("deploys form from json", () => {
    return chai
      .request(app)
      .post("/customDeployForm", err => {
        console.log("err", err);
      })
      .type("json")
      .send(exampleForm)
      .then(res => {
        console.log("form created with id", res.body.body.formid);
        testFormID = res.body.body.formid;
        expect(res.body.statusCode).eql(200);
      });
  });
});

describe("deploy delete form", () => {
  it("should delete created form", () => {
    return chai
      .request(app)
      .del(`/forms/${testFormID}`, err => {
        console.log("err", err);
      })
      .type("form")
      .send({ formid: testFormID })
      .then(res => {
        console.log("res.body", res.body);
        expect(res.body.statusCode).eql(204);
      });
  });
});
