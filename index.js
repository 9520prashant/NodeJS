import express from "express";
import path from "path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt, { hash } from "bcrypt"

const app = express();

mongoose
  .connect("mongodb://localhost:27017", {
    dbName: "backend",
  })
  .then((c) => console.log("Data base connected"))
  .catch((e) => console.log(e));

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

const User = mongoose.model("User", userSchema);

app.use(express.static(path.join(path.resolve(), "public")));
app.use(cookieParser());
// console.log(path.join(path.resolve(), "public"));

//Set View Engine
app.set("view engine", "ejs");
// Using Middle Wares
app.use(express.urlencoded({ extended: true }));

const isAuthenicated = async(req, res, next) => {
    
  const { token } = req.cookies;

  if (token) {
    const decoded = jwt.verify(token, "jfsjgsgbfsfhsbdf");
    req.user = await  User.findById(decoded._id)
    next();
  } else {
    res.redirect("/login");
  }
};

app.get("/", isAuthenicated, (req, res) => {
  res.render("logout", {name:req.user.name});
});


app.get("/login", (req,res)=>{
    res.render("login")
})

app.get("/register", (req, res) => {
  res.render("register" );
});

app.post("/login", async(req,res)=>{
    const {email, password} = req.body;
    // console.log(req.body);
    let user = await User.findOne({email})
    if(!user) return res.redirect("/register")

    const isMatch= user.password === password;

    if(!isMatch) return res.render("login", { email, message: "Incorrect Password"});


    const token = jwt.sign({ _id: user._id }, "jfsjgsgbfsfhsbdf");

    res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 60 * 1000),
    });
    res.redirect("/");
})

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  let user = await User.findOne({email});
  if(user){
    return res.redirect("/login");
  }
//   const hashPassword = await bcrypt.hash(password, 10);


  user = await User.create({
    name,
    email,
    password,
    // aise password ko Hash Kar skte hai
    // password:hashPassword,
  });
  const token = jwt.sign({ _id: user._id }, "jfsjgsgbfsfhsbdf");
//   console.log(token);
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 60 * 1000),
  });
  res.redirect("/");
});
app.get("/logout", (req, res) => {
  res.cookie("token", null, {
    httpOnly: null,
    expires: new Date(Date.now()),
  });
  res.redirect("/");
});

app.listen(5000, () => {
  console.log("server is working");
});

//  220538764 form Number
