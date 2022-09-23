let fs = require('fs')

fs.readFile('demo', (err,data) => {
    if (err) throw err
    fs.writeFile('demo_copy', data, (err) => {
        if (err) throw err
        console.log('Le fichier a bien ete copie')
    })
})

let file = 'demo'

let read = fs.createReadStream(file)
// chunk est un buffer

fs.stat(file, (err,stat) => {
    let total = stat.size
    let progress = 0
})

// ecriture plus lent que lecture
// ON Peut creer des pipes

let write = fs.createWriteStream()
let read = fs.createReadStream()

read.on('data', (chunk) => {
    console.log('J ai lu ' + chunk.length)
})

read.on('end', () => {
    console.log("J ai fini de lire le fichier")
})


