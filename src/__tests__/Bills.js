/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import Bills, { default as BillsContainer } from '../containers/Bills';
import userEvent from "@testing-library/user-event";
import mockStore from "../__mocks__/store"

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)

      router()
      window.onNavigate(ROUTES_PATH.Bills)

      // recherche un element du DOM via son id
      const windowIcon = screen.getByTestId('icon-window')

      // to-do write expect expression
      expect(windowIcon.classList.contains('active-icon')).toBe(true)
    })

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      let dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    test('Then i click on newbills button it should trigger handleClickNewBill', () => {

      const html = BillsUI({ data: bills });
      document.body.innerHTML = html;

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      }

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const container = new Bills({
        document,
        localStorage: window.localStorage,
        onNavigate,
        store: null
      });

      // recherche un element du DOM via son id
      const newBillButton = screen.getByTestId('btn-new-bill');
      const handleClickNewBill = jest.fn(container.handleClickNewBill);

      newBillButton.addEventListener('click', handleClickNewBill);

      userEvent.click(newBillButton);

      expect(handleClickNewBill).toHaveBeenCalled();
    })

    test('tester le fait que la modale saffiche et que la bonne image est la. Et trigger le click sur icon eye', () => {
      const html = BillsUI({ data: bills });
      document.body.innerHTML = html;

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const container = new Bills({
        document,
        localStorage: window.localStorage,
        store: null
      });

      const modal = document.getElementById('modaleFile');
      console.log(modal);

      const eyeButton = screen.getAllByTestId('icon-eye')[0];
      console.log('first eye btn --------->', eyeButton);

      $.fn.modal = jest.fn();


      const handleClickEye = jest.fn(container.handleClickIconEye);
      eyeButton.addEventListener('click', function () { handleClickEye(eyeButton) });
      userEvent.click(eyeButton);

      console.log('test attribute ---------------->', modal.hasAttribute('class', 'show'))

      expect(handleClickEye).toHaveBeenCalled();
      expect(modal.hasAttribute('class', 'show')).toBe(true);
    })
  })
})

// test d'intégration GET
describe('Given I am user connected as employee', () => {
  describe('When i navigate to the bills page', () => {
    test('fetches bills from mock API GET', async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));

      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()

      window.onNavigate(ROUTES_PATH.Bills);

      await waitFor(() => screen.getByText('Mes notes de frais'));
      const contentPending = await document.getElementById('data-table');
      expect(contentPending).toBeTruthy();
    })
  })

  describe('When an error occurs on API', () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(
        window,
        'localStorage',
        { value: localStorageMock }
      )

      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "a@a"
      }))

      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })

    test("fetches bills from an API and fails with 404 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 404"))
          }
        }
      })

      window.onNavigate(ROUTES_PATH.Bills)

      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur/)

      expect(message).toBeTruthy()
    })
  })
})
