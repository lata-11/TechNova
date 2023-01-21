const mongoose = require("mongoose");

const TicketSchema = new mongoose.Schema({
  group: {
    type: String,
    required: true,
  },
  numberOfTicket: {
    type: String,
    required: true,
  },
  Email: {
    type: String,
    required: true,
  },
  eventname: {
    type: String,
    required: true,
  },
  tel: {
    type: String,
    required: true,
  },
  institute: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Ticket", TicketSchema);
