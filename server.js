require('dotenv').config();
const express = require('express');
const users = require('./routes/userRoutes');
const events = require('./routes/eventRoutes');
const sportEvents = require('./routes/sportEventRoutes');
const departments = require('./routes/departmentRoutes');
const schedules = require('./routes/scheduleRoutes');
const matches = require('./routes/matchRoutes');
const results = require('./routes/resultRoutes');
const connectDB = require('./config/dbConnection');
const notFoundMiddleware = require('./middlewares/not-found');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.use('/api/v1/users', users); 
app.use('/api/v1/events', events);
app.use('/api/v1/sport-events', sportEvents);
app.use('/api/v1/departments', departments);
app.use('/api/v1/schedules', schedules);
app.use('/api/v1/matches', matches);
app.use('/api/v1/results', results);

app.use(notFoundMiddleware);

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URL); // this is my connection string hiding it on .env variables
        app.listen(port, () => console.log(`Server is running on port ${port}`));
    } catch(error) {
        console.log(error);
    }
}

start();