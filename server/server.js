const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const axios = require('axios');
const { Schema } = mongoose;
const dotenv = require('dotenv');
const cors = require('cors');


dotenv.config();

// Crear una aplicación Express
const app = express();

// Configuración de middleware
app.use(bodyParser.json());

// Conexión con MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Conectado a MongoDB');
  } catch (error) {
    console.error('Error al conectar con MongoDB:', error);
    process.exit(1);
  }
};
app.use(cors());
app.use(express.json());
// Esquema para la imagen (guardar imagen en formato binario)
const imageSchema = new Schema({
  url: { type: String, required: true },
  image: { type: Buffer, required: true }, // Guardar como binario
  createdAt: { type: Date, default: Date.now },
});

const Image = mongoose.model('Image', imageSchema);

// Ruta para guardar imagen de Pixabay en MongoDB
app.post('/save-image', async (req, res) => {
  const { imageUrl } = req.body;

  try {
    // Descargar la imagen de la URL
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });

    // Crear un nuevo objeto de imagen
    const newImage = new Image({
      url: imageUrl,
      image: Buffer.from(response.data), // Convertir a binario
    });

    // Guardar la imagen en la base de datos
    await newImage.save();

    res.status(200).json({ message: 'Imagen guardada con éxito' });
  } catch (error) {
    console.error('Error al guardar la imagen:', error);
    res.status(500).json({ message: 'Error al guardar la imagen', error });
  }
});

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  connectDB(); // Conectar a MongoDB
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

