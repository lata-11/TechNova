const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
const bcrypt = require("bcrypt");
const bodyparser = require("body-parser");
const User = require(path.resolve("./models/signup"));
const Ticket = require(path.resolve("./models/tickets"));
mongoose
  .connect("mongodb://localhost:27017/technova", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("connected to db successfully");
  })
  .catch((err) => {
    console.log("errorrrrrrrrrrrrr");
    console.log(err);
  });

const { v4: uuid } = require("uuid");
uuid();

app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); //for sending json
app.use(session({ secret: "dashboardSession" }));
app.use(flash());

const requireLogin = (req, res, next) => {
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  next();
};

app.get("/", (req, res) => {
  res.render("home");
});
app.get("/home", (req, res) => {
  res.render("home");
});
app.get("/signup", (req, res) => {
  res.render("signup");
});
/*app.get("/dashboard", requireLogin, (req, res) => {
  res.render("dashboard");
});*/

app.get("/login", (req, res) => {
  res.render("login");
});
app.post("/login", async (req, res) => {
  try{
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  const ValidPassword = await bcrypt.compare(password, user.password);
  if (ValidPassword) {
    req.session.user_id = user._id;
    const id =user.name;
    res.redirect(`/${id}/dashboard`);
  } else {
    res.redirect("/login");
  }}
  catch (e) {
    req.flash("error", e.message);
    res.redirect("/login");}
});

app.get("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/login");

});
app.get("/:id/dashboard", requireLogin, async (req,res)=>{
    const id = req.params.id;
    const user= await User.findOne({ id});
    res.render("dashboard", { user });
})
app.get("/:id/book", requireLogin, async (req,res)=>{
    const id = req.params.id;
    const user= await User.findOne({ id});
    res.render("ticket", {user});
})

app.post("/:id/book", requireLogin, async(req,res)=>{
    try{
        const id = req.params.id;
        const user= await User.findOne({ id});
        const {Email, tel, group, country,institute} =req.body;
        const ticket_booked =new Ticket({
            Email,tel,group,country,institute
        });
        await ticket_booked.save();
      
        res.redirect(`/${id}/dashboard`,{user})
    }catch (e) {
        req.flash("error", e.message);
        res.render("login");
    }
});

app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hash = await bcrypt.hash(password, 12);
    const user = new User({
      name,
      email,
      password: hash,
    });

    await user.save();
    req.session.user_id = user._id;
    req.flash("success", "Successfully registered");
    res.redirect("dashboard");
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
});
app.post("/home", (req, res) => {
  res.redirect("/home");
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
