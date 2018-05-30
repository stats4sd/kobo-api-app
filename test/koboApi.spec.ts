import * as chai from "chai";
import chaiHttp = require("chai-http");
import * as mocha from "mocha";
import * as request from "request";
import { IBuilderForm } from "../src/formBuilder";
import app from "../src/index";
import { exampleForm } from "./formBuilder.spec";
chai.use(chaiHttp);
const expect = chai.expect;

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

// NOTE - this test fails due to issue sending local file (#)
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
        console.log("res.body", res.body);
        expect(res.status).eql(200);
      });
  });
});
