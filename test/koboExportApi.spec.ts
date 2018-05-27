/* tslint:disable:no-unused-expression */
import * as chai from "chai";
import chaiHttp = require("chai-http");
import * as mocha from "mocha";
import { config } from "../config/config";
import app from "../src/index";
import * as koboExportApi from "../src/KoboExportApi";

chai.use(chaiHttp);
const expect = chai.expect;

describe("pull latest submissions", () => {
  it("should pull data", done => {
    chai
      .request(app)
      .post("/customPullData")
      .send(pullRequestData)
      .end((err, res) => {
        const r: koboExportApi.IPullDataRes = res.body;
        console.log(r);
        expect(r.countTotal).to.be.above(0);
        if (r._latestSubmissionID) {
          expect(r.countNew, "no new submissions found").to.be.above(0);
        }
        done();
      });
  });
});

/*  NOTE
    hardcoded test example for use by Chris, needs to be generalised.
    in future should be placed after methods to create form, upload multiple
    submissions and then pull a subset
*/
const pullRequestData: koboExportApi.IPullDataBody = {
  formID: 67050,
  latestSubmissionID: 1582382
};
