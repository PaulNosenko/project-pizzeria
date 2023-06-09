import { settings, select } from "./settings.js";
import Product from "./components/Product.js";
import Cart from "./components/Cart.js";

const app = {
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
  init: function () {
    this.initData();
    this.initCart();
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
