<% if(aliases === true) { %>
// Register module/require aliases
require('module-alias/register');
<% } %>

// Patches
require('express-custom-error').inject(); // Patch express in order to use async / await syntax

// Require Dependencies

const express = require('express');
<% if(logger === 'morgan') { %>
const morgan = require('morgan');
<% } %>
<% if(logger === 'voleyball') { %>
const voleyball = require('voleyball');
<% } %>
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');

const winston = require('winston');
const expressWinston = require('express-winston');

// Load .env Enviroment Variables to process.env
require('mandatoryenv').load([
    'DB_HOST',
    'DB_DATABASE',
    'DB_USER',
    'DB_PASSWORD',
    'PORT',
    'SECRET_KEY'
]);
const { PORT } = process.env;


// Instantiate an Express Application

const app = express();


// Configure Express App Instance
app.use(express.json( { limit: '50mb' } ));
app.use(express.urlencoded( { extended: true, limit: '10mb' } ));

app.use(expressWinston.logger({
    transports: [
        new winston.transports.Console()
    ],
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.json()
    ),
    meta: true,
    msg: " > {{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}",
    expressFormat: true,
    colorize: true
}));

<% if(logger === 'morgan') { %>
app.use(morgan('dev'));
<% } %>
<% if(logger === 'voleyball') { %>
app.use(volleyball);
<% } %>
app.use(cookieParser());
app.use(cors());
app.use(helmet());

// This middleware adds the json header to every response
app.use('*', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
})

// Assign Routes
<% if(aliases === true) { %>
app.use('/', require('@routes/router.js'));
<% } else { %>
app.use('/', require('./routes/router.js'));
<% } %>

// Handle errors
app.use((err, req, res, next) => {
    if(err){ // Check if there's an error
    <% if(rest) { %>
        if(err.code && err.message){ // Handle custom error
            res
            .status(err.code)
            .send({status: false,message: err.message});
        } else { // Handle all other errors
            res
            .status(400)
            .send({status: false,message: err});
        }
    <% } else { %>
        res
        .status(400)
        .send({status: false,message: err});
    <% } %>
    } else {
        next();
    }
});

// Handle not valid route
app.use('*', (req, res) => {
    res
    .status(404)
    .json( {status: false, message: 'Endpoint Not Found'} );
})

// Open Server on selected Port
app.listen(
    PORT,
    () => console.info('Server listening on port ', PORT)
);