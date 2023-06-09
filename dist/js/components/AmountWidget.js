import { settings, select } from "../settings.js";

class AmountWidget {
    constructor(element, initalAmount = null) {
        this.getElements(element);
        this.setValue(initalAmount || settings.amountWidget.defaultValue);
        this.initActions();
    }

    getElements(element) {
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
        const event = new CustomEvent('updated', { bubbles: true });
        this.element.dispatchEvent(event);
    }
}

export default AmountWidget;