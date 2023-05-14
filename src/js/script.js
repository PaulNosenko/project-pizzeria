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

  // const settings = {
  //   amountWidget: {
  //     defaultValue: 1,
  //     defaultMin: 1,
  //     defaultMax: 9,
  //   }
  // };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };

  class Product {

    constructor(id, data) {
      this.id = id;
      this.data = data;
      this.renderInMenu();
      this.getElements();
      this.initAccordion();
      this.initOrderForm();
      this.processOrder();
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

    getElements() {
      this.accordionTrigger = this.element.querySelector(select.menuProduct.clickable);
      this.form = this.element.querySelector(select.menuProduct.form);
      this.formInputs = this.form.querySelectorAll(select.all.formInputs);
      this.cartButton = this.element.querySelector(select.menuProduct.cartButton);
      this.priceElem = this.element.querySelector(select.menuProduct.priceElem);
      this.imageWrapper = this.element.querySelector(select.menuProduct.imageWrapper);
    }

    initAccordion() {
      /* find the clickable trigger (the element that should react to clicking) */
      const currentProductElement = this.element;

      /* START: add event listener to clickable trigger on event click */
      this.accordionTrigger.addEventListener('click', function (event) {
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

    initOrderForm() {
      this.form.addEventListener('submit', (event) => {
        event.preventDefault();
        this.processOrder();
      });

      for (let input of this.formInputs) {
        input.addEventListener('change', () => {
          this.processOrder();
        });
      }

      this.cartButton.addEventListener('click', (event) => {
        event.preventDefault();
        this.processOrder();
      });
    }

    processOrder() {
      const thisProduct = this;

      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);

      // set price to default price
      let price = thisProduct.data.price;

      // for every category (param)...
      for (let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        const selectedOptionsIds = formData[paramId];

        // for every option in this category
        for (let currentOptionId in param.options) {
          const option = param.options[currentOptionId];

          if (option.default && !selectedOptionsIds.includes(currentOptionId)) {
            price -= option.price;
          }

          if (!option.default && selectedOptionsIds.includes(currentOptionId)) {
            price += option.price;
          }

          const searchedImageClass = `.${paramId}-${currentOptionId}`;
          const seachedImage = this.imageWrapper.querySelector(searchedImageClass);

          //check if image for current option exists and display or hide it based on whether it's chosen in the form
          if (seachedImage) {
            if (seachedImage && selectedOptionsIds.includes(currentOptionId)) {
              seachedImage.classList.add(classNames.menuProduct.imageVisible);
            } else {
              seachedImage.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
        }
      }
      // update calculated price in the HTML
      thisProduct.priceElem.innerHTML = price;
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
      this.initData();
      this.initMenu();
    },
  };


  app.init();
}
