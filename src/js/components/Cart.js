import { settings, classNames, select, templates } from "../settings.js";
import utils from "../utils.js";
import CartProduct from "./CartProduct.js";

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
        this.dom.address = this.dom.wrapper.querySelector(select.cart.address);
        this.dom.phone = this.dom.wrapper.querySelector(select.cart.phone);
        this.dom.form = this.dom.wrapper.querySelector(select.cart.form);
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

        this.dom.form.addEventListener('submit', (event) => {
            event.preventDefault();
            this.sendOrder();
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
        this.totalNumber = 0;
        this.subtotalPrice = 0;

        this.products.forEach((product) => {
            this.totalNumber += product.amountWidget.value;
            this.subtotalPrice += product.price;
        });

        const isNoProductsSelected = (this.totalNumber === 0);

        this.totalPrice = isNoProductsSelected ? 0 : (deliveryFee + this.subtotalPrice);
        this.deliveryFee = isNoProductsSelected ? 0 : deliveryFee;
        this.dom.deliveryFee.innerHTML = isNoProductsSelected ? 0 : deliveryFee;

        this.dom.subtotalPrice.innerHTML = this.subtotalPrice;
        this.dom.totalNumber.innerHTML = this.totalNumber;

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

    sendOrder() {
        const url = settings.db.url + '/' + settings.db.orders;
        const payload = {
            address: this.dom.address.value,
            phone: this.dom.phone.value,
            totalPrice: this.totalPrice,
            subtotalPrice: this.subtotalPrice,
            totalNumber: this.totalNumber,
            deliveryFee: this.deliveryFee,
            products: this.products.map((currentProduct) => currentProduct.getData())
        };

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        };

        fetch(url, options);
    }
}

export default Cart;