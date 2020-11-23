 //Módulos
    const express = require('express')
    const app = express()
    const handlebars = require('express-handlebars')
    const bodyParser = require('body-parser')
    const mongoose = require('mongoose')
    const admin = require('./routes/admin')
    const path = require('path')
    const session = require('express-session')
    const flash = require('connect-flash')

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
    res.redirect('/admin')
})
app.use('/admin', admin)

//Outros
const port = 3000
app.listen(port,()=>{
    console.log('Servidor rodando na porta: ' + port)
})