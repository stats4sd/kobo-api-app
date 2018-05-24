import * as chai from "chai";
import * as mocha from "mocha";
import * as formBuilder from "../src/formBuilder";
const expect = chai.expect;

// test if correctly piping through to kobo api, checking the /forms endpoint
describe("form builder", () => {
  it("should build form from json", async () => {
    const res = await formBuilder.buildXLSX(exampleForm);
    if (res.filePath) {
      console.log(`file: ${res.filePath}`);
      return true;
    }
    return false;
  });
});

// *** rough template, needs to be formatted correctly for test to pass
const exampleForm: formBuilder.IBuilderForm = {
  title: `TestForm - ${new Date().toUTCString()}`,
  questionGroups: [
    {
      _id: "at1grp1",
      _created: "2018-01-30T22:44:28.607Z",
      _modified: "2018-01-30T22:44:28.607Z",
      tags: [null],
      label: "Demographic and General Initial Questions",
      questions: [
        "nr1",
        "nr2",
        "nr3",
        "nr4",
        "nr4s",
        "nr5",
        "nr6",
        "nr7",
        "nr8",
        "nr626",
        "nr627",
        "nr654",
        "nr655",
        "nr656",
        "nr657",
        "nr658",
        "nr659",
        "nr660",
        "nr661",
        "nr662",
        "nr663",
        "nr664",
        "nr665",
        "nr666",
        "nr634",
        "nr632"
      ]
    }
  ],
  _created: new Date().toUTCString(),
  _previewMode: true,
  survey: [
    {
      type: "begin group",
      name: "at1grp1",
      label: "Demographic and General Initial Questions"
    },
    {
      type: "text",
      name: "nr1",
      label: "Full Name Of The Respondent (Up To Four Names)",
      hint: "",
      constraint: "",
      constraint_message: "",
      required: "yes",
      Required_message: "This Field is Required!",
      appearance: "",
      default: "",
      readonly: "",
      relevant: "",
      calculation: "",
      choice_filter: "",
      repeat_count: ""
    },
    {
      type: "select_one nr2",
      name: "nr2",
      label: "Gender Of The Respondent",
      hint: "",
      constraint: "",
      constraint_message: "",
      required: "yes",
      Required_message: "This Field is Required!",
      appearance: "minimal",
      default: "",
      readonly: "",
      relevant: "",
      calculation: "",
      choice_filter: "",
      repeat_count: ""
    },
    {
      type: "integer",
      name: "nr3",
      label: "Age Of The Respondent",
      hint: "",
      constraint: ".>=10 and .<=110",
      constraint_message: "min=10; max=110",
      required: "yes",
      Required_message: "This Field is Required!",
      appearance: "",
      default: "",
      readonly: "",
      relevant: "",
      calculation: "",
      choice_filter: "",
      repeat_count: ""
    },
    {
      type: "select_one nr4",
      name: "nr4",
      label: "Respondent's Relationship To Household Head",
      hint: "",
      constraint: "",
      constraint_message: "",
      required: "yes",
      Required_message: "This Field is Required!",
      appearance: "minimal",
      default: "",
      readonly: "",
      relevant: "",
      calculation: "",
      choice_filter: "",
      repeat_count: ""
    },
    {
      type: "text",
      name: "nr4s",
      label: "Specify",
      hint: "",
      constraint: "",
      constraint_message: "",
      required: "",
      Required_message: "",
      appearance: "",
      default: "",
      readonly: "",
      relevant: "${nr4}='other'",
      calculation: "",
      choice_filter: "",
      repeat_count: ""
    },
    {
      type: "text",
      name: "nr5",
      label: "Name Of The Head Of The Household",
      hint: "",
      constraint: "",
      constraint_message: "",
      required: "yes",
      Required_message: "This Field is Required!",
      appearance: "",
      default: "",
      readonly: "",
      relevant: "${nr4}!='self'",
      calculation: "",
      choice_filter: "",
      repeat_count: ""
    },
    {
      type: "select_one nr6",
      name: "nr6",
      label: "Gender Of The Head Of The Household",
      hint: "",
      constraint: "",
      constraint_message: "",
      required: "yes",
      Required_message: "This Field is Required!",
      appearance: "minimal",
      default: "",
      readonly: "",
      relevant: "${nr4}!='self'",
      calculation: "",
      choice_filter: "",
      repeat_count: ""
    },
    {
      type: "integer",
      name: "nr7",
      label: "Age Of The Head Of The Household ",
      hint: "",
      constraint: ".>=10 and .<=110",
      constraint_message: "min=10; max=110",
      required: "yes",
      Required_message: "This Field is Required!",
      appearance: "",
      default: "",
      readonly: "",
      relevant: "",
      calculation: "",
      choice_filter: "",
      repeat_count: ""
    },
    {
      type: "select_one nr8",
      name: "nr8",
      label: "What Is The Current Marital Status Of The Head Of The Household?",
      hint: "",
      constraint: "",
      constraint_message: "",
      required: "",
      Required_message: "",
      appearance: "minimal",
      default: "",
      readonly: "",
      relevant: "",
      calculation: "",
      choice_filter: "",
      repeat_count: ""
    },
    {
      type: "select_one nr626",
      name: "nr626",
      label: "Does The Head Of The Household Know How To Read And Write?",
      hint: "",
      constraint: "",
      constraint_message: "",
      required: "yes",
      Required_message: "This Field is Required!",
      appearance: "minimal",
      default: "",
      readonly: "",
      relevant: "",
      calculation: "",
      choice_filter: "",
      repeat_count: ""
    },
    {
      type: "integer",
      name: "nr627",
      label: "How Many Household Members Are Literate (Can Read And Write)?",
      hint: "",
      constraint: "",
      constraint_message: "",
      required: "yes",
      Required_message: "This Field is Required!",
      appearance: "",
      default: "",
      readonly: "",
      relevant: "",
      calculation: "",
      choice_filter: "",
      repeat_count: ""
    },
    {
      type: "integer",
      name: "nr654",
      label:
        "How Many Female Children Under 5 Years Are Members Of The Households?",
      hint: "",
      constraint: "",
      constraint_message: "",
      required: "yes",
      Required_message: "This Field is Required!",
      appearance: "",
      default: 0,
      readonly: "",
      relevant: "",
      calculation: "",
      choice_filter: "",
      repeat_count: ""
    },
    {
      type: "integer",
      name: "nr655",
      label:
        "How Many Male Children Under 5 Years Are Members Of The Households?",
      hint: "",
      constraint: "",
      constraint_message: "",
      required: "yes",
      Required_message: "This Field is Required!",
      appearance: "",
      default: 0,
      readonly: "",
      relevant: "",
      calculation: "",
      choice_filter: "",
      repeat_count: ""
    },
    {
      type: "integer",
      name: "nr656",
      label:
        "How Many Female Children From 5 To 14 Years Are Members Of The Households?",
      hint: "",
      constraint: "",
      constraint_message: "",
      required: "yes",
      Required_message: "This Field is Required!",
      appearance: "",
      default: 0,
      readonly: "",
      relevant: "",
      calculation: "",
      choice_filter: "",
      repeat_count: ""
    },
    {
      type: "integer",
      name: "nr657",
      label:
        "How Many Male Children From 5 To 14 Years Are Members Of The Households?",
      hint: "",
      constraint: "",
      constraint_message: "",
      required: "yes",
      Required_message: "This Field is Required!",
      appearance: "",
      default: 0,
      readonly: "",
      relevant: "",
      calculation: "",
      choice_filter: "",
      repeat_count: ""
    },
    {
      type: "integer",
      name: "nr658",
      label:
        "How Many Female Children From 15 To 17 Years Are Members Of The Households?",
      hint: "",
      constraint: "",
      constraint_message: "",
      required: "yes",
      Required_message: "This Field is Required!",
      appearance: "",
      default: 0,
      readonly: "",
      relevant: "",
      calculation: "",
      choice_filter: "",
      repeat_count: ""
    },
    {
      type: "integer",
      name: "nr659",
      label:
        "How Many Male Children From 15 To 17 Years Are Members Of The Households?",
      hint: "",
      constraint: "",
      constraint_message: "",
      required: "yes",
      Required_message: "This Field is Required!",
      appearance: "",
      default: 0,
      readonly: "",
      relevant: "",
      calculation: "",
      choice_filter: "",
      repeat_count: ""
    },
    {
      type: "integer",
      name: "nr660",
      label:
        "How Many Female Adults From 18 To 60 Years Are Members Of The Households?",
      hint: "",
      constraint: "",
      constraint_message: "",
      required: "yes",
      Required_message: "This Field is Required!",
      appearance: "",
      default: 0,
      readonly: "",
      relevant: "",
      calculation: "",
      choice_filter: "",
      repeat_count: ""
    },
    {
      type: "integer",
      name: "nr661",
      label:
        "How Many Male Adults From 18 To 60 Years Are Members Of The Households?",
      hint: "",
      constraint: "",
      constraint_message: "",
      required: "yes",
      Required_message: "This Field is Required!",
      appearance: "",
      default: 0,
      readonly: "",
      relevant: "",
      calculation: "",
      choice_filter: "",
      repeat_count: ""
    },
    {
      type: "integer",
      name: "nr662",
      label:
        "How Many Female Adults Above 60 Years Are Members Of The Households?",
      hint: "",
      constraint: "",
      constraint_message: "",
      required: "yes",
      Required_message: "This Field is Required!",
      appearance: "",
      default: 0,
      readonly: "",
      relevant: "",
      calculation: "",
      choice_filter: "",
      repeat_count: ""
    },
    {
      type: "integer",
      name: "nr663",
      label:
        "How Many Male Adults Above 60 Years Are Members Of The Households?",
      hint: "",
      constraint: "",
      constraint_message: "",
      required: "yes",
      Required_message: "This Field is Required!",
      appearance: "",
      default: 0,
      readonly: "",
      relevant: "",
      calculation: "",
      choice_filter: "",
      repeat_count: ""
    },
    {
      type: "integer",
      name: "nr664",
      label: "Total Number Of Household Members ",
      hint: "",
      constraint: "",
      constraint_message: "",
      required: "yes",
      Required_message: "This Field is Required!",
      appearance: "",
      default: "",
      readonly: "yes",
      relevant: "",
      calculation:
        "(${nr654} + ${nr655} + ${nr656} + ${nr657}) +( ${nr658} + ${nr659} +${nr660} + ${nr661} + ${nr662} + ${nr663})",
      choice_filter: "",
      repeat_count: ""
    },
    {
      type: "integer",
      name: "nr665",
      label: "Total Number Of Female Household Members",
      hint: "",
      constraint: "",
      constraint_message: "",
      required: "yes",
      Required_message: "This Field is Required!",
      appearance: "",
      default: "",
      readonly: "yes",
      relevant: "",
      calculation: "(${nr654} + ${nr656} )+( ${nr658}  +${nr660} + ${nr662})",
      choice_filter: "",
      repeat_count: ""
    },
    {
      type: "integer",
      name: "nr666",
      label: "Total Number Of Male Household Members",
      hint: "",
      constraint: "",
      constraint_message: "",
      required: "yes",
      Required_message: "This Field is Required!",
      appearance: "",
      default: "",
      readonly: "yes",
      relevant: "",
      calculation: "( ${nr655} + ${nr657}) +( ${nr659} + ${nr661} + ${nr663})",
      choice_filter: "",
      repeat_count: ""
    },
    {
      type: "select_one nr634",
      name: "nr634",
      label: "Which Is The Main Source Of Income For Your Household Currently?",
      hint: "",
      constraint: "",
      constraint_message: "",
      required: "",
      Required_message: "",
      appearance: "minimal",
      default: "",
      readonly: "",
      relevant: "",
      calculation: "",
      choice_filter: "",
      repeat_count: ""
    },
    {
      type: "select_one nr632",
      name: "nr632",
      label:
        "How Would You Explain The Current Residential Status Of Your Household?",
      hint: "",
      constraint: "",
      constraint_message: "",
      required: "yes",
      Required_message: "This Field is Required!",
      appearance: "minimal",
      default: "",
      readonly: "",
      relevant: "",
      calculation: "",
      choice_filter: "",
      repeat_count: ""
    },
    {
      type: "end group",
      name: "at1grp1",
      label: "Demographic and General Initial Questions"
    }
  ],
  choices: [
    {
      list_name: "nr2",
      name: "male",
      label: "Male",
      image: null,
      "label::language1": null,
      "": null
    },
    {
      list_name: "nr2",
      name: "female",
      label: "Female",
      image: null,
      "label::language1": null,
      "": null
    },
    {
      list_name: "nr4",
      name: "spouse",
      label: "Spouse",
      image: null,
      "label::language1": null,
      "": null
    },
    {
      list_name: "nr4",
      name: "daughterson",
      label: "Daughter/Son",
      image: null,
      "label::language1": null,
      "": null
    },
    {
      list_name: "nr4",
      name: "self",
      label: "Self",
      image: null,
      "label::language1": null,
      "": null
    },
    {
      list_name: "nr4",
      name: "sisterbrother",
      label: "Sister/Brother",
      image: null,
      "label::language1": null,
      "": null
    },
    {
      list_name: "nr4",
      name: "motherfather",
      label: "Mother/Father",
      image: null,
      "label::language1": null,
      "": null
    },
    {
      list_name: "nr4",
      name: "grandchild",
      label: "Grandchild",
      image: null,
      "label::language1": null,
      "": null
    },
    {
      list_name: "nr4",
      name: "fosterchild",
      label: "Foster Child",
      image: null,
      "label::language1": null,
      "": null
    },
    {
      list_name: "nr4",
      name: "cowife",
      label: "Co-Wife",
      image: null,
      "label::language1": null,
      "": null
    },
    {
      list_name: "nr4",
      name: "servantlivein",
      label: "Servant Live-In",
      image: null,
      "label::language1": null,
      "": null
    },
    {
      list_name: "nr4",
      name: "other",
      label: "Other (specify)",
      image: null,
      "label::language1": null,
      "": null
    },
    {
      list_name: "nr6",
      name: "male",
      label: "Male",
      image: null,
      "label::language1": null,
      "": null
    },
    {
      list_name: "nr6",
      name: "female",
      label: "Female",
      image: null,
      "label::language1": null,
      "": null
    },
    {
      list_name: "nr8",
      name: "single",
      label: "Single",
      image: null,
      "label::language1": null,
      "": null
    },
    {
      list_name: "nr8",
      name: "married",
      label: "Married",
      image: null,
      "label::language1": null,
      "": null
    },
    {
      list_name: "nr8",
      name: "widowwidower",
      label: "Widow/Widower",
      image: null,
      "label::language1": null,
      "": null
    },
    {
      list_name: "nr8",
      name: "divorcedseparated",
      label: "Divorced/Separated",
      image: null,
      "label::language1": null,
      "": null
    },
    {
      list_name: "nr626",
      name: "yes",
      label: "Yes",
      image: null,
      "label::language1": null,
      "": null
    },
    {
      list_name: "nr626",
      name: "no",
      label: "No",
      image: null,
      "label::language1": null,
      "": null
    },
    {
      list_name: "nr634",
      name: "agriculture",
      label: "Agriculture",
      image: null,
      "label::language1": null,
      "": null
    },
    {
      list_name: "nr634",
      name: "livestock",
      label: "livestock",
      image: null,
      "label::language1": null,
      "": null
    },
    {
      list_name: "nr634",
      name: "fishing",
      label: "Fishing",
      image: null,
      "label::language1": null,
      "": null
    },
    {
      list_name: "nr634",
      name: "wildfood",
      label: "Wild_food",
      image: null,
      "label::language1": null,
      "": null
    },
    {
      list_name: "nr634",
      name: "firewood",
      label: "Firewood",
      image: null,
      "label::language1": null,
      "": null
    },
    {
      list_name: "nr634",
      name: "handicraft",
      label: "Handicraft",
      image: null,
      "label::language1": null,
      "": null
    },
    {
      list_name: "nr634",
      name: "petty-trade",
      label: "Petty-Trade",
      image: null,
      "label::language1": null,
      "": null
    },
    {
      list_name: "nr634",
      name: "wholesale",
      label: "Wholesale",
      image: null,
      "label::language1": null,
      "": null
    },
    {
      list_name: "nr634",
      name: "transport",
      label: "Transport",
      image: null,
      "label::language1": null,
      "": null
    },
    {
      list_name: "nr634",
      name: "salary",
      label: "Salary",
      image: null,
      "label::language1": null,
      "": null
    },
    {
      list_name: "nr632",
      name: "refugees",
      label: "Refugees",
      image: null,
      "label::language1": null,
      "": null
    },
    {
      list_name: "nr632",
      name: "internally",
      label: "Internally Displaced Persons",
      image: null,
      "label::language1": null,
      "": null
    },
    {
      list_name: "nr632",
      name: "host",
      label: "Host Community",
      image: null,
      "label::language1": null,
      "": null
    },
    {
      list_name: "nr632",
      name: "returning",
      label: "Returning Refugees",
      image: null,
      "label::language1": null,
      "": null
    }
  ],
  settings: [
    {
      form_title: `TestForm - ${new Date().toUTCString()}`
    }
  ]
};
