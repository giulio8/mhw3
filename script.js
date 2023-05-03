function setHeaders(a_t) {
    let headers = {
        "Authorization": "Bearer " + a_t
    };
    return headers;
}


// image API /// ------------------------------
let imgurData = {
    hostname: "https://api.imgur.com",
    refreshToken: "91a588c1f9167616dc661d0ff54aeada9c8491b6",
    clientId: "c6cbe3454179b73",
    clientSecret: "8d929538ebbe2c3c03606f3d4289de844b811632",
    accessToken: "4ff0cee8c20f23e25b193c3ce2f4613a4aa19277",
    albumHash: "Xy5vujj"
};

function albumRequest() {
    return fetch(imgurData.hostname + "/3/album/" + imgurData.albumHash, {
        headers: setHeaders(imgurData.accessToken)
    });
}

function postImageRequest(formdata) {
    return fetch(imgurData.hostname + "/3/upload", {
        method: "POST",
        headers: setHeaders(imgurData.accessToken),
        body: formdata
    });
}

function addImageRequest(formdata) {
    console.log("richiesta");
    return fetch(imgurData.hostname + "/3/album/" + imgurData.albumHash + "/add", {
        method: "POST",
        body: formdata,
        headers: setHeaders(imgurData.accessToken)
    });
}

function createRefreshDataImgur() {
    let formdata = new FormData();
    formdata.append("refresh_token", imgurData.refreshToken);
    formdata.append("client_id", imgurData.clientId);
    formdata.append("client_secret", imgurData.clientSecret);
    formdata.append("grant_type", "refresh_token");
    return formdata;
}

function refreshExpiredAccessToken() {

    const formdata = createRefreshDataImgur();

    let generateTokenRequest = fetch(imgurData.hostname + "/oauth2/token", {
        method: "POST",
        body: formdata,
        headers: setHeaders(imgurData.accessToken)
    });

    generateTokenRequest.then(onSuccess, onError).then(json => {
        imgurData.accessToken = json.access_token;
        imgurData.refreshToken = json.refresh_token;
    });
}
// --------------------------------------------
// coordinates api

let o_w_api_key = "95461e08659a9465c43c7df7b7f96f4a";

function requestCoordinates(queryString) {
    return fetch("https://api.openweathermap.org/geo/1.0/direct?q=" + encodeURIComponent(queryString) + "&limit=5&appid=" + o_w_api_key);
}
// --------------------------------------------
// flights api
let amadeusData = {
    hostname: "https://test.api.amadeus.com",
    client_id: "Y8I33cyCvXeAHHt9A6AxGO2KwvzMXblS",
    client_secret: "PUsaWUwSBvVERsIH",
    access_token: "m51A5qJtGmZmjpEqDq1C1aAVgBFI"
};

function refreshAccessTokenAmadeus() {

    return fetch(amadeusData.hostname + "/v1/security/oauth2/token", {
        method: "POST",
        // formdata must be urlencoded
        body: "grant_type=client_credentials&client_id=" + amadeusData.client_id + "&client_secret=" + amadeusData.client_secret,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    });
}

function airportRequest(lat, lon) {
    return fetch(amadeusData.hostname + "/v1/reference-data/locations/airports?latitude=" + lat + "&longitude=" + lon,
        {
            headers: setHeaders(amadeusData.access_token)
        });
}

function flightsRequest(origin, destination, departureDate, returnDate) {
    return fetch(amadeusData.hostname + "/v2/shopping/flight-offers?originLocationCode=" + origin + "&destinationLocationCode=" + destination + "&departureDate=" + departureDate + "&returnDate=" + returnDate + "&adults=1&max=1",
        {
            headers: setHeaders(amadeusData.access_token)
        });
}

function cityRequest(cityCode, countryCode) {
    return fetch(amadeusData.hostname + "/v1/reference-data/locations?subType=CITY,AIRPORT&keyword=" + cityCode + "&countryCode=" + countryCode,
        {
            headers: setHeaders(amadeusData.access_token)
        });
}
// --------------------------------------------

function onJson(json) {
    console.log(json)
}

function showLoader() {
    const loader = document.querySelector("#loader");
    loader.classList.remove("hidden");
}

function hideLoader() {
    const loader = document.querySelector("#loader");
    loader.classList.add("hidden");
}

function showModal() {
    const modal = document.querySelector("#modal");
    modal.classList.remove("hidden");
}

function hideModal() {
    const modal = document.querySelector("#modal");
    modal.classList.add("hidden");
}

function createTicketElement(flight, dict) {
    const ticket = document.createElement("div");
    ticket.classList.add("ticket");
    const h2 = document.createElement("h2");
    h2.textContent = "Biglietto aereo";
    ticket.appendChild(h2);
    const h3 = document.createElement("h3");
    h3.textContent = "Tratte:";
    ticket.appendChild(h3);
    const segmentsBox = document.createElement("div");
    segmentsBox.classList.add("segments-box");
    ticket.appendChild(segmentsBox);
    itinerary = flight.itineraries[0];
    let myLocationDictionary = {};
    let setDictionary = {};
    let locationElementMap = {};
    for (const i in itinerary.segments) {
        const segment = itinerary.segments[i];
        iataCodeDep = segment.departure.iataCode;
        if (setDictionary[iataCodeDep] !== true) {
            setDictionary[iataCodeDep] = true;
            countryCodeDep = dict.locations[iataCodeDep].countryCode;
            cityRequest(iataCodeDep, countryCodeDep).then(onSuccess, onError).then(json => {
                myLocationDictionary[json.data[0].iataCode] = json.data[0].name;
                locationElementMap[json.data[0].iataCode].textContent = myLocationDictionary[json.data[0].iataCode] + " (" + json.data[0].iataCode + ")";
                console.log("aggiunto " + json.data[0].iataCode);
            });
        }
        iataCodeArr = segment.arrival.iataCode;
        if (setDictionary[iataCodeArr] !== true) {
            setDictionary[iataCodeArr] = true;
            countryCodeArr = dict.locations[iataCodeArr].countryCode;
            cityRequest(iataCodeArr, countryCodeArr).then(onSuccess, onError).then(json => {
                myLocationDictionary[json.data[0].iataCode] = json.data[0].name;
                locationElementMap[json.data[0].iataCode].textContent = myLocationDictionary[json.data[0].iataCode] + " (" + json.data[0].iataCode + ")";
            }).catch(error => {
                setDictionary[iataCodeArr] = false;
                myLocationDictionary[iataCodeArr] = iataCodeArr;
            });
        }
    }

    for (let i = 0; i < itinerary.segments.length; i++) {
        const segment = itinerary.segments[i];
        const segmentBox = document.createElement("div");
        segmentBox.classList.add("segment");
        const h4 = document.createElement("h4");
        h4.textContent = "Tratta " + (i + 1) + " " + segment.departure.iataCode + "-" + segment.arrival.iataCode;
        segmentBox.appendChild(h4);
        const departure = document.createElement("div");
        departure.classList.add("departure");
        const h3Departure = document.createElement("h3");
        h3Departure.textContent = "Partenza";
        departure.appendChild(h3Departure);
        locationElementMap[segment.departure.iataCode] = document.createElement("p");
        departure.appendChild(locationElementMap[segment.departure.iataCode]);
        const p2 = document.createElement("p");
        p2.textContent = "Orario della partenza: " + segment.departure.at;
        departure.appendChild(p2);
        segmentBox.appendChild(departure);
        const arrival = document.createElement("div");
        arrival.classList.add("arrival");
        const h3Arrival = document.createElement("h3");
        h3Arrival.textContent = "Arrivo";
        arrival.appendChild(h3Arrival);
        if (locationElementMap[segment.arrival.iataCode] === undefined) {
            locationElementMap[segment.arrival.iataCode] = document.createElement("p");
        }
        arrival.appendChild(locationElementMap[segment.arrival.iataCode]);
        const p4 = document.createElement("p");
        p4.textContent = "Orario di arrivo: " + segment.arrival.at;
        arrival.appendChild(p4);
        segmentBox.appendChild(arrival);
        segmentsBox.appendChild(segmentBox);
    }
    const price = document.createElement("div");
    price.classList.add("price");
    price.textContent = "Prezzo complessivo: " + flight.price.total + " " + flight.price.currency;
    ticket.appendChild(price);
    const modal = document.querySelector("#modal .modal-content");
    modal.appendChild(ticket);

}


function getFlights(origin, destination, departureDate, returnDate) {
    // we request the flights
    flightsRequest(origin, destination, departureDate, returnDate).then(onSuccess, onError).then(json => {
        console.log(json);
        let flight = json.data[0];
        let dict = json.dictionaries;
        // we create the ticket element
        createTicketElement(flight, dict);
        hideLoader();
        showModal();
    }).catch(onErrorFlReq);
}

function onErrorFlReq(err) {
    console.log(err);
    let error = document.querySelector("#error");
    error.classList.remove("hidden");
    hideLoader();
    window.scrollTo(0, document.body.scrollHeight);
}

function onImageClick(event) {
    showLoader();
    
    // we requst the coordinates of the place
    let place = event.target.dataset.title;
    requestCoordinates(place).then(onSuccess, onError).then(json => {
        console.log(json);
        let lat = json[0].lat;
        let lon = json[0].lon;
        // before requesting the airport information, we refresh the access token
        refreshAccessTokenAmadeus().then(onSuccess, onError).then(json => {
            console.log(json);
            amadeusData.access_token = json.access_token;
            airportRequest(lat, lon).then(onSuccess, onError).then(json => {
                console.log(json);
                let airport = json.data[0].iataCode;
                console.log(airport);
                // get tomorrow's date
                let tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                day_after = new Date();
                day_after.setDate(day_after.getDate() + 2);
                // we request the flights for the day after today
                getFlights("CTA", airport, tomorrow.toISOString().split("T")[0], day_after.toISOString().split("T")[0]);
            }).catch(onErrorFlReq);
        });
    });
}

function onAlbumReturned(json) {
    console.log(json)
    const list = document.querySelector("#gallery");
    for (const i in json.data.images) {
        const img = json.data.images[i];
        let imgEl = document.createElement("img");
        imgEl.src = img.link
        imgEl.classList.add("gallery-image");
        imgEl.dataset.title = img.title;
        list.appendChild(imgEl);
    }
    list.addEventListener("click", onImageClick);
}

function onSuccess(resp) {
    console.log(resp.status);
    if (resp.ok === false && resp.status !== 429) {
        console.log("Problem with the request");
        throw new Error("Problem with the request");
    }
    return resp.json();
}

function onError(error) {
    console.log('Error: ' + error);
}


function addImageToAlbum(imageHash) {
    let formdata = new FormData();
    formdata.append("ids[]", imageHash);
    formdata.append("album", imgurData.albumHash);
    console.log("funzoine")
    return addImageRequest(formdata);
}

function postImage(event) {
    let form = document.forms["postImage"];
    let formdata = new FormData(form);
    formdata.append("type", "file");

    // we show the loading animation and hide all the form, then scroll to bottom
    showLoader();
    form.classList.add("hidden");


    // We must show the error message if the image is not uploaded
    // and hide the loading animation
    function onErrorImReq() {
        let error = document.querySelector("#error");
        error.classList.remove("hidden");
        hideLoader();
        form.classList.remove("hidden");
        window.scrollTo(0, document.body.scrollHeight);
    }

    postImageRequest(formdata).then(onSuccess, onErrorImReq).then(json => {
        console.log("Immagine caricata correttamente");
        addImageToAlbum(json.data.id).then(onSuccess, onError).then(() => {
            console.log("Immagine aggiunta correttamente");
            location.reload();
        });
    }).catch(onErrorImReq);

}

albumRequest().then(onSuccess, onError).then(onAlbumReturned);

postButton = document.querySelector("#post-button");

// prevent button from submitting form
postButton.addEventListener("click", (event) => event.preventDefault());

postButton.addEventListener("mouseup", postImage);

closeModal = document.querySelector(".modal-content .close");
closeModal.addEventListener("click", () => {
    hideModal();
    let modal = document.querySelector("#modal .modal-content");
    modal.innerHTML = '<span class="close">&times;</span>';
});