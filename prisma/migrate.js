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
    connection.query('CREATE DATABASE IF NOT EXISTS oidc', (err) => {
        if (err) {
            console.error('Error creating the database:', err);
            return;
        }

        console.log('Database "oidc" created');

        // Switch to the "oidc" database
        connection.query('USE oidc', (err) => {
            if (err) {
                console.error('Error switching to the database:', err);
                return;
            }

            console.log('Using database "oidc"');

            // Create the "session" table
            let createTableQuery = `
                CREATE TABLE IF NOT EXISTS proof_session (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    uid VARCHAR(255),
                    message_id VARCHAR(255),
                    connection_id VARCHAR(255) NOT NULL,
                    verified BOOLEAN,
                    state VARCHAR(255) NOT NULL,
                    account_id VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `;

            connection.query(createTableQuery, (err) => {
                if (err) {
                    console.error('Error creating the table:', err);
                    return;
                }

                console.log('Table "session" created');
            });

            createTableQuery = `
                CREATE TABLE IF NOT EXISTS log (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    activity VARCHAR(255) NOT NULL,
                    message VARCHAR(255) NOT NULL,
                    actor VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `;

            connection.query(createTableQuery, (err) => {
                if (err) {
                    console.error('Error creating the table:', err);
                    return;
                }

                console.log('Table "session" created');
            });

            // Create the "account" table
            createTableQuery = `
                CREATE TABLE IF NOT EXISTS account (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    uuid VARCHAR(255) NOT NULL,
                    is_legal_age BOOLEAN NOT NULL,
                    cred_rev_id VARCHAR(255) NOT NULL,
                    rev_reg_id VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `;

            connection.query(createTableQuery, (err) => {
                if (err) {
                    console.error('Error creating the table:', err);
                    return;
                }
                // Close the connection to the MySQL server
                connection.end((err) => {
                    if (err) {
                        console.error('Error closing the connection:', err);
                        return;
                    }

                    console.log('Connection closed');
                });

                console.log('Table "account" created');
            });
        });
    });
});