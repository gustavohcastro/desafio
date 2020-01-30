//Imports
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const uniqid = require('uniqid');
const validUrl = require('valid-url');
const shortid = require('shortid');

//Models
const URL = require('./models/Urls');

//Database connect
mongoose.connect('mongodb+srv://root:root@cluster0-lvuhh.mongodb.net/shorter?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then( () => console.log("Database connect")).catch( (error)=> console.log(error));


//Start
const app = express();
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());
app.set('view engine', 'ejs')

//Routes
app.get('/', (req, res) => {
    res.render('index')
}) 

app.post('/url', async (req, res) => {
    let url = req.body.url
    if (validUrl.isUri(url)){
        let result = await URL.findOne({url : url},(err, doc) => {
            if (doc) {
                res.send("Entrada já existente");
            }else{
                const shorter = shortid.generate()
                const webaddress =  URL.create({
                    _id: uniqid(),
                    url : url,
                    hash: shorter
                }).then( () =>  res.render('shorter', {shorter}));

            }
        })
    }else{
        return res.status(401).json("URL não aceita")
    }   
})

app.get('/url/:hash', async (req, res) => {
    const url = req.params.hash;
    const longUrl = await URL.findOne({hash: url}).then((result) => {
        res.redirect(result.url)
    })
})



//Port
const port = process.env.PORT || 5000
app.listen(port, () => console.log(`Server Running on port ${port}`))