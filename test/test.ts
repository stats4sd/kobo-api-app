import * as mocha from 'mocha';
import * as chai from 'chai';
import chaiHttp = require('chai-http');

import app from '../src/index';

chai.use(chaiHttp);
const expect = chai.expect;

// test if the server is responding (get request at localhost:3000/)
describe('coreServer', () => {
    it('should return json', () => {
        return chai.request(app).get('/')
            .then(res => {
                expect(res.type).to.eql('application/json');
            });
    });

    //   better to assert things that are equal, but can use not
    it('should not be error', () => {
        return chai.request(app).get('/')
            .then(res => {
                console.log('res', res.status)
                expect(res.status).not.to.eql(400);
            });
    });

});












