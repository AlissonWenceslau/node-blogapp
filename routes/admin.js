const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Categoria')
const Categoria = mongoose.model('categorias')
require('../models/Postagem')
const Postagem = mongoose.model('postagens')

//Redireciona para página principal
router.get('/', (req, res)=>{
    res.render('admin/index')
})

//Carrega a página setada
router.get('/posts', (req, res)=>{
    res.send('Página de posts')
})

//Lista todas as categorias
router.get('/categorias', (req, res)=>{
    Categoria.find().sort({date: 'desc'}).then((categoria)=>{
        res.render('admin/categorias', {categorias: categoria})
    }).catch((err)=>{
        req.flash('error_msg', 'Houve um erro ao listar categorias' + err)
        res.redirect('/admin')
    })
})

//Carrega o fromulário para add categorias
router.get('/categorias/add', (req,res)=>{
    res.render('admin/addcategorias')
})

//Cadastra uma nova categoria
router.post('/categorias/nova', (req, res)=>{
    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: 'Nome inválido'})
    }
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: 'Slug inválido'})
    }

    if(req.body.nome.length < 2){
        erros.push({texto: 'Nome muito pequeno '})
    }
    if(req.body.slug.length < 2){
        erros.push({texto: 'Slug muito pequeno '})
    }

    if(erros.length > 0){
        res.render('admin/addcategorias', {erros: erros})
    }else{
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
    
        new Categoria(novaCategoria).save().then(()=>{
            req.flash('success_msg', 'Categoria salva com sucesso!')
            res.redirect('/admin/categorias')
        }).catch((err)=>{
            console.log('Erro ao cadastrar categoria ' + err)
        })
    }
})

//Carrega o formulário para editar uma categoria
router.get('/categorias/edit/:id', (req,res)=>{
    Categoria.findOne({_id:req.params.id}).then((categoria)=>{
        res.render('admin/editarcategorias', {categoria:categoria})
    }).catch((err)=>{
        req.flash('error_msg', 'Essa categoria não existe')
        res.redirect('/admin/categorias')
    })
})

//Salva a categoria editada
router.post('/categorias/edit', (req,res)=>{

    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: 'Nome inválido'})
    }
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: 'Slug inválido'})
    }

    if(req.body.nome.length < 2){
        erros.push({texto: 'Nome muito pequeno '})
    }
    if(req.body.slug.length < 2){
        erros.push({texto: 'Slug muito pequeno '})
    }
    if(erros.length > 0){
        res.render('admin/addcategorias', {erros: erros})
    }else{
        Categoria.findOne({_id:req.body.id}).then((categoria)=>{
            categoria.nome = req.body.nome
            categoria.slug = req.body.slug

            categoria.save().then(()=>{
                req.flash('success_msg', 'Categoria editada com sucesso!')
                res.redirect('/admin/categorias')
            }).catch((err)=>{
                req.flash('error_msg', 'Houve um erro interno ao salvar a edição' + err)
                res.redirect('/admin/categorias')
            })
        }).catch((erro)=>{
            req.flash('error_msg', 'Houve um erro ao editar a categoria')
            res.redirect('/admin/categorias')
        })
    }
})

//Deleta uma categoria
router.post('/categorias/deletar/:id', (req,res) => {
    Categoria.findOneAndDelete({_id: req.params.id}).then(()=> {
        req.flash('success_msg','Categoria deletada com sucesso')
        res.redirect('/admin/categorias')
    }).catch((err) => {
        req.flash('error_msg','Houve um erro ao deletar a categoria ' + err)
        res.redirect('/admin/categorias')
    })
})

//Lista todas as postagens
router.get('/postagens', (req,res)=>{
    Postagem.find().populate('categoria').sort({data:'desc'}).then((postagens)=>{
        res.render('admin/postagens', {postagens: postagens})
    }).catch((err)=>
    req.flash('error_msg', 'Erro ao carregar as postagens')
    )
})

//Carega o formulário de nova postagem e lista todas as categorias
router.get('/postagens/add', (req,res)=>{
    Categoria.find().then((categorias)=>{
        res.render('admin/addpostagem', {categorias:categorias})
    }).catch((err)=>{
        req.flash('error_msg', 'Houve um erro ao carregar o formulário')
    })
})

//Cadastra uma nova postagem
router.post('/postagem/nova', (req,res)=>{
    var erros = []
    
    if(req.body.categoria == "0"){
        erros.push({texto: "Não há categoria cadastradas"})
    }

    if(erros.length > 0){
        res.render('admin/addpostagem', {erros: erros})
    }else{
        const novaPostagem = {
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
        }

        new Postagem(novaPostagem).save().then(()=>{
            req.flash('success_msg', "Postagem cadastrada com sucesso!")
            res.redirect('/admin/postagens')
        }).catch((err)=>{
            req.flash('error_msg', 'Houve um problema ao cadastrar a postagem!')
            res.redirect('/admin/postagens')
        })
    }
})

//Carrega o formulário para editar uma postagem e sua respectiva categoria
router.get('/postagens/edit/:id', (req,res)=>{
    Postagem.findOne({_id: req.params.id}).then((postagem)=>{
        Categoria.find().then((categorias)=>{
            res.render('admin/editarpostagem', {postagem: postagem, categorias:categorias})
        }).catch((err)=>{
            req.flash('error_msg', 'Houve um erro ao carregar as categorias')
        })
    }).catch((err)=>{
        req.flash('error_msg', 'Houve um erro ao carregar as postagens!')
    })

})

//Salva a postagem editada
router.post('/postagens/edit', (req,res)=>{
    Postagem.findOne({_id:req.body.id}).then((postagem)=>{
        postagem.titulo = req.body.titulo,
        postagem.slug = req.body.slug,
        postagem.descricao = req.body.descricao,
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria

        postagem.save().then(()=>{
            req.flash('success_msg', 'Postagem editada com sucesso')
            res.redirect('/admin/postagens')
        }).catch((err)=>{
            req.flash('error_msg', 'Erro ao salvar a postagem')
            res.redirect('/admin/postagens')
        })
    }).catch((err)=>{
        req.flash('error_msg', 'Houve um erro ao editar as postagens')
    })
})

//Deleta uma postagem
router.get('/postagens/deletar/:id', (req, res)=>{
    Postagem.remove({_id: req.params.id}).then(()=>{
        req.flash('success_msg', 'Postagem deletada com sucesso!')
        res.redirect('/admin/postagens')
    }).catch((err)=>{
        req.flash('error_msg', 'Houve um erro ao deletar a postagem!')
        res.redirect('/admin/postagens')
    })
})
module.exports = router