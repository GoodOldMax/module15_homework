class Chat {
    constructor(formElement, historyElement) {
        this._formElement = formElement;
        this._historyElement = historyElement;
        this._setupEchoWs();
        this._setupGeoWs();
    }

    _setupEchoWs() {
        this._echoWs = new WebSocket('wss://echo-ws-service.herokuapp.com');
        this._echoWs.onmessage = event => this.writeIncoming(event.data);
        this._echoWs.onerror = () => this.writeServiceMessage('Echo server: Ошибка соединения');
    }

    _setupGeoWs() {
        this._geoWs = new WebSocket('wss://echo-ws-service.herokuapp.com');
        this._geoWs.onerror = () => this.writeServiceMessage('Geo server: Ошибка соединения');
    }

    postMessage() {
        const form = new FormData(this._formElement);
        const message = form.get('message');
        this.writeOutgoing(message);
        this._echoWs.send(message);
    }

    postGeolocation() {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const { latitude, longitude } = position.coords;
                    const myGeo = `http://www.openstreetmap.org/#map=18/${latitude}/${longitude}`;
                    this.writeGeolocation(myGeo);
                    this._geoWs.send(myGeo);
                },
                error => this.writeServiceMessage(error.message));
        } else {
            this.writeServiceMessage('Браузер не имеет поддержки геолокации');
        }
    }

    writeMessage(message, classes) {
        const pre = document.createElement("p");
        pre.classList.add('chat-history__msg');
        pre.classList.add('chat_outline');
        pre.classList.add('chat_rounded');
        classes.forEach(cls => pre.classList.add(cls));
        pre.innerHTML = message;
        this._historyElement.appendChild(pre);
    }

    writeOutgoing(message) {
        this.writeMessage(message, ["chat-history__msg_out"]);
    }

    writeGeolocation(message) {
        this.writeMessage(
            `<a href="${message}">Моя геолокация</a>`, 
            ["chat-history__msg_out", "chat-history__msg_geo"],
        );
    }

    writeIncoming(message) {
        this.writeMessage(message, ["chat-history__msg_in"]);
    }

    writeServiceMessage(message) {
        this.writeMessage(message, ["chat_filled"]);
    }
}


const chat = new Chat(
    document.querySelector('.chat form'),
    document.querySelector('.chat-history'),
);
