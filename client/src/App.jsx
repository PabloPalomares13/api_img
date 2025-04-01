import React, { useState, useEffect } from 'react';

const apiKey = import.meta.env.VITE_SOME_KEY; // Reemplaza con tu clave de API de Pixabay

const fetchImageTags = async (imageUrl) => {
  const response = await fetch(`https://pixabay.com/api/?key=${apiKey}&image_url=${encodeURIComponent(imageUrl)}`);
  const data = await response.json();
  const tags = data.tags;
  return tags;
};
const App = () => {
  const [images, setImages] = useState([]);
  const [query, setQuery] = useState('');

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
    const response = await fetch('http://localhost:5000/save-image', {
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
  return (

    <div id="pixabayApp" className="bg-gray-100 p-8">
    <h1 className="text-3xl font-bold text-center mb-8">Pixabay Image Search</h1>
  
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
        Search
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
              Save Image
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
  );
};

export default App;