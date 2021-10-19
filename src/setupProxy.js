const proxy = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/talk/*",
    proxy({
      target: "http://localhost:8001",

      changeOrigin: true,
    })
  );
};
