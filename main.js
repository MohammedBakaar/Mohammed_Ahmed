const express = require("express");
const mysql2 = require("mysql2/promise");




const createPrdousts = "CREATE TABLE IF NOT EXISTS `Products` (`ProductID` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY, `ProductName` varchar(50) NOT NULL, `Price` decimal(10,2) NOT NULL, `StockQuantity` int(11), `SupplierId` int(11))";
const createSales = "CREATE TABLE IF NOT EXISTS `Sales` (`SaleID` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY, `ProductID` int(11), `QuantitySold` int(11), `SaleDate` date)";
const createSuppliers = "CREATE TABLE IF NOT EXISTS `Supplier` (`SupplierID` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY, `SupplierName` varchar(50), `ContactNumber` varchar(11))";

const constranisPrdoucts = "ALTER TABLE `Products` ADD CONSTRAINT `S_P` FOREIGN KEY (`SupplierId`) REFERENCES `Supplier` (`SupplierID`) ON UPDATE SET NULL ON DELETE SET NULL";
const constranisSales = "ALTER TABLE `Sales` ADD CONSTRAINT `P_S` FOREIGN KEY (`ProductID`) REFERENCES `Products` (`ProductID`) ON UPDATE SET NULL ON DELETE SET NULL ";

const UseData = "USE Data";




const app = express();
const PORT = 3000 ;
app.use(express.json())

let db , result;
const createTables = async ()=>{
     console.log("Creatin db...");
    await db.query(UseData);
    await db.query(createSuppliers);
    await db.query(createPrdousts);
    await db.query(createSales);
    await db.query(constranisPrdoucts);
    await db.query(constranisSales);
    console.log("Dataase created");
}

let createDbConnection = async ()=>{
    if (db) {
        return db
    }

    db = await mysql2.createConnection({
        host : "localhost",
        user  : "root",
        port : "3306",
        password : ""
    });

     result = await db.query("CREATE DATABASE Data").catch(err => console.log("DataBase already exist"));
     if(result){
        createTables();
    }
         else 
            {
               await db.query(UseData);
                ("Dataase created");
            }
    return result;
}

createDbConnection()

app.post("/product/createProduct" , async(req,res,next)=>{
    let { ProductName, Price, StockQuantity , SupplierID} = req.body;
  let [result]= await  db.execute("INSERT INTO `Products`( `ProductName`, `Price`, `StockQuantity` ,`SupplierID`) VALUES (?,?,?,?)",[ProductName,Price,StockQuantity,SupplierID]);
    if(!result.affectedRows) return res.status(404).json({"message" : "Error"})
     res.status(200).json({
    message: "Prdouct added",
    result
  })
  })
app.post("/supplier/createSupplier" , async(req,res,next)=>{
    let { SupplierName , ContactNumber} = req.body;
  let [result]= await  db.execute("INSERT INTO `Supplier`( `SupplierName` , `ContactNumber` ) VALUES (?,?)",[SupplierName , ContactNumber]);
  
    if(!result.affectedRows) return res.status(404).json({"message" : "Error"})
     res.status(200).json({
    message: "supplier added",
    result
  })
  })

  app.post("/sales/recordSale" , async(req,res,next)=>{
    let { ProductID , QuantitySold , SaleDate} = req.body;
  let [result]= await  db.execute("INSERT INTO `Sales`( `ProductID` , `QuantitySold` ,`SaleDate` ) VALUES (?,?,?)",[ProductID , QuantitySold,SaleDate]);
    if(!result.affectedRows) return res.status(404).json({"message" : "Error"})
     res.status(200).json({
    message: "Sale recorded",
    result
  })
  })
app.get("/product/getAll", async(req,res)=>{
    let [result ]= await db.execute("SELECT * FROM `Products`");
    if(!result) return res.status(404).json({message : "not found"});
    res.status(200).json(result);
})
app.get("/supplier/getAll", async(req,res)=>{
    let [result ]= await db.execute("SELECT * FROM `Supplier`");
    if(!result) return res.status(404).json({message : "not found"});
    res.status(200).json(result);
})

app.delete("/product/delete/:id",async (req,res)=>{
     let {id} = req.params;
    let [result ]= await db.execute("DELETE FROM `Products` WHERE ProductID = ?; ",[id]);
    if(!result.affectedRows) return res.status(404).json({"message" : "Error"})
     res.status(200).json(result);
})
app.delete("/supplier/delete/:id",async(req,res)=>{
     let {id} = req.params;
    let [result ]= await db.execute("DELETE FROM `Supplier` WHERE SupplierID = ?; ",[id]);
    if(!result.affectedRows) return res.status(404).json({"message" : "Error"})
     res.status(200).json(result);
})

app.put("/product/update/:id", async (req, res) => {
  let { id } = req.params

  let updateQuery = " UPDATE `Products` SET "
  let bindingArr = []
  let entries = Object.entries(req.body)
  for (const [key, value] of entries) {
    updateQuery += ` ${key} = ? ,`
    bindingArr.push(value)
  }
  updateQuery = updateQuery.slice(0, -1)
  updateQuery += "WHERE ProductID = ?"
  bindingArr.push(id)
  let [result] = await db.execute(updateQuery, bindingArr)

  if (!result.affectedRows) return res.status(404).json({ 'message': "Error" })

  res.status(200).json({message: "product updated", result })

})
app.put("/supplier/update/:id", async (req, res) => {
  let { id } = req.params

  let updateQuery = " UPDATE `Supplier` SET "
  let bindingArr = []
  let entries = Object.entries(req.body)
  for (const [key, value] of entries) {
    updateQuery += ` ${key} = ? ,`
    bindingArr.push(value)
  }
  updateQuery = updateQuery.slice(0, -1)
  updateQuery += "WHERE SupplierID = ?"
  bindingArr.push(id)

  
  let [result] = await db.execute(updateQuery, bindingArr)

  if (!result.affectedRows) return res.status(404).json({ 'message': "Error" })

  res.status(200).json({message: "supplier updated", result })

})
app.put("/addColumn",async (req,res)=>{
    let [result] = await db.execute("ALTER TABLE `Products` ADD COLUMN `Category` VARCHAR(20)" )
     res.status(201).json({result })
})
app.delete("/deleteColumn",async (req,res)=>{
    let [result] = await db.execute("ALTER TABLE `Products` DROP `Category`;" )
     res.status(201).json({result })
})


app.put("/modifyColumn",async (req,res)=>{
    let [result] = await db.execute("ALTER TABLE `Supplier` MODIFY `ContactNumber` VARCHAR(15);" )
     res.status(201).json({result })
})
app.put("/constrainColumn",async (req,res)=>{
    let [result] = await db.execute("ALTER TABLE `Products` MODIFY `ProductName` VARCHAR(50) NOT NULL;" )
     res.status(201).json({result })
})

app.put("/supplier/insert",async (req,res)=>{
    let [result] = await db.execute('INSERT INTO Supplier (SupplierName, ContactNumber) VALUES (?, ?)',['FreshFoods', '01001234567'])
    if (!result.affectedRows) return res.status(404).json({ 'message': "Error" })

  res.status(200).json({message: "supplier updated", result })

})
app.put("/product/insert",async (req,res)=>{
    let [result] = await db.query('SELECT SupplierID FROM Supplier WHERE SupplierName = ?', ['FreshFoods']);
    if (!result.length) {
      return res.status(400).json({ message: 'Supplier does not exist' });
    }
    const supplierId = result[0].SupplierID;
   
    let [result1] = await db.execute('INSERT INTO Products (ProductName, Price, StockQuantity, SupplierId) VALUES (?, ?, ?, ?)',['Milk', 15.00, 50, supplierId])
    let [result2] = await db.execute('INSERT INTO Products (ProductName, Price, StockQuantity, SupplierId) VALUES (?, ?, ?, ?)',['Bread', 10.00, 30, supplierId])
    let [result3] = await db.execute('INSERT INTO Products (ProductName, Price, StockQuantity, SupplierId) VALUES (?, ?, ?, ?)',['Eggs', 20.00, 40, supplierId])
  
  res.status(200).json({ result1 , result2 , result3})

})
app.put("/product/insert-egg",async (req,res)=>{
    let [result] = await db.query('SELECT SupplierID FROM Supplier WHERE SupplierName = ?', ['FreshFoods']);
    if (!result.length) {
      return res.status(400).json({ message: 'Supplier does not exist' });
    }
    const supplierId = result[0].SupplierID;

   let [eggquery]= await db.query('INSERT INTO Products (ProductName, Price, StockQuantity, SupplierId) VALUES (?, ?, ?, ?)',['Eggs', 20.00, 40, supplierId] );
     if (!eggquery.affectedRows) return res.status(404).json({ 'message': "Error" , eggquery});
     else
        res.status(200).json({message : "eggs added"})

})
app.put("/product/bread",async (req,res)=>{
    const [result] = await db.query('UPDATE Products SET Price = ? WHERE ProductName = ?',[25.00, 'Bread'])
    if (!result.affectedRows) return res.status(404).json({ 'message': "Error" })

  res.status(200).json({message: "bread updated", result })

})
app.delete("/product/egg",async (req,res)=>{
    const [result] = await db.query('DELETE FROM `Products` WHERE ProductName = ?',['Eggs'])
    if (!result.affectedRows) return res.status(404).json({ 'message': "Error" },result)

  res.status(200).json({message: "Eggs deleted", result })

})
app.get("/product/stock", async(req,res)=>{
    const [result] = await db.execute(`SELECT * FROM Products ORDER BY StockQuantity DESC`);
   
    if(!result.length) return res.status(404).json({message : "not found"});
    res.status(200).json(result[0]);
})
app.get("/supplier/f", async(req,res)=>{
    const [result] = await db.execute('SELECT * FROM Supplier WHERE SupplierName LIKE ?',['F%']);
   
    if(!result.length) return res.status(404).json({message : "not found"});
    res.status(200).json(result);
})

app.get("/product/nosales", async(req,res)=>{
    const [result] = await db.execute(`SELECT p.* FROM Products p LEFT JOIN Sales s ON p.ProductID = s.SaleID WHERE s.SaleID IS NULL`);
   
    if(!result.length) return res.status(404).json({message : "not found"});
    res.status(200).json(result);
})

app.get("/sales/report", async(req,res)=>{
    const [result] = await db.execute(` SELECT p.ProductName , s.QuantitySold, s.SaleDate FROM Sales s INNER JOIN Products p ON s.ProductID = p.ProductID`);
   
   
    if(!result.length) return res.status(404).json({message : "not found", result});
    res.status(200).json(result);
})
app.get("/sales/:id", async(req,res)=>{
    let {id} = req.params
    
    let [result ]= await db.execute("SELECT * FROM `Sales` WHERE ProductID = ?; ",[id]);
    if(!result.length) return res.status(404).json({message : "not found"});
    res.status(200).json(result);
})







app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`);
})