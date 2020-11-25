 //Módulos
    const express = require('express')
    const app = express()
    const handlebars = require('express-handlebars')
    const bodyParser = require('body-parser')
    const mongoose = require('mongoose')
    const admin = require('./routes/admin')
    const usuarios = require('./routes/usuario')
    const path = require('path')
    const session = require('express-session')
    const flash = require('connect-flash')
    require('./models/Postagem')
    const Postagem = mongoose.model('postagens')
    require('./models/Categoria')
    const Categoria = mongoose.model('categorias')

//Configurações
    //session
    app.use(session({
        secret: "blogapp-chave",
        resave: true,
        saveUninitialized: true
    }))
    //Middleware
    app.use(flash())
    app.use((req,res,next)=>{
        res.locals.success_msg = req.flash('success_msg')
        res.locals.error_msg = req.flash('error_msg')
        next()
    })
    //handlebars
    app.engine('handlebars', handlebars({
        defaultLayout: 'main',
        runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
        }
    }))
    app.set('view engine', 'handlebars')
    //Mongoose
        mongoose.Promise = global.Promise;
        mongoose.connect("mongodb://localhost/blogapp").then(()=>{
            console.log('Conectado ao mongo')
        }).catch((err)=>{
            console.log('Falha ao se conetar ao mongo' + err)
        })
    //Public
        app.use(express.static(path.join(__dirname,"public"))) 
    //Body-parser
        app.use(bodyParser.urlencoded({extended: false}))
        app.use(bodyParser.json())  

//Rotas
app.get('/', (req,res)=>{
    Postagem.find().populate('categorias').then((postagens)=>{
        res.render('index', {postagens:postagens})
    }).catch((err)=>{
        req.flash('error_msg', 'Houve um erro interno ao carregar as postagens')
    })
})

app.get('/postagens/:slug', (req,res)=>{
    Postagem.findOne({slug: req.params.slug}).then((postagens)=>{
        if(postagens){
            res.render('postagens/index', {postagens: postagens})
        }else{
            req.flash('error_msg', 'Postagem não existe!')
        }
    }).catch((err)=>{
        req.flash('error_msg', 'Houve um erro interno!')
        res.redirect('/')
    })
})

app.get('/categorias', (req,res)=>{
    Categoria.find().then((categorias)=>{
        res.render('categorias/index', {categorias:categorias})
    }).catch((err)=>{
        req.flash('error_msg', 'Houve um erro ao carregar as categorias')
    })
})

app.get('/categorias/:slug', (req,res)=>{
        Categoria.findOne({slug: req.params.slug}).then((categoria)=>{
            if(categoria){
                Postagem.find({categoria: categoria._id}).then((postagens)=>{
                   res.render('categorias/postagens', {categoria: categoria, postagens: postagens}) 
                }).catch((err)=>{
                    req.flash('error_msg', 'Houve um erro ao listar as postagens')
                    res.redirect('/')
                })
            }else{
                req.flash('error_msg', 'Categoria não existe')
                res.redirect('/')
            }
    }).catch((err)=>{
        req.flash('Houve um erro ao listar categorias!')
        res.redirect('/')
    })
})

app.use('/admin', admin)
app.use('/usuarios', usuarios)

//Outros
const port = 3000
app.listen(port,()=>{
    console.log('Servidor rodando na porta: ' + port)
})