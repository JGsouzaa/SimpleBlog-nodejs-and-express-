const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
require("../models/category")
const Category = mongoose.model("category")
require("../models/posts")
const Post = mongoose.model("posts")
const {eAdmin} = require("../helpers/eAdmin")

router.get("/", eAdmin, (req,res) => {
    res.render("admin/index")
})

router.get("/categories", eAdmin, (req,res) => {
    Category.find().sort({date: "desc"}).then((categories) => {
        res.render("admin/categories", {categories: categories})
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as categorias")
        res.redirect("/admin")
    })

})

router.get("/categories/add", eAdmin, (req,res) => {
    res.render("admin/addcategories")
})

router.post("/categories/new", eAdmin, (req,res) => {
    
    var aErros = []

    if (!req.body.name || typeof req.body.name == undefined || req.body.name == null) {
        aErros.push({texto: "Nome inválido"})
    }

    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        aErros.push({texto: "Slug inválido"})
    }

    if (req.body.name.length < 2 ) {
        aErros.push({texto: "Nome da categoria muito pequeno"})
    }

    if (aErros.length > 0) {
        res.render("admin/addcategories", {erros: aErros})
    }else {
        const newCategory = {
            name: req.body.name,
            slug: req.body.slug
        }
    
        new Category(newCategory).save().then(() => {
            req.flash("success_msg", "Categoria criada com sucesso!")
            res.redirect("/admin/categories")
        }).catch((err) => {
            req.flash("erro_msg", "Houve um erro ao salvar a categoria, tente novamente")
            res.redirect("/admin")
        })
    }
})

router.get("/categories/edit/:id", eAdmin, (req,res) => {
    Category.findOne({_id:req.params.id}).then((category) => {
        res.render("admin/editcategories", {category: category})
    }).catch((err) => {
        req.flash("error_msg", "Essa categoria não existe")
        res.redirect("/admin/categories")
    })

})

router.post("/categories/edit", eAdmin, (req,res) => {

    Category.findOne({_id: req.body.id}).then((category) => {
        var aErros = []

        if (!req.body.name || typeof req.body.name == undefined || req.body.name == null) {
            aErros.push({texto: "Nome inválido"})
        }
    
        if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
            aErros.push({texto: "Slug inválido"})
        }
    
        if (req.body.name.length < 2 ) {
            aErros.push({texto: "Nome da categoria muito pequeno"})
        }
    
        if (aErros.length > 0) {
            Category.findOne({_id:req.body.id}).then((category) => {
                res.render("admin/editcategories", {category: category, erros: aErros})
            }).catch((err) => {
                req.flash("error_msg", "Erro ao pegar os dados")
                res.redirect("admin/categories")
            })

        }else {
            category.name = req.body.name
            category.slug = req.body.slug

            category.save().then(() => {
                req.flash("success_msg", "Categoria editada com sucesso!")
                res.redirect("/admin/categories")
            }).catch((err) => {
                req.flash("error_msg", "Houve um erro interno ao salvar a categoria")
                console.log("Erro: " + err)
                res.redirect("/admin/categories")
            })
        }
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao editar a categoria")
        console.log("Erro: " + err)
        res.redirect("/admin/categories")
    })
})

router.post("/categories/delete", eAdmin, (req,res) => {
    Category.remove({_id: req.body.id}).then(() => {
        req.flash("success_msg", "Categoria deletada com sucesso!")
        res.redirect("/admin/categories")
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao deletar")
        console.log("Erro: " + err)
        res.redirect("/admin/categories")
    })
})

router.get("/posts", eAdmin, (req,res) => {
    Post.find().lean().populate("categoria").sort({data: "desc"}).then((posts) => {
        res.render("admin/posts", {posts: posts})
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as postagens")
        console.log("Erro: " + err)
        res.redirect("/admin")
    })

})

router.get("/posts/add", eAdmin, (req,res) => {
    Category.find().then((categories) => {
        res.render("admin/postsadd", {categories: categories})
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulário")
        console.log("Erro: " + err)
        res.redirect("/admin")
    })
})

router.post("/posts/new", eAdmin, (req,res) => {
    var aErros = []
  
    if (!req.body.title || typeof req.body.title == undefined || req.body.title == null) {
        aErros.push({text: "Titúlo inválido"})
    }
    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        aErros.push({text: "Slug inválido"})
    }
    if (!req.body.description || typeof req.body.description == undefined || req.body.description == null) {
        aErros.push({text: "Descrição inválida"})
    }    
    if (!req.body.content || typeof req.body.content == undefined || req.body.content == null) {
        aErros.push({text: "Conteúdo inválido"})
    }
    if (req.body.category == "0") {
        aErros.push({text: "Categoria inválida, registre uma categoria"})
    }
    if (aErros.length > 0) {
        res.render("admin/postsadd", {erros: aErros})
    }else {
        const newPost = {
            titulo: req.body.title,
            descricao: req.body.description,
            conteudo: req.body.content,
            categoria: req.body.category,
            slug: req.body.slug
        }
        new Post(newPost).save().then(() => {
            req.flash("success_msg", "Postagem criada com sucesso!")
            res.redirect("/admin/posts")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao salvar a postagem")
            console.log("Erro: " + err)
            res.redirect("/admin/posts")
        })
    }
})

router.get("/posts/edit/:id", eAdmin, (req,res) => {

    Post.findOne({_id: req.params.id}).then((post) => {
        Category.find().then((categories) => {
            res.render("admin/postsedit", {categories: categories, post: post})
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao listar as categorias")
            console.log("Erro: " + err)
            res.redirect("/admin/posts")
        })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulario de edição")
        console.log("Erro: " + err)
        res.redirect("/admin/posts")
    })
})

router.post("/posts/edit", eAdmin, (req,res) => {
    Post.findOne({_id: req.body.id}).then((post) => {
        post.titulo = req.body.title
        post.slug = req.body.slug
        post.descricao = req.body.description
        post.conteudo = req.body.content
        post.cateogira = req.body.category

        post.save().then(() => {
            req.flash("success_msg", "Postagem editada com sucesso!")
            res.redirect("/admin/posts")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro na edição")
            console.log("Erro: " + err)
            res.redirect("/admin/posts")
        })

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao salvar a edição")
        console.log("Erro: " + err)
        res.redirect("/admin/posts")
    })
})

router.get("/posts/delete/:id", eAdmin, (req,res) => {
    Post.remove({_id: req.params.id}).then(() => {
        req.flash("success_msg", "Postagem deletada com sucesso!")
        res.redirect("/admin/posts")
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao deletar postagem")
        console.log("Erro: " + err)
        res.redirect("/admin/posts")
    })
})

module.exports = router