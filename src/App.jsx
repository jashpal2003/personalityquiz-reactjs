import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Question from './components/Question';
import Results from './components/Results';
import UserForm from './components/UserForm';
import { UserProvider } from './components/UserContext';

const questions = [
  {
    question: "What's your favorite color?",
    options: ["Red 🔴", "Blue 🔵", "Green 🟢", "Yellow 🟡"],
  },
  {
    question: "What's your favorite season?",
    options: ["Summer ☀️", "Winter ❄️", "Spring 🌸", "Fall 🍂"],
  },
  {
    question: "What's your preferred environment?",
    options: ["Mountains 🏔️", "Beach 🏖️", "Forest 🌳", "City 🏙️"],
  },
];

const keywords = {
  Fire: "fire",
  Water: "water",
  Earth: "earth",
  Air: "air",
};

const elements = {
  "Red 🔴": "Fire",
  "Blue 🔵": "Water",
  "Green 🟢": "Earth",
  "Yellow 🟡": "Air",
  "Summer ☀️": "Fire",
  "Winter ❄️": "Water",
  "Spring 🌸": "Air",
  "Fall 🍂": "Earth",
  "Mountains 🏔️": "Earth",
  "Beach 🏖️": "Water",
  "Forest 🌳": "Air",
  "City 🏙️": "Fire",
};

function App() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [element, setElement] = useState('');
  const [artwork, setArtwork] = useState(null);

  function handleAnswer(answer) {
    setAnswers([...answers, answer]);
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  }

  function determineElement(answers) {
    const counts = {};
    answers.forEach((answer) => {
      const element = elements[answer];
      counts[element] = (counts[element] || 0) + 1;
    });
    return Object.keys(counts).reduce((a, b) => (counts[a] > counts[b] ? a : b));
  }

  async function fetchArtwork(keyword) {
    try {
      const response = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/search?q=${keyword}&hasImages=true`);
      const data = await response.json();
      if (data.objectIDs && data.objectIDs.length > 0) {
        const objectId = data.objectIDs[Math.floor(Math.random() * data.objectIDs.length)];
        const objectResponse = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectId}`);
        const objectData = await objectResponse.json();
        setArtwork(objectData);
      }
    } catch (error) {
      console.error('Error fetching artwork:', error);
    }
  }

  useEffect(() => {
    if (currentQuestionIndex === questions.length) {
      const selectedElement = determineElement(answers);
      setElement(selectedElement);
      fetchArtwork(keywords[selectedElement]);
    }
  }, [currentQuestionIndex, answers]);

  return (
    <Router>
      <UserProvider>
        <div className="App">
          <Header />
          <Routes>
            <Route path="/" element={<UserForm />} />
            <Route
              path="/quiz"
              element={
                currentQuestionIndex < questions.length ? (
                  <Question
                    question={questions[currentQuestionIndex].question}
                    options={questions[currentQuestionIndex].options}
                    onAnswer={handleAnswer}
                  />
                ) : (
                  <Results element={element} artwork={artwork} />
                )
              }
            />
          </Routes>
        </div>
      </UserProvider>
    </Router>
  );
}

export default App;