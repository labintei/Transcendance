// Commentaire

// premiere declaration
var nom = lauranne
// pas d interpretation avec $
// conversion differentre
nom = "1" + 1//donnera "11"
var tab = [1, 2, "labintei"]
tab[0]
// pas de tableau avec d index particulier (a)
var eleve = {
	nom: 'Jean', moyenne: 15
}
eleve.nom

if(condition)
{}
else if(condition)
{}
else

// possibilite de faire des ternaires
(condition )? (si oui):(si non)

for( var i =0; i < 3; i++)
{
	// peut utliser breal
	break
}

var demo = function ()
{

}

var demo = function (a, b)
{
	if(b == undefined)// SI PAS DE VALEUR PAR DEF
}
// pas de valeur par default
//
// valeur peut avoir des valeurs undefined

// fonction annonyme
function ()
{

}

var t = [1,2,3].push("Lo")

// doc mozilla javascript mvn

var a = "labintei"

a.indexOf(2) -> a

// Une variable declarer dans un scope permet de l avoir globalement
//
for ()
{
	d = 4
}

// j aurais acces a d

// DEFINI hors fonction acces globale
var y = 6

var d = function(){
	// aura acces a y
	g = 56
}

// j aurais pas acces a g

var t = 1
var x = 2 
var y = function(){
var t = 65
x = 6
}
// t sera toujours egale a 1
// x sera egale a 6

// Comment creer un objet creer un prototype
//
//
var eleve = {
	moyenne: function() {return 10}
	present: function() {this.nom + "present"}
}

var jean = Object.create(eleve)
jean.nom = "Jean"// prototype

jean.parler = function () {return Salut}

eleve.presenet = function () {return yo}

var Eleve = function (nom){this.nom = nom}

var jean = new Eleve('Jean')

Eleve.protoype.moyenne = function(){return 5}

jean.moyenne = 4// affecte uniquement Jean

String.prototype.lol = "lol"

// public, privee et protegge existe pas

var Session = {

	get : function() : {}
}

// gerer les heritages

var a = function (name){this.name = name}

var b = function(name){a.call(this, name)
this.role = "delegue"}

b.prototype = Object.create(Eleve.prototype)
b.prototype.constructor = b

b.prototype.moyenne = function() {return 8}

// rare a utiliser (en train d etre modifer)

// notion de this
// permet d injecter une valeur (contexte parent)

// on apelle ca une closure
a.prototype.moyenne = function (){
	var i = this
	var b = function (){
		this.nom// ne correspndra apas a.nom
		// this prend le contexte interieur
	}
	return a()
}

// pas de chose pour parcourir un tableau

var tab = [1 ,56 , 4 , 7, 8]

tab.prototype.moyennes = function () {
	var somme = 0
	this.forEach(function (note) {somme += note})

	// autres facon
	this.notes.forEach(function (note, index){somme += this.notes[index]}, this)
}

// pas de notion de namespace

// portee locale variable uniquement dans cette fontoin
(function (){


})

// 













