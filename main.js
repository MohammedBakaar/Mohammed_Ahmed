const express = require("express");
const mysql2 = require("mysql2/promise");


const app = express();
const PORT = 3000 ;
app.use(express.json())

let db ;
let  GetConnection =  async () => {
    if (db) {
        return db;
    }

    db = mysql2.createPool(
        {
            host: "localhost",
            port: 3306,
            user: "root",
            database: "sat",
            password: "",
            waitForConnections: true,
            connectionLimit: 10
        })
    
        return db
};

console.log(GetConnection());




app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`);
})