import { select, classNames, templates } from "../settings.js";
import utils from "../utils.js";
import AmountWidget from "./AmountWidget.js";

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

                if (selectedOptionsIds.includes(currentOptionId)) {
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
        // app.cart.add(this.prepareCartProduct());
        
        const event = new CustomEvent('add-to-cart', {
            bubbles: true,
            detail: {
                product: this.prepareCartProduct()
            }
        });

        this.element.dispatchEvent(event);
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

export default Product;