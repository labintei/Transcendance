console.log('Salut')

a = 42
// permet de recuperer la taille de la fenetre et differents events
function demo() {
	a = "Demo"// A DEFINIT GLOBALEMENT
}


(function (){
	var a = "demo"
})()// function qui s autoexecutei fonction fermer variable pas propger
console.log(window)

console.log(window.a)

window.alert("Hello")// bloque l execution du script


var i = window.prompt("Donnez : ")
console.log(i)
// toutes les variables ecrite se trouve injectes dans windows
//
//
var b = window.confirm("Tu t appelles bien Lauranne ? ")

// execute la fonction toutes les sec
window.setInterval(demo, 1000)// en ms

window.setTimeout(demo, 1000)// execute une fois

t = window.setInterval(demo, 1000)

window.clearInterval(t)

(function(){
	console.log(i)
})(i)

// pop up avec inactivitee
//
//
// deux javasript peuvent se courcicuiter
