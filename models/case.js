const mongoose=require("mongoose");

const caseSchema = new mongoose.Schema({
    caseTitle:{
        type:String,
        // required:true,
    },
    defendentName:{
        type:String,
        // required:true,
    },
    defendentAddress:{
        type:String,
        // required:true,
    },
    dateOfCreation:{
        type:String,
        // required:true,
    },
    crimeType:{
        type:String,
        // required:true,
    },
    committedDate:{
        type:String,
        // required:true,
    },
    committedLocation:{
        type:String,
        // required:true,
    },
    arrestingOfficer:{
        type:String,
        // required:true,
    },
    dateOfArrest:{
        type:String,
        // required:true,
    },
    presidingJudge:{
        type:String,
        // required:true,
    },
    publicProsecutor:{
        type:String,
        // required:true,
    },
    dateOfHearing:{
        type:String,
        // required:true,
    },
    completionDate:{
        type:String,
    },
    CIN:{
        type:String,
    },
    status:{
        type:String,
    },
    breif:{
        type:String,
    },
    currently:{
        type:String,
    },
    assigned:{
        type:String,
        default:"not assigned",
    },
    sessions:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Session'
    }]
})

module.exports=mongoose.model("Case",caseSchema)