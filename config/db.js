if(process.env.NODE_ENV == "production"){
    module.exports = {mongoURI:'mongodb://cluster0-shard-00-00.f9ag3.mongodb.net:27017/blogapp'}
}else{
    module.exports = {mongoURI:'mongodb://localhost/blogapp'}
}