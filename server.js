'use strict';

const https = require('https');
const config = require('@labskit/config');

const configureApp = require('./server/app');

module.exports = configureApp()
  .then(app => {
    // server on PORT_HTTP
    const server = app.listen(config.port, () => {
      logger.info(`Express HTTP server listening on port ${server.address().port}`);
    });

    if (koe.app.sslCredentials) {
      // server on PORT_HTTPS
      const serverHttps = https
        .createServer(koe.app.sslCredentials, app)
        .listen(config.portHttps, () => {
          logger.info(`Express HTTPS server listening on port ${serverHttps.address().port}`);
        });
    }

    // Return initialized express app
    return app;
  })
  .catch(err => {
    logger.error('Error initializing application', err);
    process.exit(1);
  });
