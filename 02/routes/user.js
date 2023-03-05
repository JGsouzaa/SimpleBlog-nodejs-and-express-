const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
require("../models/user")
const User = mongoose.model("users")
const bcrypt = require("bcryptjs")
const passport = require("passport")

router.get("/register", (req,res) => {
    res.render("users/register")
})

router.post("/register", (req,res) => {
    var errors = []

    if (!req.body.name || typeof req.body.name == undefined || req.body.name == null) {
        errors.push({text: "Nome inválido"})
    }
    if (!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        errors.push({text: "Email inválido"})
    }
    if (!req.body.password || typeof req.body.password == undefined || req.body.password == null) {
        errors.push({text: "Senha inválida"})
    }
    if (req.body.password.length < 4) {
        errors.push({text: "Senha muito curta"})
    }
    if (req.body.password != req.body.password2) {
        errors.push({text: "As senhas não coincidem"})
    }

    if (errors.length > 0) {
        res.render("users/register", {errors: errors})
    }else {
        User.findOne({email: req.body.email}).then((user) => {
            if (user){
                req.flash("error_msg", "Já existe uma conta vinculada à este e-mail no nosso sistema")
                res.redirect("/users/register")
            }else{
                const newUser = new User ({
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password
                })

                bcrypt.genSalt(10,(error,salt) => {
                    bcrypt.hash(newUser.password, salt, (error, hash) => {
                        if(error){
                            req.flash("error_msg", "Houve um erro ao gravar o usuário")
                            console.log("Erro: " + error)
                            res.redirect("/")
                        }

                        newUser.password = hash

                        newUser.save().then(() => {
                            req.flash("success_msg", "Usuário criado com sucesso!")
                            res.redirect("/")
                        }).catch((err) => {
                            req.flash("error_msg", "Houve um erro ao criar o usuário, tente novamente")
                            console.log("Erro: " + err)
                            res.redirect("/users/register")
                        })
                    })
                })
            }
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro")
            console.log("Erro: " + err)
            res.redirect("/")
        })
    }
})

router.get("/login", (req,res) => {
    res.render("users/login")
})

router.post("/login", (req, res, next) => {
    passport.authenticate("local", /*(err,email,info) => {
        console.log("authenticate");
        console.log(err);
        console.log(email);
        console.log(info);
    })*/{
        successRedirect: "/",
        failureRedirect: "/users/login",
        failureFlash: true
    })(req, res, next)
})

router.get("/logout", (req, res, next) => {
    req.logout(function(err) {
        if (err){return next(err)}

        req.flash("success_msg", "Deslogado com sucesso!")
        res.redirect("/")
    })

})

module.exports = router