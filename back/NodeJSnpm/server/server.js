// pour lancer un server 
// node server.js
let http = require('http')
let fs = require('fs')

// lire de facon asynchrome fs.ReadFile()
let server = http.createServer()

// premier exemples
/*
server.on('request', (request, response) => {
    fs.readFile('index.html', (err,data) => {
        // readfile 
        if (err) {
            response.writeHead(404)
            response.end("Ce fichier n existe pas")
            throw err}
    response.writeHead(200, {
        'Content-type': 'text/html; charset=utf-8'
    })
    // j aurais besoin d utiliser les file system pour charger la page
    // on peut aussi faire reponse.write(data)
    response.end(data)
    })
}).listen(8080)*/

let url = require('url')

// objets request
// URL ....

// notions d evenements

/*
server.on('request', (request, response) => {

    // incomming messages ET URL

    fs.readFile('index.html', 'utf8', (err, data))// Buffer imformation comme un flux SI PAS ENCODAGE
    response.writeHead(200)
    let i = url.parse(request.url)
    let query = url.parse(request.url, true).query
    if(query.name == undefined)
    {
        response.write('Bonjour anonyme\n')
    }
    else
        response.write('Bonjour ${query.name}')
    console.log(i)
    response.end('By By')
}).listen(8080)
*/


const EventEmitter = require('events')


let ecoute = new EventEmitter()
let o = new EventEmitter()

o.on('a', function(b,c) {
    console.log(b + c)
})

ecoute.on('saute', function () {
    console.log("Lauranne")
})

ecoute.emit('saute')
ecoute.emit('saute')
ecoute.emit('saute')

o.emit('a', "15", "25")

// server est un EventEmitter particulier

let APP = {

    start: function (port) {
        let listener = new EventEmitter()
        let server = http.createServer((request, response) => {
            if(request.url == '/'){
                listener.emit('root', response)
            }
        }).listen(port)

        return listener
    }
}

let app = App.start()

app.on('root', functoin (response){
    response.write("Je suis a la racine")
})



// peut s ecrire de cette facon
//server.listen(8080)// ecoute sur le port 80


// peut faire des erreurs de permissions si pas sudo ...
// Erreur en ernoo

// write heas 
// systeme de listen et d event

