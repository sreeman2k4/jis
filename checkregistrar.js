module.exports=isregistrar=(req,res,next)=>{
    if(req.user.isRegistrar=="false"){
        return res.redirect("/")
    }
    next();
}