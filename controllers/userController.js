const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');
const sendEmail = require('../utils/EmailSender');
const url = require('url');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'casino',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

exports.register = async (req, res) => {
    const { login, email, password } = req.body;

    try {
        const [rows, fields] = await pool.execute(
            'SELECT * FROM Users WHERE login = ? OR email = ?',
            [login, email]
        );

        if (rows.length > 0) {
            res.status(400).send('User with this email or login already registered');
            return;
        }

        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        const verificationCode = uuidv4();
        const verificationlink = `localhost:3000/users/verify?code=${verificationCode}`;
        console.log(verificationlink);
        const [result, _] = await pool.execute('INSERT INTO Users (login, email, passwordHash, balance, Verified, status, verificationLink) VALUES (?, ?, ?, ?, ?, ?, ?)', [login, email, passwordHash, 0, 0, 0, verificationCode]);
        sendEmail(verificationlink);
        res.send({  login, email });
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
};

exports.login = async (req, res) => {
    const { loginOrEmail, password } = req.body;

    try {
        const [rows, fields] = await pool.execute(
            'SELECT * FROM Users WHERE login = ? OR email = ?',
            [loginOrEmail, loginOrEmail]
        );

        if (rows.length === 0) {
            res.status(400).send('User not found');
            return;
        }

        const user = rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (isPasswordValid) {
                res.send('Logged in successfully');
        } else {
            res.status(400).send('Incorrect password');
        }
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
};

exports.verify = async (req, res) => {
    try {
        const link = req.url;
        console.log(link);
        const queryObject = url.parse(link, true).query;
        const verificationCode = queryObject.code;

        const [rows] = await pool.execute(
            `UPDATE Users set Verified = true WHERE verificationLink = ?`,
            [verificationCode]
        )

        if(rows.affectedRows === 0){

            res.send('Users not found');
        }
        res.send('OK');
    }catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
}
