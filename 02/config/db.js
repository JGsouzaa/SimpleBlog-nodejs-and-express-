if (process.env.NODE_ENV == "production"){
    module.exports = {mongoURI: "URL DE CONEXAO DO BANCO PRD"}
}else{
    module.exports = {mongoURI: "mongodb://127.0.0.1:27017/blogapp"}
}