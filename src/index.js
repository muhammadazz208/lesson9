const express = require("express");
const cors = require("cors");
const path = require("node:path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const app = express();

const usersPath = path.join(__dirname,"../database", "users.json");
const carsPath = path.join(__dirname, "../database","cars.json");

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../assets")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

function readUser() {
  if (!fs.existsSync(usersPath)) {
    fs.writeFileSync(usersPath, JSON.stringify([]));
  }
  const data = fs.readFileSync(usersPath, "utf-8");
  return JSON.parse(data);
}

function writeUser(users) {
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
}

function readCars() {
  if (!fs.existsSync(carsPath)) {
    fs.writeFileSync(carsPath, JSON.stringify([]));
  }
  const data = fs.readFileSync(carsPath, "utf-8");
  return JSON.parse(data);
}

function writeCars(cars) {
  fs.writeFileSync(carsPath, JSON.stringify(cars, null, 2));
}

app.get("/", (req, res) => {
  const users = readUser();
  res.render("index.ejs", { users, currentUser: {} });
});

app.get("/login", (req, res) => {
  res.render("login.ejs", { message: "" });
});

app.get("/register", (req, res) => {
  res.render("register.ejs", { message: "" });
});

app.post("/api/login", (req, res) => {
  const dto = req.body;
  const users = readUser();
  if (!dto.email || !dto.password) {
    return res.render("login.ejs", {
      message: "email and password are required!",
    });
  }
  const foundUser = users.find(
    (user) => user.email === dto.email && user.password === dto.password
  );
  if (foundUser) {
    res.render("cars.ejs", {
      cars: readCars(),
      currentUser: foundUser,
    });
  } else {
    res.render("login.ejs", {
      message: "login or password wrong!",
    });
  }
});

app.post("/api/register", (req, res) => {
  const dto = req.body;
  const users = readUser();
  if (!dto.email || !dto.password || !dto.fullName) {
    return res.render("register.ejs", {
      message: "email, password and fullname are required!",
    });
  }
  const newUser = {
    id: uuidv4(),
    email: dto.email,
    password: dto.password,
    fullName: dto.fullName,
  };
  users.push(newUser);
  writeUser(users);
  res.render("cars.ejs", {
    cars: readCars(),
    currentUser: newUser,
  });
});

app.get("/cars", (req, res) => {
  const cars = readCars();
  const message = "";
  res.render("cars.ejs", { cars, currentUser: null, message });
});

app.post("/api/cars", (req, res) => {
  const dto = req.body;
  const cars = readCars();
  if (!dto.price || !dto.model || !dto.color) {
    const message = "model,price and color are required!";
    return res.render("cars.ejs", { cars, currentUser: null, message });
  }
  const newCar = {
    id: uuidv4(),
    color: dto.color,
    price: dto.price,
    model: dto.model
  };
  cars.push(newCar);
  writeCars(cars);
  res.redirect("/cars");
});

app.listen(7000);
