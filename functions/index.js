'use strict';

const admin = require("firebase-admin");
const functions = require("firebase-functions");
const maxResizedSide = 1680;

admin.initializeApp();

exports.onRequestResizedImage = functions
  .runWith({
    timeoutSeconds: 300,
    memory: "1GB",
  })
  .region("us-central1")
  .https.onRequest((req, res) => {
    // ["filename", "jpg"]
    const fileNameComponents = req.path.substr(1).split("."); 
    // ex.) "filename_1680x1680.jpg"
    const filePath = fileNameComponents[1] == "gif" ? fileNameComponents.join(".") : `${fileNameComponents[0]}_${maxResizedSide}x${maxResizedSide}.${fileNameComponents[1]}`;

    admin
      .storage()
      .bucket()
      .file(filePath)
      .get()
      .then((data) => {
        const file = data[0];
        res.set("Cache-Control", `public, max-age=${60*60*24*30}`);
        res.set("Content-Type", file.metadata['contentType']);
        file.createReadStream().pipe(res);
        res.status(200);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send(err);
      });
  });