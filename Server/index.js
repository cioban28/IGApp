const express = require('express')
const app = express()
const regions = require('./data/regions');
const indicatorsSchema = require('./data/indicatorsSchema');
const channelsSchema = require('./data/channelsSchema');
const userAccount = require('./data/userAccount');
const userMonthPlan = require('./data/userMonthPlan');
const cache = require('./data/cache');
const cors = require('cors');

const PORT = 8443;

app.use(cors({origin: 'http://localhost:7272', credentials: true, allowedHeaders: ['Content-Type', 'Authorization']}));
// app.use(passport.initialize());
// app.use(passport.session());
//
// const authCheck = jwt({
//   secret: config.clientSecret,
//   audience: config.clientId
// });

// app.use(authCheck);

app.get('/', (req, res) => res.send('Hello World!'))

app.get('/regions/:UID', (req, res) => res.send(regions));
app.get('/useraccount/:UID', (req, res) => res.send(userAccount));
app.get('/metadata/indicators', (req, res) => res.send(indicatorsSchema));
app.get('/metadata/channels', (req, res) => res.send(channelsSchema));
app.get('/usermonthplan/:UID', (req, res) => res.send(userMonthPlan));
app.get('/usermonthplan-noattr/:UID', (req, res) => res.send(userMonthPlan));
app.post('/attribution/:UID', (req, res) => res.send({}));
app.post('/attribution/cached/:UID', (req, res) => res.send({...cache, schema: channelsSchema}));
app.get('/getUnmappedData/:UID', (req, res) => res.send([[], []]));


app.listen(8443, () => console.log(`Example app listening on port ${PORT}!`))