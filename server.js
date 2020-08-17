const express = require("express");
const app = express();
const fs = require("fs");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const path = require("path");
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);
dotenv.config();
app.use(cors());
app.use(morgan("tiny"));
app.use(bodyParser.json());
app.use(morgan("combined", { stream: accessLogStream }));
const PORT = process.env.PORT ? process.env.PORT : 8000;
const JSON_FILE = process.env.JSON_FILE ? process.env.JSON_FILE : JSON_FILE;

app.get("/products", (req, res) => {
  const search = req.query.search;
  const query = req.query;
  fs.readFile(JSON_FILE, (err, data) => {
    products = JSON.parse(data);
    if (search) {
      const filteredproducts = products.filter((product) =>
        product.title.includes(search)
      );
      res.send(filteredproducts);
      // } else if (JSON.stringify(query) === JSON.stringify({ search: "" })) {
      //   res.send([]);
    } else {
      res.send(products);
    }
  });
});

app.post("/products", (req, res) => {
  fs.readFile(JSON_FILE, (err, data) => {
    const products = JSON.parse(data);
    const product = req.body;

    products.push(product);
    fs.writeFile(JSON_FILE, JSON.stringify(products), (err) => {
      res.send("YOU SUCCEED!!!");
    });
  });
});

app.delete("/products/:id", (req, res) => {
  fs.readFile(JSON_FILE, (err, data) => {
    const products = JSON.parse(data);
    const productId = +req.params.id;
    const productIndex = products.findIndex(
      (product) => product.id === productId
    );
    console.log(productIndex);
    products.splice(productIndex, 1);
    fs.writeFile(JSON_FILE, JSON.stringify(products), (err) => {
      res.send("YOU SUCCEED!!!");
    });
  });
});

app.put("/products/:id", (req, res) => {
  const params = req.params.id;
  if (params === "add") {
    fs.readFile(JSON_FILE, (err, data) => {
      let products = JSON.parse(data);
      console.log(req.body);
      let newProduct = req.body;
      newProduct = { id: products.length + 1, ...newProduct };
      console.log(newProduct);
      products = [...products, newProduct];
      fs.writeFile(JSON_FILE, JSON.stringify(products), (err) => {
        res.send("YOU SUCCEED!!!");
      });
    });
  } else {
    fs.readFile(JSON_FILE, (err, data) => {
      const products = JSON.parse(data);
      const productId = +req.params.id;
      const productIndex = products.findIndex(
        (product) => product.id === productId
      );
      console.log(req.body);
      const cheng = req.body;
      products[productIndex] = { ...products[productIndex], ...cheng };
      fs.writeFile(JSON_FILE, JSON.stringify(products), (err) => {
        res.send("YOU SUCCEED!!!");
      });
    });
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
