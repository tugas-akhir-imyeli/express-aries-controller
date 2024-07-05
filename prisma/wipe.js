import mysql from 'mysql';
import dotenv from 'dotenv';
dotenv.config();
// Create a connection to the MySQL server
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

// Connect to the MySQL server
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }

    console.log('Connected to the database');

    // Create the "oidc" database
    connection.query('DROP DATABASE IF EXISTS oidc', (err) => {
        if (err) {
            console.error('Error deleting the database:', err);
            return;
        }
        connection.end((err) => {
            if (err) {
                console.error('Error closing the connection:', err);
                return;
            }

            console.log('Connection closed');
        });
        });
    });