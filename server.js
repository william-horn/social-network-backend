
// import libraries
const mongoose = require('mongoose');
const express = require('express');
const db = require('./config/db-connect');
const { User, Thought } = require('./models');

// get env vars
const PORT = process.env.PORT || 3001;

const routes = require('./routes');
const app = express();

// use app middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(routes);

db.once('open', async () => {
    console.log('Database is open');

    await User.deleteMany({});
    await Thought.deleteMany({});

    await User.create({ username: 'william', email: 'will@will.com' });
    await User.create({ username: 'james', email: 'james@james.com' });
    await User.create({ username: 'zac', email: 'zac@zac.com' });
    await User.create({ username: 'kaylan', email: 'kaylan@kaylan.com' });

    app.listen(PORT, () => {
        console.log(`App running on port ${PORT}!`);
    });
});

