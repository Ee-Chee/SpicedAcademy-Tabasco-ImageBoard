const express = require("express");
const app = express();
const dB = require("./utilities/db");
const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");
const s3 = require("./s3");
const cf = require("./config.json");
const moment = require("moment");

app.use(express.static("./public"));

app.use(require("body-parser").json());

app.get("/images", (req, res) => {
    dB.getImages()
        .then(data => {
            // console.log("I'm here: ", data);
            let arr = [];
            for (let i = 0; i < data.rows.length; i++) {
                arr.push(data.rows[i]);
            }
            res.json(arr);
        })
        .catch(err => {
            console.log("Err caught: ", err);
        });
});

app.post("/moreimages", (req, res) => {
    // console.log("Last ID: ", req.body.last_id);
    dB.getMoreImages(req.body.last_id)
        .then(data => {
            // console.log(data.rows);
            res.json(data);
        })
        .catch(err => {
            console.log("Err caught: ", err);
        });
});

app.get("/image/:id", (req, res) => {
    // console.log(req.params.id);
    Promise.all([dB.getImage(req.params.id), dB.getComments(req.params.id)])
        .then(data => {
            // console.log(
            //     "I'm here 2: ",
            //     // data[0].rows[0],
            // );

            res.json(data);
        })
        .catch(err => {
            // console.log("Getting image's error: ", err);
            // res.redirect("/"); //It works but the url doesnt change to 8081/
            res.json(undefined); //output undefined for component to catch error
        });
});

var diskStorage = multer.diskStorage({
    //the purpose of multer here is to store img in a specified path with unique name and prevent DOS attacks
    destination: function(req, file, callback) {
        callback(null, __dirname + "/uploads");
    },
    filename: function(req, file, callback) {
        uidSafe(24).then(function(uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    }
    //the reason we give each an unique id because some users might upload same file name.
});

var uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152
    }
});

app.post("/upload", uploader.single("file"), s3.upload, (req, res) => {
    // console.log(req.file); //an object that multer added to the req
    // console.log(req);
    // console.log(req.body);
    const url = cf.s3Url + req.file.filename;
    dB.addImage(url, req.body.username, req.body.title, req.body.description)
        .then(data => {
            // console.log(data.rows);
            res.json(data.rows);
        })
        .catch(err => {
            // console.log("Err caughttt: ", err);
            res.json(undefined);
        });
});

app.post("/comment", (req, res) => {
    // console.log(req.body);
    dB.addComment(req.body.comment, req.body.username, req.body.id)
        .then(data => {
            // console.log(data.rows);
            res.json(data.rows);
        })
        .catch(err => {
            console.log("Err caught: ", err);
        });
});

app.get("*", (req, res) => {
    res.redirect("/");
});

app.listen(process.env.PORT || 8081, () => console.log(`I'm listening`));
