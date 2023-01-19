const mongoose =require('mongoose');
const Ticket = require('./tickets');

const SignupSchema = new mongoose.Schema({
    name: {
        type: String ,
        required: true
    },
    email: {
        type: String ,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    tickets:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Ticket',
        }
    ]
});

module.exports = mongoose.model('User',SignupSchema);