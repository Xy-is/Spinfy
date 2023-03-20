const express = require('express');
const app = express();
const nodemailer = require('nodemailer');
app.use(express.json());


const userRoutes = require('./routes/userRoutes');



app.get('/', (req, res) => {
    res.send('Hello World!');
});


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

app.use('/users', userRoutes);