module.exports=isLawyer=(req,res,next)=>{
    if(req.user.isLawyer=="false"){
        return res.redirect("/")
    }
    next();
}