const express = require("express");
const app = express();
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const Post = require("./models/Post");

//config
    //template engine
        app.engine("handlebars", handlebars.engine({defaultLayout:'main', runtimeOptions: {
            allowProtoPropertiesByDefault: true,
            allowProtoMethodsByDefault: true,
        }}));
        app.set('view engine', 'handlebars');
    //Body parser
        app.use(express.urlencoded({extended: false}));
        app.use(express.json());


//Routes
    app.get("/", function(req,res) {
        Post.findAll().then(function (posts) {
            res.render("home", {posts: posts})
        })
    })

    app.get("/cad", function(req,res) {
        res.render("formulario");
    })

    app.post("/add", function(req,res){
        Post.create({
            titulo: req.body.titulo,
            conteudo: req.body.conteudo
        }).then(function () {
            res.redirect("/");
        }).catch(function () {
            res.send("Erro: " + erro)
        })
    })

   app.get("/deletar/:id", function(req,res) {
        Post.destroy({where: {"id": req.params.id}}).then(function () {
            res.send("Post deletado com sucesso!");
        }).catch (function () {
            res.send("Post inexistente");
        })
    })


app.listen(8081, function () {
    console.log("Servidor rodando em http://localhost:8081");
});
//localhost:8081