const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sessionSchema = new mongoose.Schema({
    attendingJudge: {
        type: String,
      //  required: true
    },
   summary: {
    type: String,
  //  required: true
   },
   nextHearingDate: {
    type: String,
  //  required: true
   },
   dateOfCreation:{
    type:String,
    // required:true,
},
   case:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Case'
}]
   
});


module.exports = mongoose.model('Session', sessionSchema);