import { useState } from 'react'
import './App.css'

interface Page {
  text: string;
  imageUrl: string;
  audioUrl: string;
}

const pages: Page[] = [
  {
    text: "Welcome to the artistic reading journey. This is the first page of our immersive book.",
    imageUrl: "/placeholder-painting1.jpg", // Placeholder, replace with actual image
    audioUrl: "/placeholder-sound1.mp3" // Placeholder, replace with actual audio
  },
  {
    text: "As you turn the page, imagine the words coming alive with sounds and visuals.",
    imageUrl: "/placeholder-painting2.jpg",
    audioUrl: "/placeholder-sound2.mp3"
  },
  {
    text: "This is the end of our sample journey. Add more pages as needed.",
    imageUrl: "/placeholder-painting3.jpg",
    audioUrl: "/placeholder-sound3.mp3"
  }
];

function App() {
  const [currentPage, setCurrentPage] = useState(0);

  const nextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const page = pages[currentPage];

  return (
    <div className="book-container">
      <div className="page">
        <img src={page.imageUrl} alt="Artistic painting" className="painting" />
        <p className="text">{page.text}</p>
        <audio controls src={page.audioUrl} className="audio-player">
          Your browser does not support the audio element.
        </audio>
      </div>
      <div className="navigation">
        <button onClick={prevPage} disabled={currentPage === 0}>Previous</button>
        <span>Page {currentPage + 1} of {pages.length}</span>
        <button onClick={nextPage} disabled={currentPage === pages.length - 1}>Next</button>
      </div>
    </div>
  );
}

export default App
