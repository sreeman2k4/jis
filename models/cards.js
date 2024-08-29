const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cardSchema = new mongoose.Schema({
    name: {
        type: String,
       // required: true
    },
   cardnumber: {
    type: String,
   // required: true
   },
   expirationdate: {
    type: String,
   // required: true
   },
   cvv:{
    type:String,
   },
   users:[
    {
    type:mongoose.Schema.Types.ObjectId,
     ref:"User",
    }
],
   
});


module.exports = mongoose.model('Card', cardSchema);