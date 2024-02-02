const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

const config = {
    user: 'jovanie',
    password: 'admin123',
    server: 'DESKTOP-71ON71H',
    port: 1433,
    database: 'Products',
    options: {
        encrypt: true,
        trustServerCertificate: true,
    },
};


const pool = new sql.ConnectionPool(config);

pool.on('error', err => {
    console.error('Pool error:', err);
});

pool.connect(err => {
    if (err) {
        console.error('Database connection failed:', err);
        process.exit(1); // Terminate the application on a failed connection
    } else {

        console.log('Connected to the database');
    }
});

app.use((req, res, next) => {
    req.pool = pool;
    next();

});

app.post('/deleteProduct', async (req, res) => {
    const { Product_ID } = req.body;
    const pool = req.pool;

    try {
        const result = await pool
            .request()
            .input('Product_ID', sql.INT, Product_ID)
            .execute('DeleteProduct');

        const rowsAffected = result.rowsAffected[0];
        console.log('Rows affected:', rowsAffected);

        if (rowsAffected > 0) {
            res.json({ success: true, message: 'Product deleted successfully!' });
        } else {
            res.json({ success: false, message: 'Product not found or no changes made.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error deleting product.' });
    }
});


app.post('/updateProduct', async (req, res) => {
    const { Product_ID, Product_Name, Variant, Quantity, Price } = req.body;
    const pool = req.pool;

    try {
        const result = await pool
            .request()
            .input('Product_ID', sql.INT, Product_ID)
            .input('Product_Name', sql.NVarChar(255), Product_Name)
            .input('Variant', sql.NVarChar(255), Variant)
            .input('Quantity', sql.INT, Quantity)
            .input('Price', sql.DECIMAL(10, 2), Price)
            .execute('UpdateProduct');

        // Check if recordset exists and has at least one element
        if (result.recordset && result.recordset.length > 0) {
            const rowsAffected = result.recordset[0].RowsAffected;
            console.log('Rows affected:', rowsAffected);

            if (rowsAffected > 0) {
                res.json({ success: true, message: 'Product updated successfully!' });
            } else {
                res.json({ success: false, message: 'Product not found or no changes made.' });
            }
        } else {
            res.json({ success: false, message: 'No data returned from the update operation.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error updating product.' });
    }
});

app.post('/insertProduct', async (req, res) => {
    const { Product_Name, Variant, Quantity, Price } = req.body;
    const pool = req.pool;

    try {
        const result = await pool
            .request()
            .input('Product_Name', sql.NVarChar(255), Product_Name)
            .input('Variant', sql.NVarChar(255), Variant)
            .input('Quantity', sql.INT, Quantity)
            .input('Price', sql.DECIMAL(10, 2), Price)
            .execute('InsertProduct');

        const insertedID = result.recordset[0].InsertedID;
        console.log('Inserted Product ID:', insertedID);

        res.json({ success: true, message: 'Product inserted successfully!', insertedID });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error inserting product.' });
    }
});

app.get('/readProducts', async (req, res) => {
    const pool = req.pool;

    try {
        const result = await pool
            .request()
            .query('SELECT * FROM ProductsItems');  // Corrected table name

        const data = result.recordset;
        console.log('Read Data:', data);

        res.json({ success: true, data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error reading products.' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

process.on('SIGINT', () => {
    console.log('Closing database connection on server shutdown');
    pool.close();   
    process.exit();
});
