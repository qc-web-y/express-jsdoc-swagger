const swaggerUi = require('swagger-ui-express');
const merge = require('merge');
const through = require('through');
const gulpUtil = require('gulp-util');
const path = require('path');
const fs = require('fs');

const defaultOptions = require('./config/default');
const swaggerEventsOptions = require('./config/swaggerEvents');
const processSwagger = require('./processSwagger');
const swaggerEvents = require('./swaggerEvents');

const expressJSDocSwagger = app => (userOptions = {}, userSwagger = {}) => {
  const workDir = userOptions.test ? path.join(__dirname, './examples/gulpSwaggerJSDoc/dist/') : __dirname;
  const swaggerJSONPath = path.join(workDir, './swagger.json');
  const exists = fs.existsSync(swaggerJSONPath);
  const events = swaggerEvents(swaggerEventsOptions(userOptions));
  const { instance } = events;
  const options = {
    ...defaultOptions,
    ...userOptions,
  };

  let swaggerObject = {};
  if (exists) {
    swaggerObject = fs.readFileSync(swaggerJSONPath, 'utf8');
    swaggerObject = JSON.parse(swaggerObject);
  } else {
    processSwagger(options, events.processFile)
      .then(result => {
        swaggerObject = {
          ...swaggerObject,
          ...result.swaggerObject,
        };
        swaggerObject = merge.recursive(true, swaggerObject, userSwagger);
        events.finish(swaggerObject, {
          jsdocInfo: result.jsdocInfo,
          getPaths: result.getPaths,
          getComponents: result.getComponents,
          getTags: result.getTags,
        });
      })
      .catch(events.error);
  }

  if (options.exposeSwaggerUI) {
    app.use(
      options.swaggerUIPath,
      (req, res, next) => {
        swaggerObject = {
          ...swaggerObject,
          host: req.get('host'),
        };
        req.swaggerDoc = swaggerObject;
        next();
      },
      swaggerUi.serve,
      swaggerUi.setup(undefined, options.swaggerUiOptions),
    );
  }

  if (options.exposeApiDocs) {
    app.get(options.apiDocsPath, (req, res) => {
      res.json({
        ...swaggerObject,
        // we skipped this as is not a valid prop in OpenAPI
        // This is only being used in the SwaggerUI Library
        host: undefined,
      });
    });
  }

  return instance;
};

const gulpSwaggerJSDoc = (userOptions = {}, userSwagger = {}) => {
  // eslint-disable-next-line prefer-arrow-callback, func-names
  const stream = through(function (file, enc, cb) {
    this.push(file);
    if (cb && typeof cb === 'function') cb();
  });

  const events = swaggerEvents(swaggerEventsOptions(userOptions));

  let swaggerObject = {};
  const swaggerOptions = {
    ...defaultOptions,
    ...userOptions,
  };

  processSwagger(swaggerOptions, events.processFile)
    .then(result => {
      swaggerObject = {
        ...swaggerObject,
        ...result.swaggerObject,
      };
      swaggerObject = merge.recursive(true, swaggerObject, userSwagger);

      events.finish(swaggerObject, {
        jsdocInfo: result.jsdocInfo,
        getPaths: result.getPaths,
        getComponents: result.getComponents,
        getTags: result.getTags,
      });

      const swaggerJSON = new gulpUtil.File({
        path: 'swagger.json',
        contents: Buffer.from(JSON.stringify(swaggerObject)),
      });
      stream.queue(swaggerJSON);
      stream.emit('end');
    })
    .catch(events.error);
  return stream;
};

if (typeof exports === 'object') {
  module.exports = expressJSDocSwagger;
  module.exports.gulpSwaggerJSDoc = gulpSwaggerJSDoc;
} else if (typeof define === 'function' && define.amd) {
  define([], expressJSDocSwagger, gulpSwaggerJSDoc);
} else {
  this.default = expressJSDocSwagger;
  this.expressJSDocSwagger = gulpSwaggerJSDoc;
}
