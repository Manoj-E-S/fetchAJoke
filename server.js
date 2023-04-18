const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');
const ejs = require('ejs');
const axios = require('axios');

const baseUrl = 'https://v2.jokeapi.dev/';
const port = process.env.PORT || 3000;

const app = express();
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('views', __dirname + '/views');

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});


// Get joke
app.set('view engine', 'ejs');
app.post('/get-joke', (req, res) => {
    var blacklistItems = [req.body.blacklist1, req.body.blacklist2, req.body.blacklist3, req.body.blacklist4, req.body.blacklist5, req.body.blacklist6];
    var blacklist = '';
    for(var i = 0; i < blacklistItems.length; i++) {
        if (blacklistItems[i] != undefined) {
            if (blacklist == '') {
                blacklist = `?blacklistFlags=${blacklistItems[i]}`;
            } else {
                blacklist += `,${blacklistItems[i]}`;
            }
        }
    }

    var type = req.body.type;
    switch (type) {
        case 'single':
            type = 'single';
            break;
        case 'twopart':
            type = 'twopart';
            break;
        default:
            type = 'single,twopart';
            break;
    }

    if (blacklist == '') {
        type = '?type=' + type;
    } else {
        type = '&type=' + type;
    }

    if (req.body.contains == '') {
        var contains = '';
    } else {
        var contains = '&contains=' + req.body.contains;
    }

    https.get(baseUrl + 'joke/' + req.body.catagory + blacklist + type + contains, response => {
        response.on("data", chunk => {
            const jokeData = JSON.parse(chunk.toString());
            if (jokeData.error == true) {
                res.render('index', {error: jokeData.error, joke: jokeData.message});
            } else {
                if (jokeData.type == 'single') {
                    res.render('index', {error: jokeData.error, joke: jokeData.joke});
                } else {
                    res.render('index', {error: jokeData.error, setup: jokeData.setup, delivery: jokeData.delivery});
                }
            }
        });
        response.on("error", err => {
            console.error(`Error: ${err}`);
        });
    });
});


// Jokes API is not accepting joke submissions for the foreseeable future.

// Submit joke
// app.post('/submit-joke', (req, res) => {
//     var catagory = req.body.catagory;
//     var flags = [req.body.flag1, req.body.flag2, req.body.flag3, req.body.flag4, req.body.flag5, req.body.flag6];
//     var type = req.body.type;

//     for(let i = 0; i < flags.length; i++) {
//         if (flags[i] == undefined) {
//             flags[i] = false;
//         } else {
//             flags[i] = true;
//         }
//     }

//     let jokeObject;
//     if (type == 'single') {
//         var joke = req.body.joke;
//         jokeObject = {
//             "formatVersion": 3,
//             "catagory": catagory,
//             "type": type,
//             "joke": joke,
//             "flags": {
//                 "nsfw": flags[0],
//                 "religious": flags[1],
//                 "political": flags[2],
//                 "racist": flags[3],
//                 "sexist": flags[4],
//                 "explicit": flags[5]
//             },
//             "lang": "en"
//         };
//     } else {
//         var setup = req.body.setup;
//         var delivery = req.body.delivery;
//         jokeObject = {
//             "formatVersion": 3,
//             "catagory": catagory,
//             "type": type,
//             "setup": setup,
//             "delivery": delivery,
//             "flags": {
//                 "nsfw": flags[0],
//                 "religious": flags[1],
//                 "political": flags[2],
//                 "racist": flags[3],
//                 "sexist": flags[4],
//                 "explicit": flags[5]
//             },
//             "lang": "en"
//         };
//     }

//     axios.post(baseUrl + 'submit', JSON.stringify(jokeObject))
//         .then(response => {
//             res.send('<h1>' + response.data.message + '</h1>');
//         })
//         .catch(error => {
//             console.error(error);
//         });
// });

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});