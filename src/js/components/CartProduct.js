import { select } from "../settings.js";
import AmountWidget from "./AmountWidget.js";

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
            this.amount = this.amountWidget.value
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

        this.dom.wrapper.dispatchEvent(event);
    }

    getData() {
        return {
            id: this.id,
            amount: this.amount,
            price: this.price,
            priceSingle: this.priceSingle,
            name: this.name,
            params: this.params
        }
    }
}

export default CartProduct;