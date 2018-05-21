import * as mocha from 'mocha';
import * as chai from 'chai';
import * as formBuilder from '../src/formBuilder'
const expect = chai.expect;

// test if correctly piping through to kobo api, checking the /forms endpoint
describe('form builder', () => {
    it('should build form from json', async () => {
        formBuilder.buildXLSX(exampleForm)
        const res = await formBuilder.buildXLSX(exampleForm)
        expect(res).to.equal('built')
    });
});



// *** rough template, needs to be formatted correctly for test to pass
const exampleForm:formBuilder.builderForm = {
    _previewMode:false,
    choices:{},
    settings:{},
    survey:{},
    title:'test form'
}
