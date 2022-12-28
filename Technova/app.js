const express= require('express');
const app =express();
const path =require('path');
const mongoose =require('mongoose');
const bcrypt =require('bcrypt');
const bodyparser = require('body-parser');
const User =require(path.resolve('./models/signup'));
mongoose.connect('mongodb://localhost:27017/technova', {useNewUrlParser: true, useUnifiedTopology: true}).then(()=>{
    console.log('connected to db successfully')
})
    .catch(err=>{
        console.log("errorrrrrrrrrrrrr");
        console.log(err);
    })

const {v4 : uuid} = require('uuid');
uuid();

app.set('view engine','ejs');


app.use(express.static('public'));
app.use(bodyparser.urlencoded({extended:false}))
app.use(bodyparser.json())
app.use(express.urlencoded({extended: true}));
app.use(express.json()); //for sending json




app.get('/', (req,res)=>{
    res.render('home');
})
app.get('/home',(req , res)  => {
   res.send("response");
})
app.get('/signup',(req,res)=>{
    res.render('signup');
})
app.get('/dashboard',(req,res)=>{
    res.render('dashboard');
})
app.post('/signup',(req,res)=>{
    res.redirect('dashboard');
})



app.post('/signup', async (req,res)=>{
    const {name, email, password}= req.body;
    console.log(req.body);
    const hash = await bcrypt.hash(password, 12);
    const user =new User ({
        name,
        email,
        password: hash,
    });
    
    await user.save();
    console.log(user);
    res.redirect('dashboard');
})
app.post('/home', (req,res)=>{
    res.send("post request");
})



app.listen(3000, ()=>{
    console.log("Listening on port 3000");
})
