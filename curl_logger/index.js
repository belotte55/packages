'use strict';

const _ = require('lodash');
const fs = require('fs');

const args = {
  fields: [...(process.argv[2] || '').split(' '), ...process.argv.slice(3).map(arg => arg.replace(/^ */, '').replace(/ *$/, ''))].filter(Boolean),
  filePath: `/tmp/curlResponse.txt`
}

const argFilePath = args.fields.find(field => /.*\.txt$/.test(field))
if (argFilePath) {
  args.filePath = argFilePath
}

if (/(\.txt)|(.json)$/.test(args.fields[0])) {
  args.filePath = args.fields.shift()
}
if (args.fields.indexOf('keys') > -1) {
  args.showKeys = true;
  args.fields.splice(args.fields.indexOf('keys'), 1);
}

(async () => {
  let fileContent = (await fs.readFileSync(args.filePath)).toString()
  try {
    fileContent = fileContent.replace(/^\[[0-9]+\] /g, '')
    const document = JSON.parse(fileContent)

    if (args.fields.length) {
      const newDocument = {}
      args.fields.forEach((field) => {
        newDocument[field] = _.get(document, field);
      });
      Object.keys(newDocument).forEach((key) => {
        const keys = key.split('.');
        const subDocument = {};
        keys.reduce((acc, keyPart, index) => {
          if (index === keys.length - 1) {
            if (args.showKeys) {
              acc[keyPart] = Object.keys(newDocument[key]);
            } else {
              acc[keyPart] = newDocument[key];
            }
          } else {
            acc[keyPart] = {};
          }
          return acc[keyPart];
        }, subDocument);
        delete newDocument[key];
        Object.assign(newDocument, subDocument);
      });
      console.info(newDocument)
    } else if (args.showKeys) {
      console.info(Object.keys(document));
    } else {
      console.info(document)
    }
  } catch(error) {
    console.error(error)
    console.info(fileContent)
  }
})()
