const express = require("express");
const app = express();
const fs = require("fs");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const mongoose = require("mongoose");
const morgan = require("morgan");

app.use(cors());
app.use(bodyParser.json());

// .ent
dotenv.config();
const PORT = process.env.PORT ? process.env.PORT : 8000;
const JSON_FILE = process.env.JSON_FILE ? process.env.JSON_FILE : JSON_FILE;

// morgan
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);
app.use(morgan("tiny"));
app.use(morgan("combined", { stream: accessLogStream }));

// socket
const http = require("http");
const socketIo = require("socket.io");
const server = http.createServer(app);
const io = socketIo(server);

// mongodb

const productSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

const Product = mongoose.model("Product", productSchema);

app.get("/products", (req, res) => {
  const search = req.query.search;
  fs.readFile(JSON_FILE, async (err, data) => {
    products = JSON.parse(data);
    if (search) {
      const filteredproducts = await Product.find()
        .where({ title: new RegExp(search) })
        .sort({ id: 1 })
        .select({
          _id: false,
          id: true,
          title: true,
          image: true,
          quantity: true,
          price: true,
        })
        .exec();
      console.log("geting filtered array products from mongo");

      res.send(filteredproducts);
    } else {
      // get the array products from mongo
      let productsFromMongo = await Product.find()
        .sort({ id: 1 })
        .select({
          _id: false,
          id: true,
          title: true,
          image: true,
          quantity: true,
          price: true,
        })
        .exec();
      console.log("geting array products from mongo");
      res.send(productsFromMongo);
    }
  });
});

app.delete("/products/:id", async (req, res) => {
  let params = req.params.id;
  let data = req.body;

  // delete product to mongo

  let probuctToDelete = await Product.find({ id: params }).exec();
  try {
    await Product.findByIdAndRemove(probuctToDelete[0]._doc._id);
    console.log("delete product");
    res.send("YOU SUCCEED!!!");
  } catch (e) {
    console.log("Error:", e._message);
  }
});

app.put("/products/:id", async (req, res) => {
  let params = req.params.id;
  let data = req.body;
  if (params === "add") {
    let arrayProdeucts = await Product.find().exec();

    params = arrayProdeucts.length + 1;

    // add product to mongo
    const addProduct = new Product({
      id: params,
      title: data.title,
      image: data.image,
      quantity: data.quantity,
      price: data.price,
    });

    try {
      await addProduct.save();
      console.log("add product");
      res.send("YOU SUCCEED!!!");
    } catch (e) {
      console.log("Error:", e._message);
    }
  } else {
    // update product to mongo`

    let oldProbuct = await Product.find({ id: params }).exec();
    // console.log("oldProbuct[0]:", { ...oldProbuct[0]._doc });
    // console.log("data:", { id: +params, ...data });
    let updateProduct = { ...oldProbuct[0]._doc, ...data };
    delete updateProduct._id;
    console.log("updateProduct:", updateProduct);
    updateProduct = new Product(updateProduct);
    try {
      await updateProduct.save();
      await Product.findByIdAndRemove(oldProbuct[0]._doc._id);
      console.log("uodate product");
      res.send("YOU SUCCEED!!!");
    } catch (e) {
      console.log("Error:", e._message);
    }
  }
});

// const testt = async () => {
//   let oldProbuct = await Product.find({ id: 1 }).exec();
//   let updateProduct = { ...oldProbuct, id: 12121212 };

//   Product.findOneAndUpdate(oldProbuct, updateProduct, async () => {
//     try {
//       await oldProbuct.save();
//       console.log("קולולולולולuodate product");
//     } catch (e) {
//       console.log("Error:", e._message);
//     }
//   });
// };
// testt();

app.post("/upload", (req, res) => {
  req.pipe(fs.createWriteStream(`images/${req.query.filename}`));
  res.send("כל הכבוד העלת קובץ ורשמת אותו בתוך תיקיית תמונות");
});

app.use("/images", express.static("images"));
// io.on("connection", (socket) => {
//   console.log("New client connected");
//   socket.on("disconnect", () => {
//     console.log("Client disconnected");
//   });
// });
app.put("/products/addQuantity/:id", (req, res) => {
  const id = +req.params.id;

  fs.readFile(JSON_FILE, (err, data) => {
    let products = JSON.parse(data);
    console.log(req.body);
    let newQuantity = req.body.quantity;
    const productIndex = products.findIndex((product) => product.id === id);
    console.log(productIndex);
    products[productIndex].quantity = newQuantity;

    fs.writeFile(JSON_FILE, JSON.stringify(products), (err) => {
      res.send("YOU SUCCEED!!!");
    });
    io.emit("newQuantity", newQuantity);
  });
});

function connectDB() {
  return mongoose.connect("mongodb://localhost/myShop", {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  });
}

connectDB().then(async () => {
  server.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
  });
});
