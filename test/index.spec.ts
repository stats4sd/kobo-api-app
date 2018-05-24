/* tslint:disable:no-unused-expression */
// code above no longer needed but server reference in case expect statment terminates in expect property
// e.g. username.exists
// alternatively dirtyChai exposes all of these as function calls with an optional message,
// but again this is no longer required as strings are checked for length not existance or emptiness
import * as chai from "chai";
import chaiHttp = require("chai-http");
import * as dirtyChai from "dirty-chai";
import * as mocha from "mocha";
import { config } from "../config/config";
import app from "../src/index";

chai.use(chaiHttp);
chai.use(dirtyChai);
const expect = chai.expect;

// test if the server is responding (get request at localhost:3000/)
describe("coreServer", () => {
  it("should have server specified", () => {
    expect(config.kobotoolbox.server.length).to.be.above(1);
  });
  it("should have auth credentials", () => {
    if (config.kobotoolbox.token === "") {
      expect(config.kobotoolbox.username.length).to.be.above(1);
    } else {
      expect(config.kobotoolbox.token.length).to.be.above(1);
    }
  });
  it("should return json", () => {
    return chai
      .request(app)
      .get("/")
      .then(res => {
        expect(res.type).to.eql("application/json");
      });
  });
  it("should respond success", () => {
    return chai
      .request(app)
      .get("/")
      .then(res => {
        expect(res.status).eql(200);
      });
  });
});
