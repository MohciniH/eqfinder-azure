const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const dotenv = require('dotenv'); // Ajout de dotenv pour charger les variables d'environnement

dotenv.config(); // Chargement des variables d'environnement à partir du fichier .env

const app = express();
const path = require('path');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Connexion à la base de données
let client;

async function connectDB() {
  try {
    const url = process.env.DB_URI; // Utilisation de la variable d'environnement DB_URI
    client = await MongoClient.connect(url, { useUnifiedTopology: true });
    console.log('Connexion à la base de données réussie');
  } catch (err) {
    console.log('Impossible de se connecter à la base de données :', err);
  }
}

// Middleware pour se connecter à la base de données avant les routes nécessitant une connexion à la base de données
app.use(['/earthquakes', '/earthquakes/:id'], async (req, res, next) => {
  if (!client) {
    await connectDB();
  }
  next();
});

// Route pour récupérer les données des seismes
app.get('/earthquakes', async function(req, res) {
  try {
    const db = client.db('earthquake2023').limit(3);
    console.log('user sur /earthquakes');

    const results = await db.collection('earthquakes').find().toArray();
    res.render('earthquakes', { earthquakes: results });
  } catch (err) {
    console.error(err);
    res.send('Une erreur est survenue.');
  }
});

app.get('/earthquakes/:id', async function(req, res) {
  try {
    const db = client.db('earthquake2023');
    const id = req.params.id;
    console.log('user sur /earthquakes/' + id);

    const result = await db.collection('earthquakes').findOne({ id: id });
    console.log('Données de l\'earthquake transmises à la vue :', result);
    res.render('earthquake_details', { earthquake: result });
  } catch (err) {
    console.error(err);
    res.send('Une erreur est survenue.');
  }
});

app.get('/test', function(req, res) {
    res.send('Ceci est un test');
});
  
app.get('/', function(req, res) {
    console.log('user sur /');
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Utilisation de la base URL à partir du fichier baseUrl.js
const baseUrl = require('./baseUrl');

// Lancement du serveur
app.listen(3000, function() {
  console.log('Le serveur est démarré sur le port 3000');
});
