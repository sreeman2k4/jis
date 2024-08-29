const express=require("express");
const app=express();
const path=require("path");
const mongoose=require("mongoose");
const ejsmate=require("ejs-mate");
const methodOverride=require("method-override");
const session=require("express-session");
 const Case=require("./models/case.js");
const Trip=require("./models/session.js");
const expresserror=require("./utils/expresserror");
const User=require("./models/users.js");
const Card=require("./models/cards.js");
const passport=require("passport");
const localstrategy=require("passport-local");
const flash=require("connect-flash")
const isloggedin=require("./middleware");
const isregistrar=require("./checkregistrar");
const isLawyer=require("./checklawyer");



app.engine("ejs",ejsmate)
app.set("view engine","ejs")
app.set("views",path.join(__dirname,"views"))
// app.set('view engine', 'your-view-engine')

const sessionconfiguration={
    secret:"its",
    resave:false,
    saveUnitialized:true,
    cookie:{
        httpOnly:true,
        expires: Date.now()+1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }
}

app.use(express.urlencoded({extended: true}))
app.use(methodOverride("_method"));
app.use(session(sessionconfiguration));
app.use(express.static(path.join(__dirname,"public")))
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localstrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req,res,next)=>{
    res.locals.currentuser=req.user;
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    next();
 })

const types=["none","criminal","class action","property disputes","family cases","torts","contract disputes","custody of children","kidnapping","appeals","family law","equitable claims","marraige disolution"];
const options=["none","yes","no"];

mongoose.connect('mongodb://localhost:27017/jis',{useNewUrlParser:true,useUnifiedTopology:true})

 .then(()=>{
    console.log("mongo connection open");
})
.catch(err=>{
    console.log("error");
    console.log(err);
})


app.get("/",(req,res)=>{
    res.render("opens/home.ejs");
})
app.get("/cases/addcase",isloggedin,isregistrar,(req,res)=>{
    const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Month is zero-based, so add 1
        const year = today.getFullYear();
        const formattedDate = `${day}-${month}-${year}`;
    if(req.query)
    {
        const {date}=req.query;
        let query={};
        query.date=date;
        res.render("cases/new.ejs",{types,options,query,formattedDate});
    }else{
        res.render("cases/new.ejs",{types,options,formattedDate});
    }
   
})

app.get("/judgesignin",(req,res)=>{
    res.render("opens/signin.ejs");
})
app.get("/lawyersignin",(req,res)=>{
    res.render("opens/lawyersignin.ejs");
})
app.get("/signup",(req,res)=>{
    res.render("opens/signup.ejs");
})

app.get("/registrarsignin",(req,res)=>{
    res.render("opens/registrarsignin.ejs");
})

app.get("/logout", (req, res) => {
    req.logout(function(err) {
        if (err) {
            // Handle error if logout fails
            console.error(err);
            return next(err);
        }
        // Redirect the user to the home page after successful logout
        res.redirect("/");
    });
});

app.post("/lawyersignin",passport.authenticate("local",{failureFlash:true,failureRedirect:"/lawyersignin"}),async(req,res)=>{
    const user=req.user;
    res.redirect("/cases");
})

app.post("/signin",passport.authenticate("local",{failureFlash:true,failureRedirect:"/judgesignin"}),async(req,res)=>{
    const user=req.user;
    res.redirect("/cases");
})
app.get("/cases/status",isloggedin,async(req,res)=>{
   const data=req.user;
   const user=await data.populate("cases");
   console.log(user);
   const today = new Date();
   today.setHours(0, 0, 0, 0); // Set hours, minutes, seconds, and milliseconds to 0 for comparison with database dates
   const {assigned}=req.query;
   let query={};
   query.assigned=assigned;
   if(req.query)
   {
        if(req.query.assigned=="none")
        {
            const incidents=await Case.find({ dateOfHearing: { $gte: today.toISOString().substring(0, 10) } });
            res.render("cases/status.ejs",{incidents,user});
        }
        else if(req.query.assigned=="assigned"){
            const incidents = await Case.find({ 
                dateOfHearing: { $gte: today.toISOString().substring(0, 10) },
                assigned: "assigned" 
            });
            res.render("cases/status.ejs",{incidents,query,user});
        }
        else{    
        const incidents = await Case.find({ 
            dateOfHearing: { $gte: today.toISOString().substring(0, 10) },
            assigned: "not assigned" 
        });
        res.render("cases/status.ejs",{incidents,query,user});
        }
   }
   else{
    const incidents=await Case.find({ dateOfHearing: { $gte: today.toISOString().substring(0, 10) } });
    res.render("cases/status.ejs",{incidents,user});
   }
    // if(req.query.assigned!="none")
    // { 
    //     const today = new Date();
    //     today.setHours(0, 0, 0, 0); // Set hours, minutes, seconds, and milliseconds to 0 for comparison with database dates
    //     const {assigned}=req.query;
    //     let query={};
    //     query.assigned=assigned;
    //    if(req.query.assigned=="assigned"){
    //     const incidents = await Case.find({ 
    //         dateOfHearing: { $gte: today.toISOString().substring(0, 10) },
    //         assigned: "assigned" 
    //     });
    //     res.render("cases/status.ejs",{incidents,query,user,purchases});
    //    }else{
    //     const today = new Date();
    //     today.setHours(0, 0, 0, 0); // Set hours, minutes, seconds, and milliseconds to 0 for comparison with database dates
    //     // Assuming you have a Mongoose model named ObjectModel
    //     const incidents = await Case.find({ 
    //         dateOfHearing: { $gte: today.toISOString().substring(0, 10) },
    //         assigned: "not assigned" 
    //     });
    //    // const incidents=await Case.find({assigned:"not assigned"})
    //     res.render("cases/status.ejs",{incidents,query,user,purchases});
    //    }
    // }else{   
    // const incidents=await Case.find({ dateOfHearing: { $gte: today.toISOString().substring(0, 10) } });
    // res.render("cases/status.ejs",{incidents,user,purchases});
    // }
})

app.get("/cases/:id/payment",isLawyer,isloggedin,async(req,res)=>{
    const user=req.user;
    const {id}=req.params;
    const incident=await Case.findById(id);
    res.render("payments/payment.ejs",{user,incident});
})

app.post("/cases/:id/payment",async(req,res)=>{
    const card=new Card(req.body);
    const user=req.user;
    const {id}=req.params;
    const incident=await Case.findById(id); 
    user.payments.push(card);
    user.cases.push(incident);
    card.users.push(user);
    user.save();
    card.save();
    res.redirect(`/cases/${id}`);
})

app.get("/cases/:id/assign",isLawyer,isloggedin,async(req,res)=>{
    const user=req.user;
    const {id}=req.params;
    const incident=await Case.findById(id);
    incident.assigned="assigned";
    user.assignedcases.push(incident);
    user.save();
    incident.save();
    res.redirect(`/cases/${id}`);
})

app.post("/cases/addemployee",async(req,res)=>{
   if(req.body.profession=="judge"){
    const {email,password,username,phone,street,city,profession}=req.body;
     const applieduser=new User({username,email,phone,street,city,profession});
     applieduser.isLawyer="false";
     applieduser.isRegistrar="false";
     applieduser.isJudge="true";
    // console.log(applieduser);
     const user=await User.register(applieduser,password)
     //await user.save();
     const currentuser=req.user;
     res.redirect("/cases");
   }else{
    const {email,password,username,phone,street,city,profession}=req.body;
    const applieduser=new User({username,email,phone,street,city,profession});
    applieduser.isLawyer="true";
    applieduser.isRegistrar="false";
    applieduser.isJudge="false";
   // console.log(applieduser);
    const user=await User.register(applieduser,password)
    //await user.save();
    const currentuser=req.user;
    res.redirect("/cases");
   }
    
})


app.get("/cases",isloggedin,async(req,res)=>{
   // const incidents=await Case.find({});
   const user=req.user;
    res.render("cases/show.ejs",{types,options,user});
})
app.get("/profile",isloggedin,(req,res)=>{
    const user=req.user;
    res.render("opens/profile.ejs",{user});
})
app.get("/profile/payments",isloggedin,async(req,res)=>{
    const data=req.user; 
    const user=await data.populate("cases");
   // console.log(user);
    res.render("opens/paidcases.ejs",{user});
})
app.get("/profile/assignedcases",isloggedin,async(req,res)=>{
    const data=req.user; 
    const user=await data.populate("assignedcases");
   // console.log(user);
    res.render("opens/mycases.ejs",{user});
})

app.get("/users/:id",isloggedin,isregistrar,async(req,res)=>{
    const {id}=req.params;
    const user=await User.findById(id);
    res.render("opens/userinfo.ejs",{user});
})
app.get("/users/:id/edit",isloggedin,isregistrar,async(req,res)=>{
    const {id}=req.params;
    const user=await User.findById(id);
    res.render("opens/useredit.ejs",{user});
})
app.put("/users/:id",async(req,res)=>{
    const {id}=req.params;
     const user= await User.findByIdAndUpdate(id,req.body,{runValidators:true,new:true})
     res.redirect(`/users/${id}`);
})



app.delete("/users/:id/delete",async(req,res)=>{
    const {id}=req.params;
    const user=await User.findById(id);
    const result=await User.deleteOne(user);
   // req.flash("success","successfully deleted a movie")
    res.redirect(`/users`)
})

app.get("/users",isloggedin,isregistrar,async(req,res)=>{
    const currentuser=req.user;
    if(req.query)
    { 
        const {username}=req.query;
        let query={};
        query.username=username;
        const users=await User.find(req.query);
        res.render("opens/users.ejs",{users,query,currentuser});
    }else{
    const users=await User.find({});
    res.render("opens/users.ejs",{users,currentuser});
    }
})

app.get("/cases/find",isloggedin,async(req,res)=>{
    if(req.query){
        const data = req.user;
        const user=await data.populate("cases");
       // console.log(purchases);
        const {caseTitle,defendentName,defendentAddress,crimeType,committedDate,commitedLocation,arrestingOfficer,dateOfArrest,dateOfHearing,completionDate,publicProsecutor,presidingJudge,currently}=req.query;
        
        let query = {};
        
        if (caseTitle) {
            query.caseTitle = caseTitle;
        }
        if (currently  && currently!="none") {
            query.currently = currently;
        }
        if (defendentName) {
            query.defendentName =defendentName;
        }
        if (defendentAddress) {
            query.defendentAddress= defendentAddress;
        }
        if (crimeType && crimeType!="none") {
            query.crimeType = crimeType;
        }
        if (commitedLocation) {
            query.commitedLocation = commitedLocation;
        }
        if (committedDate) {
            query.committedDate = committedDate;
        }
        if (arrestingOfficer) {
            query.arrestingOfficer = arrestingOfficer;
        }
        if (dateOfArrest) {
            query.dateOfArrest = dateOfArrest;
        }
        if (dateOfHearing) {
            query.dateOfHearing = dateOfHearing;
        }
        if (completionDate) {
            query.completionDate = completionDate;
        }
        if (publicProsecutor) {
            query.publicProsecutor = publicProsecutor;
        }
        if (presidingJudge) {
            query.presidingJudge = presidingJudge;
        }
        
        // Include remaining query parameters in the query object
        // Object.assign(query, remainingParams);
        
        const incidents = await Case.find(query);
        res.render("cases/filter.ejs", { incidents, types, user,query,options});
        
        
    }else{
        const data=req.user;
       const user=await data.populate("cases");
        const incidents=await Case.find({})
    res.render("cases/filter.ejs",{incidents,types,user,options})
    }
})

app.get("/cases/search",isloggedin,async(req,res)=>{
        const incidents=await Case.find({$or:[{caseTitle:{$regex:req.query.dsearch}},
            {defendentName:{$regex:req.query.dsearch}},
            {defendentAddress:{$regex:req.query.dsearch}},
            {crimeType:{$regex:req.query.dsearch}},
            {commitedLocation:{$regex:req.query.dsearch}},
            {arrestingOfficer:{$regex:req.query.dsearch}},
            {presidingJudge:{$regex:req.query.dsearch}},
            {dateOfArrest:{$regex:req.query.dsearch}},
            {committedDate:{$regex:req.query.dsearch}},
            {dateOfHearing:{$regex:req.query.dsearch}},
            {completionDate:{$regex:req.query.dsearch}},
            {publicProsecutor:{$regex:req.query.dsearch}},
            {CIN:{$regex:req.query.dsearch}},
            {breif:{$regex:req.query.dsearch}},
            {currently:{$regex:req.query.dsearch}},
            {assigned:{$regex:req.query.dsearch}},
            {status:{$regex:req.query.dsearch}}]});
            const data=req.user;
            const user=await data.populate("cases")
        res.render("cases/pending.ejs",{incidents,user});
    
})

app.get("/cases/:id",isloggedin,async(req,res)=>{
    const {id}=req.params;
    const incident=await Case.findById(id).populate("sessions");
    const user=req.user;
    res.render("cases/info.ejs",{incident,user});
})

app.get("/solved",isloggedin,async(req,res)=>{
    const data = req.user;
    const user=await data.populate("cases");
    const incidents = await Case.find({currently:"closed"});
    console.log(incidents);
    res.render("cases/pending.ejs", { incidents,user});
   
})

app.get("/unsolved",isloggedin,async(req,res)=>{
    const data = req.user;
    const user=await data.populate("cases");
    const incidents = await Case.find({currently:"pending"});
    //console.log(incidents);
    res.render("cases/pending.ejs", { incidents,user});
   
})
app.get("/cases/:id/addsession",isloggedin,isregistrar,async(req,res)=>{
    const {id}=req.params;
    const incident=await Case.findById(id);
    const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Month is zero-based, so add 1
        const year = today.getFullYear();
        const formattedDate = `${day}-${month}-${year}`;
    if(req.query)
    {
        const {date}=req.query;
        let query={};
        query.date=date;
        res.render("sessions/new.ejs",{query,incident,formattedDate});
    }else{
        res.render("sessions/new.ejs",{incident,formattedDate});
    }
})


app.get("/cases/addcase/slot", isloggedin,isregistrar,async (req, res) => {
    // const { MongoClient } = require('mongodb');

    // const uri = 'mongodb://localhost:27017';
    // const dbName = 'jis';
    // const collectionName = 'cases';
    try {
        const possibleDates = await findPossibleDatesWithinOneMonth();
        res.render("cases/slot.ejs",{possibleDates});
       // console.log(possibleDates);
        //res.json({ possibleDates });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
    async function isDateInDatabase(date) {
        // const client = new MongoClient(uri);
        //await client.connect();
        // try {
            // const db = client.db(dbName);
            // const collection = db.collection(collectionName);
            const query = { dateOfHearing: date };
            const result = await Case.findOne(query);
            return result !== null;
        // } 
        // finally {
        //     await client.close();
        // }
    }
        
    async function findPossibleDatesWithinOneMonth() {
        const currentDate = new Date();
    
        const endDate = new Date(currentDate);
        endDate.setDate(endDate.getDate() + 30); // Add 30 days to get the end date (1 month from today)
    
        const possibleDates = [];
    
        // Start with today's date
        let dateToCheck = new Date(currentDate);
        
    
        // Loop until we reach the end date
        while (dateToCheck <= endDate) {
            const year = dateToCheck.getFullYear();
            const month = ('0' + (dateToCheck.getMonth() + 1)).slice(-2); // Adding 1 because getMonth() returns zero-based index
            const day = ('0' + dateToCheck.getDate()).slice(-2);

            const formattedDate = `${year}-${month}-${day}`;
            const exists = await isDateInDatabase(formattedDate);
            if (!exists) {
                possibleDates.push(new Date(dateToCheck)); // Add the date to the array if it doesn't exist in the database
            }
            dateToCheck.setDate(dateToCheck.getDate() + 1); // Move to the next date
        }
    
        return possibleDates;
        
    }
        
        
    });

    app.get("/cases/:id/sessionslot",isloggedin,isregistrar, async (req, res) => {
        const {id}=req.params;
        const incident=await Case.findById(id);
        // const { MongoClient } = require('mongodb');
    
        // const uri = 'mongodb://localhost:27017';
        // const dbName = 'jis';
        // const collectionName = 'cases';
        try {
            const possibleDates = await findPossibleDatesWithinOneMonth();
            res.render("cases/sessionslot.ejs",{possibleDates,incident});
           // console.log(possibleDates);
            //res.json({ possibleDates });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
        async function isDateInDatabase(date) {
            // const client = new MongoClient(uri);
            //await client.connect();
            // try {
                // const db = client.db(dbName);
                // const collection = db.collection(collectionName);
                const query = { dateOfHearing: date };
                const result = await Case.findOne(query);
                return result !== null;
            // } 
            // finally {
            //     await client.close();
            // }
        }
            
        async function findPossibleDatesWithinOneMonth() {
            const currentDate = new Date();
        
            const endDate = new Date(currentDate);
            endDate.setDate(endDate.getDate() + 30); // Add 30 days to get the end date (1 month from today)
        
            const possibleDates = [];
        
            // Start with today's date
            let dateToCheck = new Date(currentDate);
            
        
            // Loop until we reach the end date
            while (dateToCheck <= endDate) {
                const year = dateToCheck.getFullYear();
                const month = ('0' + (dateToCheck.getMonth() + 1)).slice(-2); // Adding 1 because getMonth() returns zero-based index
                const day = ('0' + dateToCheck.getDate()).slice(-2);
    
                const formattedDate = `${year}-${month}-${day}`;
                const exists = await isDateInDatabase(formattedDate);
                if (!exists) {
                    possibleDates.push(new Date(dateToCheck)); // Add the date to the array if it doesn't exist in the database
                }
                dateToCheck.setDate(dateToCheck.getDate() + 1); // Move to the next date
            }
        
            return possibleDates;
            
        }
            
            
        });
    



app.post("/cases",async(req,res)=>{
     const incident=new Case(req.body.case);
   
     const user=req.user;
     const committedDate = req.body.case.committedDate;
const dateOfCreation = req.body.case.dateOfCreation;

// Assuming committedDate and dateOfCreation are already defined as strings in the format "yyyy-mm-dd"

const committedDateParts = committedDate.split("-");
const creationDateParts = dateOfCreation.split("-");

const committedYear = parseInt(committedDateParts[0], 10);
const committedMonth = parseInt(committedDateParts[1], 10);
const committedDay = parseInt(committedDateParts[2], 10);

const creationYear = parseInt(creationDateParts[0], 10);
const creationMonth = parseInt(creationDateParts[1], 10);
const creationDay = parseInt(creationDateParts[2], 10);

let faulty = false;

// Compare years
if (committedYear > creationYear) {
    faulty = true;
} else if (committedYear === creationYear) {
    // If years are equal, compare months
    if (committedMonth > creationMonth) {
        faulty = true;
    } else if (committedMonth === creationMonth) {
        // If months are equal, compare days
        if (committedDay > creationDay) {
            faulty = true;
        }
    }
}

console.log("Is faulty:", faulty);

    
    if (faulty)
    {
        res.render("opens/fault.ejs");
    }
     else{
        await incident.save();
        res.redirect("/cases"); 
     }
})

app.post("/cases/:id",async(req,res)=>{
   // console.log(req.body);
    const session=new Trip(req.body);
    const{id}=req.params;
    const incident=await Case.findById(id);
   incident.sessions.push(session);
    await session.save();
    await incident.save();
    const user=req.user;
    res.redirect(`/cases/${incident._id}`);
})

app.put("/cases/:id",async(req,res)=>{
    const {id}=req.params;
    console.log(req.body.case);
   const incident= await Case.findByIdAndUpdate(id,req.body.case,{runValidators:true,new:true});
   //await incident.save();
   console.log(incident);
  // req.flash("success","successfully updated")
  const user=req.user;
    res.redirect(`/cases/${id}`)
})
app.delete("/cases/:id",async(req,res)=>{
    const {id}=req.params;
    const incident=await Case.findById(id);
    const result=await Case.deleteOne(incident);
   // req.flash("success","successfully deleted a movie")
   const user=req.user;
    res.redirect(`/cases`)
})
app.delete("/cases/:id/:sessionid",async(req,res)=>{
    const {id,sessionid}=req.params;
    const incident=await Case.findByIdAndUpdate(id,{$pull:{sessions:sessionid}});
    const session=await Trip.findById(sessionid);
    const result1=await Trip.deleteOne(incident);
   // const incident=await Case.findById(id);
   // req.flash("success","successfully deleted a movie")
   const user=req.user;
    res.redirect(`/cases/${id}`,{user});
})
app.get("/cases/:id/edit",isloggedin,isregistrar,async(req,res)=>{
    const {id}=req.params;
    const incident=await Case.findById(id);
    res.render("cases/update.ejs",{incident,types,options});
})
app.put("/cases/:id/edit/:sessionid",async(req,res)=>{
    const {id,sessionid}=req.params;
    const incident=await Case.findById(id);
    //const session=await Session.findById(sessionid);
    console.log(req.body);
    const session= await Trip.findByIdAndUpdate(sessionid,req.body,{runValidators:true,new:true});
   // incident.sessions.push(session);
    await incident.save();
    await session.save();
    const user=req.user;
    res.redirect(`/cases/${id}`,{user});
})
app.get("/cases/:id/edit/:sessionid",isloggedin,isregistrar,async(req,res)=>{
    const {id,sessionid}=req.params;
    const incident=await Case.findById(id);
    const session=await Trip.findById(sessionid);
    res.render("sessions/edit.ejs",{incident,session});
})

app.all("*",(req,res,next)=>{
    next(new expresserror("page not found",404))
})
app.use((err,req,res,next)=>{
   const {statuscode=500}=err;
    if(!err.message)err.message="oh its wrong"
    const{status=500,message="something went wrong"}=err;
    res.status(status).render("error",{err});
})


app.listen(3000,()=>{
    console.log("jis activated on port 3000")
})

