import React, { useState, useEffect } from 'react';

const apiKey = import.meta.env.VITE_SOME_KEY;// clave de API de Pixabay

const backendUrl = import.meta.env.PROD 
  ? import.meta.env.VITE_BACKEND_URL
  : 'http://localhost:5000';

const fetchImageTags = async (imageUrl) => {
  const response = await fetch(`https://pixabay.com/api/?key=${apiKey}&image_url=${encodeURIComponent(imageUrl)}`);
  const data = await response.json();
  const tags = data.tags;
  return tags;
};
const App = () => {
  const [images, setImages] = useState([]);
  const [query, setQuery] = useState('');
  const [savedImages, setSavedImages] = useState([]);

  useEffect(() => {
    fetchDefaultImages();
  }, []);

  // Función para cargar imágenes predeterminadas (paisajes)
  const fetchDefaultImages = async () => {
    const response = await fetch(`https://pixabay.com/api/?key=${apiKey}&q=landscape&image_type=photo`);
    const data = await response.json();
    setImages(data.hits);
  };

  // Función de búsqueda
  const searchImages = async () => {
    if (!query) return;
    const response = await fetch(`https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(query)}&image_type=photo`);
    const data = await response.json();
    const images = data.hits;
    const imagesWithTags = await Promise.all(images.map(async (image) => {
      const tags = await fetchImageTags(image.largeImageURL);
      return { ...image, ...tags };
    }));
    setImages(imagesWithTags);
  };

  async function saveImage(imageUrl) {
    const response = await fetch(`${backendUrl}/save-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl }),
    });
  
    const data = await response.json();
    if (response.ok) {
      console.log('Imagen guardada:', data.message);
      alert( 'Imagen guardada Correctamente');
    } else {
      console.error('Error al guardar la imagen:', data.message);
    }
  }
   const fetchSavedImages = async () => {
     try {
      const response = await fetch(`${backendUrl}/images`);
      if(!response.ok){
        throw new Error('Error al obtener las imagenes');
      }
      const data = await response.json();
      setSavedImages(data);
     } catch (error) {
      console.error('Error al obtener las imagenes:', error);
     }
   }    
  return (

    <div id="pixabayApp" className="bg-gray-100 p-8">
    <h1 className="text-3xl font-bold text-center mb-8">Pixabay Buscador de Imagenes</h1>
  
    <div className="text-center mb-4">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter a keyword..."
        className="border border-gray-300 p-2 w-full sm:w-1/2 mb-4 rounded"
      />
      <button
        onClick={searchImages}
        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
      >
        Buscar
      </button>
    </div>
  
    <div className="gallery grid grid-cols-1 md:grid-cols-2 gap-8 mt-10 mx-auto">
      {images.map((img) => (
        <div key={img.id} className="bg-white rounded-lg p-4 shadow-md flex flex-col items-center">
          <img
            src={img.webformatURL}
            alt={img.tags}
            className="w-full h-96 object-cover rounded-lg"
          />
          <div className="w-full mt-4">
            <div className="flex flex-wrap gap-2">
              {img.tags.split(",").map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 border border-blue-500 text-blue-500 rounded text-xs"
                >
                  {tag.trim()}
                </span>
              ))}
            </div>
            <button
              onClick={() => saveImage(img.webformatURL)}
              className="mt-2 bg-blue-500 text-white py-1 px-4 rounded hover:bg-blue-600 w-full"
            >
              Guardar Imagen
            </button>
          </div>
        </div>
      ))}
    </div>
    <div className="text-center mt-10">
        <button
          onClick={fetchSavedImages}
          className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
        >
          Mostrar Imagenes Guardadas
        </button>
    </div>
    {savedImages.length > 0 && (
        <div className="saved-gallery mt-10">
          <h2 className="text-2xl font-bold text-center mb-4">Imagenes Guardadas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mx-auto">
            {savedImages.map((img) => (
              <div key={img.id} className="bg-white rounded-lg p-4 shadow-md flex flex-col items-center">
                <img
                  src={`data:${img.contentType};base64,${img.imageBase64}`}
                  alt="Saved"
                  className="w-full h-96 object-cover rounded-lg"
                />
              </div>
            ))}
          </div>
        </div>
      )}
  </div>
  );
};

export default App;