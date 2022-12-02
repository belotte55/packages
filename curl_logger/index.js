'use strict';

const _ = require('lodash');
const fs = require('fs');
const minimist = require('minimist')
const flat = require('flat')

const argv = minimist(process.argv.slice(2))
const args = {
  flat: argv.flat,
  fields: [...(argv._[0] || '').split(' '), ...argv._.slice(1).map(arg => arg.replace(/^ */, '').replace(/ *$/, ''))].filter(Boolean),
  filePath: `/tmp/curlResponse.txt`
}

const namedParams = ['flat', 'no_date']
namedParams.forEach(namedParam => {
  const index = args.fields.indexOf(`--${namedParam}`)
  if (index > -1) {
    args[namedParam] = args.fields.splice(index, 1)
  }
})

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

const logFlatDocument = document => {
  const flatObject = flat.flatten(document, { safe: false })
  const orderedObject = { }
  Object.keys(flatObject).sort().forEach(key => {
    orderedObject[key] = flatObject[key]
  })
  console.info(orderedObject)
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
      if (args.flat) {
        logFlatDocument(document)
      } else {
        console.info(newDocument)
      }
    } else if (args.showKeys) {
      console.info(Object.keys(document));
    } else {
      if (args.flat) {
        logFlatDocument(document)
      } else {
        console.info(document)
      }
    }
  } catch(error) {
    console.error(error)
    console.info(fileContent)
  }
})()
