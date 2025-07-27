const express =require('express');
require('dotenv').config();
const cors=require('cors');
const { dbConnection } = require('./database/config');
const http = require('http');
const { socketConnection } = require('./helpers/socket-io');

const app=express();

app.use(cors());

app.use( express.json() );

dbConnection();

app.use('/ruta/usuarios', require('./routes/usuarios'));
app.use('/ruta/imagenes', require('./routes/imagenes'));
app.use('/ruta/admins', require('./routes/admins'));
app.use('/ruta/clientes', require('./routes/clientes'));
app.use('/ruta/prestadores', require('./routes/prestadores'));

const server = http.createServer(app);
socketConnection(server);

server.listen( process.env.PORT, () =>{
    console.log('Iniciando');
});