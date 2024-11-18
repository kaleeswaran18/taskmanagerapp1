const multer=require('multer')

var multistorage=multer.diskStorage({
    destination:(req,file,callback)=>{
     callback(null,'public/images')
    },
    filename:(req,file,callback)=>{
        callback(null,Date.now()+file.originalname)
    }
})
//MULTER FILTER
const multerfilter=(req,file,cb)=>{
    let fileextion=["png","jpg","jpeg","svg"];
    if(fileextion.includes(file.mimetype.split('/')[1])){
cb(null,true)
    }
    else{
        cb(newError("the image was wrong"),false)
    }
}
let upload=multer({
    storage:multistorage,
    fileFilter:multerfilter,
    limits:{
        filesize:1024*1024*5
    }

})

module.exports = upload;