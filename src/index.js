const program = require('commander');
const CONSTANTS = require('./shared/constants');

program.version('1.0.0')
    .option('-d, --development', 'Run in development mode, is default mode.')
    .option('-h, --homolog', 'Run in homlog mode')
    .option('-p, --production', 'Run in production mode')
    .parse(process.argv);

const options = program.opts();

if (options.production) {
    process.env.ENV = CONSTANTS.ENVIRONMENTS_NAMES.PRODUCTION;
} else if (options.homolog) {
    process.env.ENV = CONSTANTS.ENVIRONMENTS_NAMES.HOMOLOG;
} else {
    process.env.ENV = CONSTANTS.ENVIRONMENTS_NAMES.DEVELOPMENT;
}

require('dotenv').config();

const fs = require('fs');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();

const ApiErrorHandler = require('./middlewares/ErrorHandling');

if (!fs.existsSync('/var/tmp/lenofxAppconnect')) {
    fs.mkdirSync('/var/tmp/lenofxAppconnect', { recursive: true });
}

app.use(helmet());
app.use(cors({
    credentials: true,
    allowedHeaders: 'Content-Type, Accept',
    origin: function (origin, callback) {
        if (CONSTANTS.HOST_WHITE_LIST.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not Allowed by CORS'));
        }
    }
}));

app.use(bodyParser.json({
    verify: (req, res, buffer, enconding) => {
        if (buffer && buffer.length) {
            req.rawBody = buffer.toString(enconding || 'utf8');
        }
    }
}));

require('./controllers')(app);
app.use(ApiErrorHandler);

app.listen(process.env.PORT, () => {
    console.log(`App listen on port: ${process.env.PORT} in ${ process.env.ENV } mode.`);
});