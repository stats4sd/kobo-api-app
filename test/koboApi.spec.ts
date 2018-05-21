import * as mocha from 'mocha';
import * as chai from 'chai';
import chaiHttp = require('chai-http');
import app from '../src/index';
chai.use(chaiHttp);
const expect = chai.expect;

// test if correctly piping through to kobo api, checking the /forms endpoint
describe('pipeRequest', () => {
    it('should return forms', () => {
        return chai.request(app).get('/forms')
            .then(res => {
                console.log(`${res.body.body.length} forms returned`)
                expect(res.status).eql(200);
            });
    });
});

// describe('deployForm', () => {
//     it('deploys form from json', () => {
//         return chai.request(app)
//             .post('/forms')
//             .type('form')
//             .send({
//                 survey: 'test',
//                 choices: 'test'
//             })
//             .then(res => {
//                 console.log(`${res.body.body.length} forms returned`)
//                 expect(res.status).eql(200);
//             });
//     });
// });
