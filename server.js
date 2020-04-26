'use strict';

require('dotenv').config();

const express = require('express');
const pg = require('pg');
const superagent = ('superagent');
const methodOverride = require('method-override');



var app = express();


const client = new pg.Client(process.env.DATABASE_URL);


app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static('./public'));
app.set('view engine', 'ejs');

const PORT = process.env.PORT || 3000;

app.get('/', heros);
app.post('/fav', fav);
app.get('/save',save);
app.get('/details/:id',detail);
app.put('/update/:id',update);
app.delete('/delete/:id',delete1)





function save(req, res) {
    let theFav = req.body;
    let SQL = 'INSERT INTO digimon (name,img,level) VALUES ($1,$2,$3);'
    let safeValues = [theFav.name,theFav.img,theFav.level];
    client.query(SQL,safeValues)
    .then(results =>{
        res.redirect('/fav');
    })
}

function heros(req, res) {


    let url = 'https://digimon-api.herokuapp.com/api/digimon';

    superagent.get(url)
        .then(data => {
            let allheros = data.array.forEach(val => {
                let hero = new Hero(val)
                return hero;
            });
            res.render('index', { data: allheros })
        })
}
function fav(req, res) {
    
    let SQL = 'SELECT * FROM digimon';
    client.query(SQL)
    .then(results =>{
        res.render('fav',{data:results.rows})
    })

}

function detail(req,res){
    let theId = req.params.id;
    let SQL = 'SELECT * FROM digimon WHERE id = $1;';
    safeId = [theId];
    client.query(SQL,safeId)
    .then(thedetail=>{
        res.render('details',{data:thedetail.rows[0]})
    })
}
function update(req,res){
    theEdit = req.body;
    let SQL = 'UPDATE digimon SET name=$1,img=$2,level=$3 WHERE id=$4;';
    let safeValues = [theEdit.name,theEdit.img,theEdit.level,req.params.id];
    client.query(SQL,safeValues)
    .then(()=>{
        res.redirect(`/details/${req.params.id}`)
    })
}
function delete1(req,res){
    let SQL = 'DELETE FROM digimon WHERE id=$1;'
    let safeId = [req.params.id];
    client.query(SQL,safeId)
    .then(()=>{
        res.redirect(`/fav`);
    })
}


function Hero(data) {
    this.name = data.name;
    this.img = data.img;
    this.level = data.level
}



client.connect()
    .then(() => {
        app.listen(PORT, () => {
            console.log((`lestining on ${PORT}`))
        })
    })
