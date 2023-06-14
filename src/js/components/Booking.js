import { templates, select, settings } from "../settings.js";
import utils from "../utils.js";
import AmountWidget from "./AmountWidget.js";
import DatePicker from "./DatePicker.js";
import HourPicker from "./HourPicker.js";

class Booking {
    constructor(wrapper) {
        this.render(wrapper);
        this.initWidgets();
        
        this.getDate();
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

    getDate() {
        const startDateParam = `${settings.db.dateStartParamKey}=${utils.dateToStr(this.datePickerWidget.minDate)}`;
        const endDateParam = `${settings.db.dateEndParamKey}=${utils.dateToStr(this.datePickerWidget.maxDate)}`;

        const params = {
            booking: [startDateParam, endDateParam],
            eventsCurrent: [settings.db.notRepeatParam, startDateParam, endDateParam],
            eventsRepeat: [settings.db.repeatParam, endDateParam]
        }

        const urls = {
            booking: `${settings.db.url}/${settings.db.bookings}?${params.booking.join('&')}`,
            eventsCurrent: `${settings.db.url}/${settings.db.events}?${params.eventsCurrent.join('&')}`,
            eventsRepeat: `${settings.db.url}/${settings.db.events}?${params.eventsRepeat.join('&')}`
        }

        Promise.all([
            fetch(urls.booking),
            fetch(urls.eventsCurrent),
            fetch(urls.eventsRepeat)
        ])
            .then((allResponses) => {
                const bookingResponse = allResponses[0];
                const eventsCurrentResponse = allResponses[1];
                const eventsRepeatResponse = allResponses[2];
                return Promise.all([
                    bookingResponse.json(),
                    eventsCurrentResponse.json(),
                    eventsRepeatResponse.json()
                ]);
            })
            .then(([bookings, eventsCurrent, eventsRepeat]) => {
                console.error('bookings', bookings)
                console.error('eventsCurrent', eventsCurrent)
                console.error('eventsRepeat', eventsRepeat)
            });
    }
}

export default Booking;