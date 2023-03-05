//Loading modules
const express = require("express")
const handlebars = require("express-handlebars")
const bodyParser = require("body-parser")
const app = express()
const admin = require("./routes/admin")
const path = require("path")
const { default: mongoose } = require("mongoose")
const session = require("express-session")
const flash = require("connect-flash")
const { post } = require("./routes/admin")
require("./models/posts")
const Posts = mongoose.model("posts")
require("./models/category")
const Category = mongoose.model("category")
//const mongoose = require("mongoose")
const users = require("./routes/user")
const passport = require("passport")
require("./config/auth")(passport)
const db = require("./config/db")

//Configs
    //Sessao
    app.use(session({
        secret: "secretbemsegura",
        resave: true,
        saveUninitialized: true
    }))
    app.use(passport.initialize())
    app.use(passport.session())
    app.use(flash())
    //Middleware
    app.use((req,res,next) => {
        res.locals.success_msg = req.flash("success_msg")
        res.locals.error_msg = req.flash("error_msg")
        res.locals.error = req.flash("error")
        res.locals.user = req.user || null;
        next()
    })
    //Body-parser
    app.use(bodyParser.urlencoded({extended: true}))
    app.use(bodyParser.json())
    //Handlebars
    app.engine("handlebars", handlebars.engine({defaultLayout:'main', runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    }}));
    app.set('view engine', 'handlebars');
    //Mongoose
    mongoose.Promise = global.Promise;
    mongoose.connect(db.mongoURI).then(() => {
        console.log("Conectado ao mongo")
    }).catch((err) => {
        console.log("Erro ao se conectar: " + err)
    })
    //Public
    app.use(express.static(path.join(__dirname, "public")))

    app.use((req,res,next) => {
        next()
    })
//Routes
    app.get("/", (req,res) => {
        Posts.find().populate("categoria").sort({data: "desc"}).then((posts) => {
            res.render("index", {posts: posts})
        }).catch((err) => {
            req.flash("error_msg", "Houve erro interno")
            console.log("Erro: " + err)
            res.redirect("/404")
        })

    })

    app.get("/posts/:slug", (req,res) =>{
        Posts.findOne({slug: req.params.slug}).then((post) => {
            if(post) {
                res.render("posts/index", {post: post})
            }else{
                req.flash("error_msg", "Essa postagem não existe")
                res.redirect("/")
            }
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro")
            console.log("Erro: " + err)
            res.redirect("/")
        })
    })

    app.get("/categories", (req,res) => {
        Category.find().then((categories) => {
            res.render("categories/index", {categories: categories})
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao listar as categorias")
            console.log("Erro: " + err)
            res.redirect("/")
        })
    })

    app.get("/categories/:slug", (req,res) => {
        Category.findOne({slug: req.params.slug}).then((category) => {
            if(category) {
                Posts.find({category: category._id}).then((posts) => {
                    res.render("categories/posts", {posts: posts, category: category})
                }).catch((err) => {
                    req.flash("error_msg", "Houve um erro ao listar os posts")
                    console.log("Erro: " + err)
                    res.redirect("/")
                })
            }else {
                req.flash("error_msg", "Esta categoria não existe")
                res.redirect("/")
            }
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao carregar a página desta categoria")
            console.log("Erro: " + err)
            res.redirect("/")
        })
    })

    app.get("/404", (req,res) => {
        res.send("Erro 404")
    })
    app.use("/admin", admin)
    app.use("/users", users)

//Others
const PORT = process.env.PORT || 8082
app.listen(PORT, () => {
    console.log("Servidor rodando!")
})