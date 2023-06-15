import { templates, select, settings, classNames } from "../settings.js";
import utils from "../utils.js";
import AmountWidget from "./AmountWidget.js";
import DatePicker from "./DatePicker.js";
import HourPicker from "./HourPicker.js";

class Booking {
    constructor(wrapper) {
        this.render(wrapper);
        this.initWidgets();
        this.initActions();
        this.getDate();

        this.selectedTable = null;
    }

    render(wrapper) {
        wrapper.innerHTML = templates.bookingWidget();
        this.dom = {
            wrapper,
            peopleAmount: document.querySelector(select.booking.peopleAmount),
            hoursAmount: document.querySelector(select.booking.hoursAmount),
            datePicker: document.querySelector(select.widgets.datePicker.wrapper),
            hourPicker: document.querySelector(select.widgets.hourPicker.wrapper),
            tables: document.querySelectorAll(select.booking.tables),
            address: wrapper.querySelector(select.booking.address),
            phone: wrapper.querySelector(select.booking.phone),
            form: document.querySelector(select.booking.form)
        };
    }

    initWidgets() {
        this.peopleAmountWidget = new AmountWidget(this.dom.peopleAmount);
        this.hoursAmountWidget = new AmountWidget(this.dom.hoursAmount);
        this.datePickerWidget = new DatePicker(this.dom.datePicker);
        this.hourPickerWidget = new HourPicker(this.dom.hourPicker);
    }

    initActions() {
        this.dom.wrapper.addEventListener('updated', () => {
            this.dom.tables.forEach(t => t.classList.remove(classNames.booking.tableSelected));
            this.selectedTable = null;
            this.updateDOM();
        });

        this.dom.tables.forEach(table => {
            table.addEventListener('click', (event) => {
                this.initTables(event.currentTarget)
            });
        });

        this.dom.form.addEventListener('submit', (event) => {
            event.preventDefault();
            this.sendBooking();
        });
    }

    initTables(clickedTable) {
        if (!clickedTable.classList.contains(classNames.booking.tableBooked)) {
            if (clickedTable === this.selectedTable) {
                clickedTable.classList.remove(classNames.booking.tableSelected);
                this.selectedTable = null;
            } else {
                const currentlySelected = [...this.dom.tables].find((t) => t.classList.contains(classNames.booking.tableSelected));
                if (currentlySelected) {
                    currentlySelected.classList.remove(classNames.booking.tableSelected);
                }

                clickedTable.classList.add(classNames.booking.tableSelected);
                this.selectedTable = clickedTable;
            }
        } else {
            const tableId = clickedTable.getAttribute('data-table');
            alert(`Table ${tableId} is unavailable at the selected data and/or time.`)
        }
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
                this.parseData(bookings, eventsCurrent, eventsRepeat);
            });
    }

    parseData(bookings, eventsCurrent, eventsRepeat) {
        this.booked = {};

        for (let item of eventsCurrent) {
            this.makeBooked(item.date, item.hour, item.duration, item.table);
        }

        for (let item of bookings) {
            this.makeBooked(item.date, item.hour, item.duration, item.table);
        }

        const minDate = this.datePickerWidget.minDate;
        const maxDate = this.datePickerWidget.maxDate;

        for (let item of eventsRepeat) {
            if (item.repeat === 'daily') {
                for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)) {
                    this.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
                }
            }
        }

        this.updateDOM();
    }

    makeBooked(date, hour, duration, table) {
        if (typeof this.booked[date] == 'undefined') {
            this.booked[date] = {};
        }

        const startHour = utils.hourToNumber(hour);

        for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) {
            if (typeof this.booked[date][hourBlock] == 'undefined') {
                this.booked[date][hourBlock] = [];
            }

            this.booked[date][hourBlock].push(table);
        }
    }

    updateDOM() {
        this.date = this.datePickerWidget.value;
        this.hour = utils.hourToNumber(this.hourPickerWidget.value);

        let allAvailable = false;

        if (typeof this.booked[this.date] === 'undefined' || typeof this.booked[this.date][this.hour] === 'undefined') {
            allAvailable = true;
        }

        for (let table of this.dom.tables) {
            let tableId = table.getAttribute(settings.booking.tableIdAttribute);
            if (!isNaN(tableId)) {
                tableId = parseInt(tableId);
            }

            if (!allAvailable && this.booked[this.date][this.hour].includes(tableId)) {
                table.classList.add(classNames.booking.tableBooked)
            } else {
                table.classList.remove(classNames.booking.tableBooked)
            }
        }
    }

    sendBooking() {
        const url = settings.db.url + '/' + settings.db.bookings;
        const payload = {
            date: this.date,
            hour: utils.numberToHour(this.hour),
            table: this.getTableId(),
            duration: this.hoursAmountWidget.correctValue,
            ppl: this.peopleAmountWidget.correctValue,
            starters: this.getStarters(),
            address: this.dom.address.value,
            phone: this.dom.phone.value,
        };

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        };

        fetch(url, options)
            .then(() => {
                this.makeBooked(payload.date, payload.hour, payload.duration, payload.table);
                this.updateDOM();
                this.resetTableSelection();
            });
    }

    getTableId() {
        return this.selectedTable ? parseInt(this.selectedTable.getAttribute('data-table')) : null;
    }

    getStarters() {
        let starters = document.querySelectorAll('input[name="starter"]');
        starters = [...starters].filter(s => s.checked);
        return starters.map(s => s.value);
    }

    resetTableSelection() {
        this.dom.tables.forEach((t) => t.classList.remove(classNames.booking.tableSelected))
        this.selectedTable = null;
    }
}

export default Booking;