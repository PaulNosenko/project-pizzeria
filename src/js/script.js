/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: "#template-menu-product",
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };

  class Product {

    constructor(id, data) {
      this.id = id;
      this.data = data;
      this.renderInMenu();
      this.initAccordion();

      console.log('new Product', this);
    }

    renderInMenu() {

      //generate HTML for current single product
      const generatedHTML = templates.menuProduct(this.data);

      //create element using utils createElementFromHTML
      this.element = utils.createDOMFromHTML(generatedHTML);

      //find menu container
      const menuContainer = document.querySelector(select.containerOf.menu);

      //add element to menu
      menuContainer.appendChild(this.element);

    }

    initAccordion() {
      /* find the clickable trigger (the element that should react to clicking) */
      const clickableTrigger = this.element.querySelector(select.menuProduct.clickable);
      const currentProductElement = this.element;
      console.log(clickableTrigger)

      /* START: add event listener to clickable trigger on event click */
      clickableTrigger.addEventListener('click', function (event) {
        /* prevent default action for event */
        event.preventDefault();

        /* find active product (product that has active class) */
        const activeProduct = document.querySelector(select.all.menuProductsActive);

        /* if there is active product and it's not thisProduct.element, remove class active from it */
        if (activeProduct && activeProduct !== currentProductElement) {
          activeProduct.classList.remove('active');
        }

        /* toggle active class on thisProduct.element */
        currentProductElement.classList.toggle('active');

      });

    }
    
  }


const app = {
  initMenu: function () {
    for (let productKey in this.data.products) {
      new Product(productKey, this.data.products[productKey]);
    }
  },
  initData: function () {
    this.data = dataSource;
  },
  init: function () {
    console.log('*** App starting ***');
    console.log('thisApp:', this);
    console.log('classNames:', classNames);
    console.log('settings:', settings);
    console.log('templates:', templates);

    this.initData();
    this.initMenu();
  },
};


app.init();
}
