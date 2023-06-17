import { templates, select } from "../settings.js";

class Home {
    constructor(wrapper) {
        this.render(wrapper);
    }

    render(wrapper) {
        wrapper.innerHTML = templates.homePage();
        this.dom = {
            wrapper,
            orderLink: document.querySelector(select.home.orderLink),
            bookLink: document.querySelector(select.home.bookLink),
        }
    }
}

export default Home;