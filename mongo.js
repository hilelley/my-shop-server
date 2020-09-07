const mongoose = require("mongoose");

function connectDB() {
  return mongoose.connect("mongodb://localhost/test", {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  });
}

connectDB().then((res) => console.log("hello"));
