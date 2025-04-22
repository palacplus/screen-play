const { createProxyMiddleware } = require("http-proxy-middleware");
const { env } = require("process");

const target = env.REACT_APP_SERVER_PORT
  ? `http://localhost:${env.REACT_APP_SERVER_PORT}`
  : "http://localhost:5001";

const context = [
  "/_configuration",
  "/.well-known",
  "/Identity",
  "/connect",
  "/ApplyDatabaseMigrations",
  "/_framework",
  "/api",
  "/signin-google",
  "/swagger",
];

const onError = (err, req, resp, target) => {
  console.error(`${err.message}`);
};

module.exports = function (app) {
  const appProxy = createProxyMiddleware(context, {
    target: target,
    onError: onError,
    secure: false,
    headers: {
      Connection: "Keep-Alive",
    },
  });

  app.use(appProxy);
};
