const mongoose = require('mongoose');
const passportlocalmongoose=require("passport-local-mongoose");

const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema({
    email:{
        type: String,
        //required: true,
        //unique: true
    },
    username: {
        type: String,
       required: true,
       // unique: true
    },
    password:{
        type: String,
        //required: true,
    },
    isRegistrar:{
        type: String,
      //  default: true
    },
    isJudge:{
        type: String,
       // default: false
    },
    isLawyer:{
        type: String,
        //default: false
    },
    phone:{
        type:String,
    },
    street:{
        type:String,
    },
    city:{
        type:String,
    },
    description:{
        type:String,
    },
    due:{
        type:String,
      //  default: 0
    },
    profession:{
        type:String
    },
    skills:{
        type:String
    },
    experience:{
        type:String,
    },
    dateOfCreation:{
        type:String,
    },
    cases:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Case'
    }],
    assignedcases: [{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Case'
    }],
    payments:[
        {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Card",
    }],
})

userSchema.plugin(passportlocalmongoose)

module.exports = mongoose.model('User', userSchema);