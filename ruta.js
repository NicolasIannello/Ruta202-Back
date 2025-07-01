const express =require('express');
require('dotenv').config();
const cors=require('cors');
const { dbConnection } = require('./database/config');
const http = require('http');

const app=express();

app.use(cors());

app.use( express.json() );

dbConnection();

app.use('/ruta/usuarios', require('./routes/usuarios'));

const server = http.createServer(app);

server.listen( process.env.PORT, () =>{
    console.log('Iniciando');
});