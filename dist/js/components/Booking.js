import { templates, select } from "../settings.js";
import AmountWidget from "./AmountWidget.js";
import DatePicker from "./DatePicker.js";
import HourPicker from "./HourPicker.js";

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
            hoursAmount: document.querySelector(select.booking.hoursAmount),
            datePicker: document.querySelector(select.widgets.datePicker.wrapper),
            hourPicker: document.querySelector(select.widgets.hourPicker.wrapper)
        };
    }

    initWidgets() {
        this.peopleAmountWidget = new AmountWidget(this.dom.peopleAmount);
        this.hoursAmountWidget = new AmountWidget(this.dom.hoursAmount);
        this.datePickerWidget = new DatePicker(this.dom.datePicker);
        this.hourPickerWidget = new HourPicker(this.dom.hourPicker);

        this.dom.peopleAmount.addEventListener('updated', () => {});
        this.dom.hoursAmount.addEventListener('updated', () => {});
    }
}

export default Booking;