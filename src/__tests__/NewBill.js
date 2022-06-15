/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom"
import { wrongMime } from "../containers/NewBill.js"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then ...", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
    });

    test('Then We add a bad Mime type for file', () => {
      // const test = wrongMime() mocker la fonction
      expect(wrongMime('test.pdf')).toBe('')
    })
  });

  describe('When I am clicking on the submit button', () => {
    test('Then ', () => {

      // TODO fire event submit the form of the new bills

    });
  });
})
