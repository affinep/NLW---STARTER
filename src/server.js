const express = require("express")
const server = express()

//Pegar o Banco de Dados
const db = require("./database/db")

//Configurar pasta pública
server.use(express.static("public"))

//Habilitar o uso do req.body na nossa aplicação
server.use(express.urlencoded({ extended: true}))

//Utilizando Template Engine
const nunjucks = require("nunjucks")
nunjucks.configure("src/views", {
    express: server,
    noCache: true
})

//Configurar caminhos da aplicação | ROTAS
//Página Inicial
//req = Requisição
//res = Resposta
server.get("/", (req, res) => {
    return res.render("index.html", { title: "Seu marketplace de coleta de resíduos" })
})

server.get("/create-point", (req, res) => {

    //req.query: Query strings da nossa URL
    //console.log(req.query)

    return res.render("create-point.html")
})

server.post("/savepoint", (req, res) => {
    
    //req.body: O corpo no nosso formulário
    //console.log(req.body)

    //Inserir dados no Banco de Dados
    const query = `
        INSERT INTO places (
            name,
            image,
            address,
            address2,
            state,
            city,
            items
        ) VALUES (?,?,?,?,?,?,?);
    `
    const values = [
        req.body.name,
        req.body.image,
        req.body.address,
        req.body.address2,
        req.body.state,
        req.body.city,
        req.body.items
    ]

    function afterInsertData(err) {
        if(err){
            console.log(err)
            return res.send("Erro no cadastro!")
        }
        
        console.log("Cadastrado com sucesso")
        console.log(this)

        return res.render("create-point.html", { saved: true })
    }

    db.run(query, values, afterInsertData) 

})

server.get("/search", (req, res) => {

    const search = req.query.search

    if (search == ""){
        //Pesquisa vazia
        return res.render("search-results.html", { total: 0 })
    }

    //Pegar os dados dos Bancos de Dados
    db.all(`SELECT * FROM places WHERE city LIKE '%${search}%'`, function (err, rows) {
        if (err) {
            return console.log(err)
        }

        const total = rows.length

        //Mostrar a página HTML com os dados do Banco de Dados
        return res.render("search-results.html", { places: rows, total })

    })

})

//Ligar o servidor
server.listen(3000)