'use strict';

require('dotenv').config();

var path = require('path');
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');

var oas3Tools = require('oas3-tools');
var serverPort = process.env.PORT || 8089;
// var serverPort = 8089;

var keycloakHelperService = require("kommonitor-keycloak-helper");
keycloakHelperService.initKeycloakHelper(process.env.KEYCLOAK_AUTH_SERVER_URL, process.env.KEYCLOAK_REALM, process.env.KEYCLOAK_RESOURCE, process.env.KEYCLOAK_CLIENT_SECRET, process.env.KEYCLOAK_ADMIN_RIGHTS_USER_NAME, process.env.KEYCLOAK_ADMIN_RIGHTS_USER_PASSWORD, process.env.KOMMONITOR_ADMIN_ROLENAME);


// swaggerRouter configuration
var options = {
    routing: {
        controllers: path.join(__dirname, './controllers')
    },
};

var expressAppConfig = oas3Tools.expressAppConfig(path.join(__dirname, 'api/openapi.yaml'), options);

var openApiApp = expressAppConfig.getApp();

/*
    workaround to support CORS and modify some express middleware parameters
*/

const app = express();

app.use(bodyParser.json({limit:'50mb'}));
app.use(bodyParser.urlencoded({extended:true, limit:'50mb'}));

const corsOptions = {
  // exposedHeaders: 'Access-Control-Allow-Origin,Location,Connection,Content-Type,Date,Transfer-Encoding'
  exposedHeaders: ['Access-Control-Allow-Origin','Location','Connection','Content-Type','Date','Transfer-Encoding','Origin','X-Requested-With', 'Accept'],
  origin: "*"
};

// intercept requests to perform any keycloak protection checks.
if(JSON.parse(process.env.KEYCLOAK_ENABLED)){
    app.use(async function(req, res, next) {
      // intercept requests to perform any keycloak protection checks.
      await keycloakHelperService.checkKeycloakProtection(req, res, next, "POST");
    });
  }

// Add headers
app.use(/.*/, cors(corsOptions));

for (let i = 2; i < openApiApp._router.stack.length; i++) {
    app._router.stack.push(openApiApp._router.stack[i])
}

// Initialize the Swagger middleware
http.createServer(app).listen(serverPort, function () {
    console.log('Your server is listening on port %d (http://localhost:%d)', serverPort, serverPort);
    console.log('Swagger-ui is available on http://localhost:%d/docs', serverPort);
});

