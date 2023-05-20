/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: "#template-menu-product",
      cartProduct: "#template-cart-product"
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
        input: 'input.amount',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    cart: {
      wrapperActive: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },
    cart: {
      defaultDeliveryFee: 20,
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  };

  class Product {

    constructor(id, data) {
      this.id = id;
      this.data = data;
      this.renderInMenu();
      this.getElements();
      this.initAccordion();
      this.initOrderForm();
      this.initAmountWidget();
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
      this.amountWidgetElem = this.element.querySelector(select.menuProduct.amountWidget);
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
        this.addToCart();
      });
    }

    initAmountWidget() {
      this.amountWidget = new AmountWidget(this.amountWidgetElem);
      
      this.amountWidgetElem.addEventListener('updated', () => {
        this.processOrder();
      });
    }

    processOrder() {
      const thisProduct = this;
      const params = {};
      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);

      // set price to default price
      let price = thisProduct.data.price;

      // for every category (param)...
      for (let paramId in thisProduct.data.params) {
        const currentParam = {
          label: thisProduct.data.params[paramId].label,
          options: {}
        }

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

          if(selectedOptionsIds.includes(currentOptionId)){
            currentParam.options[currentOptionId] = param.options[currentOptionId].label
          }
        }

        params[paramId] = currentParam;
      }

      this.params = params;
      this.priceSingle = price;

      //multiply price by amount
      price *= this.amountWidget.value;

      this.price = price;

      // update calculated price in the HTML
      thisProduct.priceElem.innerHTML = price;
    }

    addToCart() {
      app.cart.add(this.prepareCartProduct());
    }

    prepareCartProduct() {
      const productSummary = {
        id: this.id,
        name: this.data.name,
        amount: this.amountWidget.value,
        priceSingle: this.priceSingle,
        price: this.price,
        params: this.prepareCartProductParams()
      };

      return productSummary;
    }

    prepareCartProductParams() {
      return this.params;
    }
  }

  class AmountWidget{
    constructor(element, initalAmount = null) {
      this.getElements(element);
      this.setValue(initalAmount || settings.amountWidget.defaultValue);
      this.initActions();
    }

    getElements(element){
      this.element = element;
      this.input = this.element.querySelector(select.widgets.amount.input);
      this.linkDecrease = this.element.querySelector(select.widgets.amount.linkDecrease);
      this.linkIncrease = this.element.querySelector(select.widgets.amount.linkIncrease);
    }

    setValue(value) {
      const newValue = parseInt(value);

      if (!isNaN(newValue) && newValue !== this.value && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax) {
        this.value = newValue;
      }
      
      this.input.value = this.value;
    }

    initActions() {
      this.input.addEventListener('change', () => {
        this.setValue(this.input.value);
        this.announce();
      });

      this.linkDecrease.addEventListener('click', () => {
        this.setValue(this.value - 1)
        this.announce();
      });

      this.linkIncrease.addEventListener('click', () => {
        this.setValue(this.value + 1);
        this.announce();
      });
    }
    
    announce() {
      const event = new CustomEvent('updated', {bubbles: true});
      this.element.dispatchEvent(event);
    }
  }

  class Cart {
    constructor(element) {
      this.products = [];
      this.getElements(element);
      this.initActions();
    }

    getElements(element) {
      this.dom = {};
      this.dom.wrapper = element;
      this.dom.toggleTrigger = this.dom.wrapper.querySelector(select.cart.toggleTrigger);
      this.dom.productList = this.dom.wrapper.querySelector(select.cart.productList);
      this.dom.deliveryFee = this.dom.wrapper.querySelector(select.cart.deliveryFee);
      this.dom.subtotalPrice = this.dom.wrapper.querySelector(select.cart.subtotalPrice);
      this.dom.totalPrice = this.dom.wrapper.querySelectorAll(select.cart.totalPrice);
      this.dom.totalNumber = this.dom.wrapper.querySelector(select.cart.totalNumber);
    }

    initActions() {
      this.dom.toggleTrigger.addEventListener('click', () => {
        this.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });

      this.dom.productList.addEventListener('updated', () => {
        this.update();
      });

      this.dom.productList.addEventListener('remove', (event) => {
        this.remove(event.detail.cartProduct); 
      });
    }

    add(menuProduct) {
      const generatedHTML = templates.cartProduct(menuProduct);
      this.element = utils.createDOMFromHTML(generatedHTML);
      this.dom.productList.appendChild(this.element);
      this.products.push(new CartProduct(menuProduct, this.element));

      this.update();
    }

    update() {
      const deliveryFee = settings.cart.defaultDeliveryFee;
      let totalNumber = 0;
      let subtotalPrice = 0;

      this.products.forEach((product) => {
        totalNumber += product.amountWidget.value;
        subtotalPrice += product.price;
      });

      if (totalNumber) {
        this.totalPrice = deliveryFee + subtotalPrice;
        this.dom.deliveryFee.innerHTML = deliveryFee;
      } else {
        this.totalPrice = 0;
        this.dom.deliveryFee.innerHTML = 0;
      }

      this.dom.subtotalPrice.innerHTML = subtotalPrice;
      this.dom.totalNumber.innerHTML = totalNumber;

      this.dom.totalPrice.forEach((totalPriceEl) => {
        totalPriceEl.innerHTML = this.totalPrice;
      });
    }

    remove(cartProductToRemove) {
      //remove from DOM
      cartProductToRemove.dom.wrapper.remove();
      
      //remove from JS array
      const index = this.products.findIndex((currentProd) => currentProd === cartProductToRemove);
      this.products.splice(index, 1);

      this.update();
    }
  }

  class CartProduct {
    constructor(menuProduct, element) {
      this.id = menuProduct.id;
      this.name = menuProduct.name;
      this.amount = menuProduct.amount;
      this.priceSingle = menuProduct.priceSingle;
      this.price = menuProduct.price;
      this.params = menuProduct.params;

      this.getElements(element);
      this.initAmountWidget();
      this.initActions();
    }

    getElements(element) {
      this.dom = {};
      this.dom.wrapper = element;
      this.dom.amountWidgetElem = this.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      this.dom.price = this.dom.wrapper.querySelector(select.cartProduct.price);
      this.dom.edit = this.dom.wrapper.querySelector(select.cartProduct.edit);
      this.dom.remove = this.dom.wrapper.querySelector(select.cartProduct.remove);
    }

    initAmountWidget() {
      this.amountWidget = new AmountWidget(this.dom.amountWidgetElem, this.amount);
      
      this.dom.amountWidgetElem.addEventListener('updated', () => {
        this.price = this.priceSingle * this.amountWidget.value;
        this.dom.price.innerHTML = this.price;
      });
    }

    initActions() {
      this.dom.edit.addEventListener('click', (event) => {
        event.preventDefault();
      });

      this.dom.remove.addEventListener('click', (event) => {
        event.preventDefault();
        this.remove();
      });
    }

    remove() {
      const event = new CustomEvent('remove', {
        bubbles: true,
        detail: {
          cartProduct: this
        }
      });
console.log('removing ...');
      this.dom.wrapper.dispatchEvent(event);
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
      this.initCart();
    },
    initCart: function() {
      const cartElem = document.querySelector(select.containerOf.cart);
      this.cart = new Cart(cartElem);
    }
  };


  app.init();
}
