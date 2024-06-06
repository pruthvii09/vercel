const express = require("express");
const httpProxy = require("http-proxy");
const app = express();

const PORT = 8000;
const BASE_PATH = "https://vercerl-clone.s3.ap-south-1.amazonaws.com/__outputs";
const proxy = httpProxy.createProxy();
app.use((req, res) => {
  const hostName = req.hostname;
  const subdomain = hostName.split(".")[1];
  const resolveTo = `${BASE_PATH}/${subdomain}`;

  return proxy.web(req, res, { target: resolveTo, changeOrigin: true });
});
app.listen(PORT, () => {
  console.log(`Reverse Proxy running at ${PORT}`);
});
