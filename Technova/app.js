const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
const bcrypt = require("bcrypt");
const bodyparser = require("body-parser");
const stripe = require('stripe')('sk_test_51MpvIYSGfsQCA0u6MrjpEuXtfXtRq9vfneWLN5zu213MMis5irHo0wnjAE1uQgxWXPTPcBex0LUne9ohSJJATGF400Qrb2hqsS')
const User = require(path.resolve("./models/signup"));
const Ticket = require(path.resolve("./models/tickets"));
let ticket;
let userTicket;
let quantity;
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
app.get("/dashboard", requireLogin, (req, res) => {
  res.render("dashboard");
});

app.get("/login", (req, res) => {
  res.render("login");
});
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    const ValidPassword = await bcrypt.compare(password, user.password);
    if (ValidPassword) {
      req.session.user_id = user._id;
      req.session.name=user.name;
      const id = user.name;
      res.redirect(`/${id}/dashboard`);
    } else {
      res.redirect("/login");
    }
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/login");
  }
});

app.get("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/login");
});

app.get("/:id/dashboard", requireLogin, async (req,res)=>{
    const id = req.params.id;
    const user= await User.findOne({ name:id}).populate("tickets");
    console.log(req.session.user_id);
    console.log(user);
    let booked_tickets =user.tickets;
    if(req.session.user_id ==user._id)
    res.render("dashboard", { user });
    else
    {
      res.send("Permission denied");
    }
});
app.get('/create-checkout-session', requireLogin, (req, res)=>{
  res.render("chekout");
})
const YOUR_DOMAIN = 'http://localhost:3000';
// app.post('/create-checkout-session', requireLogin, async (req, res) => {
//   let success_url;
//   let h;
//   console.log("1");
//   const userName=req.session.name;
//   const session = await stripe.checkout.sessions.create({
//     line_items: [
//       {
//         price_data: {
//           currency: 'inr',
//           product_data: {
//             name: ticket,
//           },
//           unit_amount: 10000,
//         },
//         quantity: quantity,
//       },
//     ],
//     mode: 'payment',
//     success_url: `http://localhost:3000/${userName}/dashboard`,
//     cancel_url: `http://localhost:3000/${userName}/dashboard`,
//   });
//   console.log(h);
//   if(session.url==success_url)
//   {
//     console.log("Helli");
//     const id=req.session.user_id;
//     const user=await User.findOne({id});
//     user.tickets.push(userTicket);
//     userTicket.user.push(user);
//     await userTicket.save();
//     await user.save();
//     res.redirect(`/${userName}/dashboard`);
//   }
//   res.redirect(`/${userName}/dashboard`);
// });
app.post('/create-checkout-session', async (req, res) => {
  const userName=req.session.name;
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'inr',
          product_data: {
            name: 'T-shirt',
          },
          unit_amount: 10000,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `http://localhost:3000/${userName}/dashboard`,
    cancel_url: 'http://localhost:4242/cancel',
  });
      console.log("Helli");
      const id=req.session.user_id;
      const user=await User.findOne({id});
      user.tickets.push(userTicket);
      userTicket.user.push(user);
      await userTicket.save();
      await user.save();

  res.redirect(303, session.url);
});

app.get("/:id/Delete", requireLogin, async(req, res)=>{
  const id=req.params.id;
  console.log(id);
  let user_id= await Ticket.deleteOne({ _id:id});
  const user=req.session.name;
  res.redirect(`/${user}/dashboard`);
});


app.get("/:id/book", requireLogin, async (req,res)=>{
    const id = req.params.id;
    const user= await User.findOne({name: id});
    res.render("ticket", {user});
})

app.post("/:id/book", requireLogin, async(req,res)=>{
    try{
        const id = req.params.id;
        const user= await User.findOne({name: id});
        const {Email, tel, group, country,institute, numberOfTicket, eventname} =req.body;
        const ticket_booked =new Ticket({
            Email,tel,group,country,institute, numberOfTicket, eventname
        });
        userTicket=ticket_booked;
        quantity=numberOfTicket;
        ticket=eventname;
        res.redirect(`/create-checkout-session`)


    }catch (e) {
        req.flash("error", e.message);
        console.log(e);
        res.render("login");
    }

});
app.get("/contact", (req, res)=>{
  res.render("contactUs");
})
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
    // const registeredUser = await User.findOne({ name });
    // res.render("dashboard", { user });
    id = name;
    res.redirect(`/${id}/dashboard`);

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