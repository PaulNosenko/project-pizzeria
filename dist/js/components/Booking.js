import { templates, select } from "../settings.js";
import AmountWidget from "./AmountWidget.js";

class Booking {
    constructor(wrapper) {
        this.render(wrapper);
        this.initWidgets();
    }

    render(wrapper) {
        wrapper.innerHTML = templates.bookingWidget();
        this.dom = {
            wrapper,
            peopleAmount: document.querySelector(select.booking.peopleAmount),
            hoursAmount: document.querySelector(select.booking.hoursAmount)
        };
    }

    initWidgets() {
        this.peopleAmountWidget = new AmountWidget(this.dom.peopleAmount);
        this.hoursAmountWidget = new AmountWidget(this.dom.hoursAmount);

        this.dom.peopleAmount.addEventListener('updated', () => {});
        this.dom.hoursAmount.addEventListener('updated', () => {});
    }
}

export default Booking;