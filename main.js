const express = require("express");
const axios = require("axios");
const { response } = require("express");

const app = express();

function extractLinks(data) {
    return data.data.children.map(item => {
        return item.data.url;
    });
}

function filterImages(links) {
    return links.filter(isImage);
}

function isImage(link) {
    return link.endsWith(".jpg");
}

function shouldFetchNewResults(cachedResults) {
    const ageInMinutes = (Date.now() - cachedResults.time) / (1000 * 60);
    return cachedResults.results.length === 0 || ageInMinutes > 10;
}

const cachedResults = {
    time: Date.now(),
    results: [],
};

app.get("/image", (req, res, next) => {
    if (shouldFetchNewResults(cachedResults)) {
        axios
            .get("https://www.reddit.com/r/Eyebleach+aww+dogpictures+AustralianShepherd/top/.json?limit=100")
            .then(result => {
                const imageLinks = filterImages(extractLinks(result.data));

                cachedResults.time = Date.now()
                cachedResults.results = imageLinks

                const rng = Math.floor(Math.random() * imageLinks.length);
                res.json({ response_type: "in_channel", text: imageLinks[rng] });
            })
            .catch(error => {
                console.error(error);
                res.status(500).json({ msg: "Error" });
            });
    } else {
        const { results } = cachedResults;
        const rng = Math.floor(Math.random() * results.length);
        res.json({ response_type: "in_channel", text: results[rng] });
    }
});

app.listen(4455, "0.0.0.0", () => {
    console.log("listening");
});
