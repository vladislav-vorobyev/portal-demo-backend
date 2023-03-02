const busboy = require("busboy");

const Photo = require("../models/photo");
const Ext = require("../utils/controllers-ext");

/**
 * Handle a photo upload and storing it into database, response with new slug
 * @param {*} req - Request object
 * @param {*} res - Response object
 */
exports.uploadByUser = (req, res) => {
  const bb = busboy({ headers: req.headers });
  bb.on("file", (name, file, info) => {
    const { filename, encoding, mimeType } = info;
    console.log(`File [${name}]: filename: %j, encoding: %j, mimeType: %j`, filename, encoding, mimeType);
    let buffer = "";
    file
      .on("data", (data) => {
        buffer += data.toString("hex");
        console.log(`File [${name}] got ${data.length} bytes`);
      })
      .on("close", () => {
        console.log(`File [${name}] done`);
        const photo = {
          user_id: req.params.user_id,
          data: `\\x${buffer}`,
          filename,
          encoding,
          mime_type: mimeType,
        };
        return Photo.insert(photo)
          .then((slug) => {
            console.log("Stored to database");
            res.writeHead(200, { Connection: "close" });
            return res.end(slug);
          })
          .catch((err) => Ext.controllerErrorHandler(err, res, "Photo.insert", req.params.user_id));
      });
  });
  return req.pipe(bb);
};

/**
 * Response with image data
 * @param {*} req - Request object
 * @param {*} res - Response object
 * @param {Integer} req.params.user_id - user id
 * @param {String} req.params.slug - photo slug
 */
exports.getByUser = (req, res) =>
  Photo.getByUserAndSlug(req.params.user_id, req.params.slug)
    .first()
    .then((result) => {
      if (result) {
        const headers = {
          "Content-Type": result.mime_type,
          "Content-Length": result.data.length,
          "Content-Transfer-Encoding": result.encoding,
        };
        // console.log("Img headers:", headers);
        res.set(headers);
        return res.status(200).send(result.data);
      }
      return res.sendStatus(404);
    })
    .catch((err) => Ext.controllerErrorHandler(err, res, "Photo.getByUser", req.params.user_id));

/**
 * Delete a photo
 * @param {*} req - Request object
 * @param {*} res - Response object
 * @param {Integer} req.params.user_id - user id
 */
exports.deleteByUser = (req, res) =>
  Photo.deleteByUser(req.params.user_id)
    .then(() => res.sendStatus(204))
    .catch((err) => Ext.controllerErrorHandler(err, res, "Photo.deleteByUser", req.params.user_id));
