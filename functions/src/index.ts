import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
const maxResizedSide = 1920;

admin.initializeApp();

exports.onRequestResizedImage = functions
    .runWith({
      timeoutSeconds: 300,
      memory: '1GB',
    })
    .region('asia-northeast1')
    .https.onRequest((req, res) => {
    // split req.path by "/" to get path components
      const pathComponents = req.path.split('/');
      const pathWithoutFilename = pathComponents.slice(
          0,
          pathComponents.length - 1,
      );
      const filenameComponents =
      pathComponents[pathComponents.length - 1].split('.');

      // ex.) "images/2023/resized_images/foo_1920x1920.jpg"
      const filePath = `${pathWithoutFilename.join('/')}/resized_images/${
        filenameComponents[0]
      }_${maxResizedSide}x${maxResizedSide}.${filenameComponents[1]}`;

      console.log(`File path = ${filePath}`);

      admin
          .storage()
          .bucket()
          .file(filePath)
          .get()
          .then((data) => {
            const file = data[0];
            res.set('Cache-Control', 'public, max-age=604800');
            res.set('Content-Type', file.metadata['contentType']);
            file.createReadStream().pipe(res);
            res.status(200);
          })
          .catch((err) => {
            console.log(err);
            res.status(500).send(err);
          });
    });
