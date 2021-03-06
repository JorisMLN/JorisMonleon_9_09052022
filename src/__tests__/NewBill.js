/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom"
import { wrongMime } from "../containers/NewBill.js"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import userEvent from "@testing-library/user-event"
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES } from "../constants/routes.js";
import mockStore from "../__mocks__/store";


// import mockStore from "../__mocks__/store"
jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then i change file, it should do it", () => {
      const html = NewBillUI()
      document.body.innerHTML = html;

      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }));

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      }

      const container = new NewBill({
        document,
        localStorage: window.localStorage,
        onNavigate,
        store: mockStore
      });

      const input = screen.getByTestId('file');
      const file = new File(['test'], 'testFile.jpg', { type: 'image/jpg' });
      const handleChangeFile = jest.fn(container.handleChangeFile);

      input.addEventListener('change', handleChangeFile);
      userEvent.upload(input, file);

      expect(handleChangeFile).toHaveBeenCalled();
    });

    test('Then We add a bad Mime type for file', () => {
      // const badMime = jest.fn(wrongMime);
      // const test = wrongMime() mocker la fonction
      expect(wrongMime('test.pdf')).toBe('')
    })
  });

  describe('When I am clicking on the submit button', () => {
    test('Then I submit the form', () => {
      const html = NewBillUI()
      document.body.innerHTML = html

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      }

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const container = new NewBill({
        document,
        localStorage: window.localStorage,
        onNavigate,
        store: null
      });

      const handleSubmit = jest.fn(container.handleSubmit);
      const form = screen.getByTestId('form-new-bill');

      form.addEventListener('submit', handleSubmit);
      form.submit();

      expect(handleSubmit).toHaveBeenCalled();
    });
  });
})

// test d'int??gration POST
describe('Given when i am connected as an employee', () => {
  describe('When i am on the newBill page', () => {
    test('push bill on the mock API POST', async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));

      const mockedBills = mockStore.bills();

      const spy = jest.spyOn(mockedBills, 'create');
      const result = await mockedBills.create();

      expect(spy).toHaveBeenCalled();
      expect(result).toEqual({fileUrl: 'https://localhost:3456/images/test.jpg', key: '1234'});
    })
  })
})
