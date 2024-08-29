module.exports=isloggedin=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.flash("error","you must be signed in");
        return res.redirect("/")
    }
    next();
}
