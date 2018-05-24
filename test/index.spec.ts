import * as chai from "chai";
import chaiHttp = require("chai-http");
import * as mocha from "mocha";
import { config } from "../config/config";
import app from "../src/index";

chai.use(chaiHttp);
const expect = chai.expect;

// test if the server is responding (get request at localhost:3000/)
describe("coreServer", () => {
  it("should have server specified", () => {
    expect(config.kobotoolbox.server !== "");
  });
  it("should have auth credentials", () => {
    expect(
      config.kobotoolbox.token !== "" ||
        (config.kobotoolbox.username !== "" &&
          config.kobotoolbox.password !== "")
    );
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
