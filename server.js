
// import libraries
const mongoose = require('mongoose');
const express = require('express');
const db = require('./config/db-connect');

// get env vars
const PORT = process.env.PORT || 3001;

const routes = require('./routes');
const app = express();

// use app middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(routes);

db.once('open', () => {
    console.log('Database is open');

    app.listen(PORT, () => {
        console.log(`App running on port ${PORT}!`);
    });
});

