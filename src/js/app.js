import { settings, select, classNames } from "./settings.js";
import Product from "./components/Product.js";
import Cart from "./components/Cart.js";
import Booking from "./components/Booking.js";
import Home from "./components/Home.js";

const app = {
  initPages: function () {
    this.pages = document.querySelector(select.containerOf.pages).children;
    this.navLinks = document.querySelectorAll(select.nav.links);

    const idFromHash = window.location.hash.replace('#/', '');

    let pageMatchingHash = this.pages[0].id;

    for (let page of this.pages) {
      if (page.id === idFromHash) {
        pageMatchingHash = page.id;
        break;
      }
    }

    this.activatePage(pageMatchingHash);

    for (let link of this.navLinks) {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        const id = event.target.getAttribute('href').replace('#', '');
        this.activatePage(id);
        window.location.hash = `#/${id}`;
      });
    }
  },
  activatePage: function (pageId) {
    // add class to page with pageId and remove class from currently active page
    for (let page of this.pages) {
      page.classList.toggle(classNames.pages.active, page.id === pageId);
    }

    for (let link of this.navLinks) {
      link.classList.toggle(classNames.nav.active, link.getAttribute('href') === `#${pageId}`);
    }
  },
  initMenu: function () {
    for (let productKey in this.data.products) {
      new Product(this.data.products[productKey].id, this.data.products[productKey]);
    }
  },
  initData: function () {
    this.data = {};

    const url = settings.db.url + '/' + settings.db.products;

    fetch(url)
      .then((rawResponse) => {
        return rawResponse.json();
      })
      .then((parsedResponse) => {
        this.data.products = parsedResponse;
        this.initMenu();
      });
  },
  initBooking: function () {
    const bookingContainer = document.querySelector(select.containerOf.booking);
    const booking = new Booking(bookingContainer);
    this.booking = booking;
  },
  initHome: function () {
    const homeContainer = document.querySelector(select.containerOf.home);
    const home = new Home(homeContainer);
    this.home = home;

    this.home.dom.orderLink.addEventListener('click', (event) => {
      event.preventDefault();
      const id = event.currentTarget.getAttribute('href').replace('#', '');
      this.activatePage(id);
      window.location.hash = `#/${id}`;
    });

    this.home.dom.bookLink.addEventListener('click', (event) => {
      event.preventDefault();
      const id = event.currentTarget.getAttribute('href').replace('#', '');
      this.activatePage(id);
      window.location.hash = `#/${id}`;
    });
  },
  init: function () {
    this.initPages();
    this.initData();
    this.initCart();
    this.initBooking();
    this.initHome();
  },
  initCart: function () {
    const cartElem = document.querySelector(select.containerOf.cart);
    this.cart = new Cart(cartElem);

    this.productList = document.querySelector(select.containerOf.menu);

    this.productList.addEventListener('add-to-cart', (event) => {
      this.cart.add(event.detail.product);
    })
  }
};

app.init();
