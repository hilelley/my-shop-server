const express = require("express");
const fs = require("fs");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");

app.use(bodyParser.json());

app.use(cors());

app.get("/products", (req, res) => {
  console.log("QUERY:", req.query.search);
  const search = req.query.search;
  fs.readFile("products.json", (err, data) => {
    products = JSON.parse(data);
    if (search) {
      const filteredproducts = products.filter((product) =>
        product.title.includes(search)
      );
      res.send(filteredproducts);
    } else {
      res.send(products);
      console.log(products);
    }
  });
});

app.post("/products", (req, res) => {
  fs.readFile("products.json", (err, data) => {
    const products = JSON.parse(data);
    const product = req.body;

    products.push(product);
    fs.writeFile("products.json", JSON.stringify(products), (err) => {
      // console.log(err);
      res.send("YOU SUCCEED!!!");
    });
  });
});

app.delete("/products/:id", (req, res) => {
  fs.readFile("products.json", (err, data) => {
    const products = JSON.parse(data);
    const productId = +req.params.id;
    const productIndex = products.findIndex(
      (product) => product.id === productId
    );
    console.log(productIndex);
    products.splice(productIndex, 1);
    fs.writeFile("products.json", JSON.stringify(products), (err) => {
      res.send("YOU SUCCEED!!!");
    });
  });
});

app.put("/products/:id", (req, res) => {
  fs.readFile("products.json", (err, data) => {
    const products = JSON.parse(data);
    const productId = +req.params.id;
    const productIndex = products.findIndex(
      (product) => product.id === productId
    );
    console.log(req.body);
    const ceng = req.body;
    products[productIndex] = { ...products[productIndex], ...ceng };
    fs.writeFile("products.json", JSON.stringify(products), (err) => {
      res.send("YOU SUCCEED!!!");
    });
  });
});

app.listen(8000, () => {
  console.log("Example app listening on port 8000!");
});
