const { createApp } = require('../dist/main');

let cachedApp;

module.exports = async (req, res) => {
  if (!cachedApp) {
    cachedApp = await createApp();
  }
  
  const server = cachedApp.getHttpAdapter().getInstance();
  return server(req, res);
};
