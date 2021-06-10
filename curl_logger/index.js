'use strict';

const _ = require('lodash');
const fs = require('fs');
let filePath = `/tmp/curlResponse.txt`

if (/(\.txt)|(.json)$/.test(process.argv[2])) {
  ([filePath] = process.argv.splice(2, 1))
}

(async () => {
  let fileContent = (await fs.readFileSync(filePath)).toString()
  try {
    fileContent = fileContent.replace(/^\[[0-9]+\] /g, '')
    const document = JSON.parse(fileContent)

    if (process.argv.length > 2) {
      const newDocument = {}
      process.argv.slice(2).forEach((field) => {
        newDocument[field] = _.get(document, field);
      });
      Object.keys(newDocument).forEach((key) => {
        const keys = key.split('.');
        const subDocument = {};
        keys.reduce((acc, keyPart, index) => {
          if (index === keys.length - 1) {
            acc[keyPart] = newDocument[key];
          } else {
            acc[keyPart] = {};
          }
          return acc[keyPart];
        }, subDocument);
        delete newDocument[key];
        Object.assign(newDocument, subDocument);
      });
      console.info(newDocument)
    } else {
      console.info(document)
    }
  } catch(error) {
    console.error(error)
    console.info(fileContent)
  }
})()