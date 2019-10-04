import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import cors from 'cors';
// import fileUpload from 'express-fileupload';

import router from './routes';
import {authenticateToken} from './app/controllers/AuthController'
import winston from './config/winston';
import dbConfig from './config/database.config';

// create express app
const app = express();

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

// parse requests of content-type - application/json
app.use(bodyParser.json())

// Configuring the database
mongoose.Promise = global.Promise;
// mongoose.connect(`mongodb://${db.url}:${db.port}/${db.name}` , { useMongoClient: true });
const dbUrl = `${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`;
winston.info("DB Url: " + dbUrl);  
let options = { useNewUrlParser: true }
// if (dbConfig.user && dbConfig.pass) {
//     options.user = dbConfig.user;
//     options.pass = dbConfig.pass;
// }
// winston.info("DB options: ", options); 
mongoose.connect(dbUrl, options)
    .then(() => {
        winston.info("Successfully connected to the database");    
    }).catch(err => {
        winston.error('Could not connect to the database. Exiting now...', err);
        process.exit();
    });

// file upload plugin
// app.use(fileUpload());

// Enable CORS
app.use(cors());

// Logging
app.use(morgan(':method :url :status :res[content-length] - :response-time ms', { stream: winston.stream }));
// app.use(morgan('combined', { stream: winston.stream }));

// Routes and related middleware
app.use('/public', router.public);
app.use('/protected', authenticateToken, router.protected);
// app.use('/admin', authenticateToken, authenticateAdmin, router.admin);

// define a simple route
app.get('/', (req, res) => {
    res.json({"message": "Welcome to RFID System."});
});

// health endpoint
app.get('/health', (req, res) => {
    res.json({"message": "RFID System Server Running."});
});

//TODO: add common error handler

// listen for requests
app.listen(3000, () => {
    winston.info("Server is listening on port 3000");
});
