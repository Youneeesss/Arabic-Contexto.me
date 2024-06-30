import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import Guess from './Guess';
import './App.css';
import { FaAlignJustify, FaQuestionCircle, FaLightbulb, FaFlag, FaHistory, FaCog, FaInfoCircle, FaCommentDots, FaQuestion } from 'react-icons/fa';


Modal.setAppElement('#root');

function App() {
  const [guess, setGuess] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [allScores, setAllScores] = useState([]);
  const [wordOfTheDay, setWordOfTheDay] = useState('');
  const [gameNumber, setGameNumber] = useState(1);
  const [isCorrect, setIsCorrect] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [closestWords, setClosestWords] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [guessedWords, setGuessedWords] = useState(new Set());
  const [howToPlayModalIsOpen, setHowToPlayModalIsOpen] = useState(false);

  useEffect(() => {
    const fetchWordOfTheDay = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/word_of_the_day');
        const data = await response.json();
        setWordOfTheDay(data.word_of_the_day);
      } catch (error) {
        console.error('Failed to fetch the word of the day:', error);
      }
    };

    fetchWordOfTheDay();
  }, []);


  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };


  const addScore = (score) => {
    setAllScores([...allScores, score]);
  };

  const handleInputChange = (event) => {
    setGuess(event.target.value);
  };

  const handleEnterKeyPress = async (event) => {
    if (event.key === 'Enter' && guess.trim() !== '') {
      const arabicRegex = /^[\u0600-\u06FF\s]+$/;

      if (!arabicRegex.test(guess.trim())) {
        alert('يرجى إدخال كلمة عربية صالحة.');
        return;
      }
      // Check for duplicate guess
      if (guessedWords.has(guess.trim())) {
        alert('لقد خمنت هذه الكلمة من قبل.');
        return;
      }
      try {
        console.log('Sending request to calculate similarity...');
        const response = await fetch('http://127.0.0.1:5000/calculate_similarity', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ word1: wordOfTheDay, word2: guess.trim() }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('Received data:', data);
        const score = data.score;
        setGuessedWords(new Set(guessedWords).add(guess));

        const newGuesses = [...guesses, { word: guess, score }].sort((a, b) => a.score - b.score);
        setGuesses(newGuesses);
        addScore(score);
        setGuess('');

        if (guess.trim() === wordOfTheDay) {
          setIsCorrect(true);
          setModalIsOpen(true);
          fetchClosestWords(wordOfTheDay);
        }
      } catch (error) {
        console.error('Failed to fetch:', error);
      }
    }
  };

  const fetchClosestWords = async (word) => {
    try {
      console.log('Fetching closest words...');
      const response = await fetch('http://127.0.0.1:5000/closest_words', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ word }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log('Received closest words:', data);
      setClosestWords(data.closest_words);
    } catch (error) {
      console.error('Failed to fetch closest words:', error);
    }
  };

  const categorizeGuesses = () => {
    const greenGuesses = guesses.filter(g => g.score > 800).length;
    const orangeGuesses = guesses.filter(g => g.score >= 300 && g.score <= 800).length;
    const redGuesses = guesses.filter(g => g.score < 300).length;
    return { greenGuesses, orangeGuesses, redGuesses };
  };

  const { greenGuesses, orangeGuesses, redGuesses } = categorizeGuesses();

  const openHowToPlayModal = () => {
    setHowToPlayModalIsOpen(true);
    setIsMenuOpen(false);

  };
  
  const closeHowToPlayModal = () => {
    setHowToPlayModalIsOpen(false);
  };
  
  return (
    <>
      <div className="wrapper">
        <div className="titleGame">
          <header className="header">
            <h1>كلمتي</h1>
            <div className="menu-container">
              <button className="btn" onClick={toggleMenu}><FaAlignJustify /></button>
              {isMenuOpen && (
                <div className="dropdown-menu">
                  <ul>
                    <li onClick={openHowToPlayModal}> كيف تلعب <FaQuestionCircle /></li>
                    <li> تلميح <FaLightbulb /></li>
                    <li> استسلام <FaFlag /></li>
                    <li>الألعاب السابقة <FaHistory /></li>
                    <li> الإعدادات <FaCog /> </li>
                    <li> اعتمادات <FaInfoCircle /></li>
                    <li> تعليقات <FaCommentDots /></li>
                    <li> الأسئلة الشائعة <FaQuestion /></li>
                  </ul>
                </div>
              )}
            </div>
          </header>
        </div>
        <div className="game-info">
          <span className="game-number">#{gameNumber}</span>
          <span className="game-label">:اللعبة</span>
          <span className="guess-number">{guesses.length}</span>
          <span className="guess-label">:التخمينات</span>
        </div>
        <div className="input-wrapper">
          <input
            type="text"
            id="guess-input"
            placeholder="أدخل تخمينك"
            value={guess}
            onChange={handleInputChange}
            onKeyPress={handleEnterKeyPress}
          />
        </div>
        <div className="guesses" id="guess-list">
          {guesses.map((guess, index) => (
            <Guess key={index} word={guess.word} score={guess.score} allScores={allScores} />
          ))}
        </div>
        <Modal
          isOpen={howToPlayModalIsOpen}
          onRequestClose={closeHowToPlayModal}
          style={{
            content: {
              top: '50%',
              left: '50%',
              right: 'auto',
              bottom: 'auto',
              marginRight: '-50%',
              transform: 'translate(-50%, -50%)',
              padding: '20px',
              textAlign: 'center',
            },
          }}
        >
          <div className="modal-content">
            <h2>كيف تلعب</h2>
            <p>شرح كيفية اللعب هنا...</p>
            <button onClick={closeHowToPlayModal} className="close-button">إغلاق</button>
          </div>
        </Modal>

        <Modal
          isOpen={modalIsOpen}
          onRequestClose={() => setModalIsOpen(false)}
          style={{
            content: {
              top: '50%',
              left: '50%',
              right: 'auto',
              bottom: 'auto',
              marginRight: '-50%',
              transform: 'translate(-50%, -50%)',
              padding: '20px',
              textAlign: 'center',
            },
          }}
        >
          <div className="modal-content">
            <h2>تهانينا!</h2>
            <p>لقد خمنت الكلمة رقم {gameNumber} بنجاح!</p>
            <p>عدد التخمينات: {guesses.length}</p>
            <div className="guesses-summary">
              <div className="guess-category">
                <span className="green-box"></span>
                <span>{greenGuesses}</span>
              </div>
              <div className="guess-category">
                <span className="orange-box"></span>
                <span>{orangeGuesses}</span>
              </div>
              <div className="guess-category">
                <span className="red-box"></span>
                <span>{redGuesses}</span>
              </div>
            </div>
            <h3>الكلمات الأقرب:</h3>
            <ul>
              {closestWords.map((word, index) => (
                <li key={index}>{word}</li>
              ))}
            </ul>
            <button onClick={() => setModalIsOpen(false)} className="close-button">إغلاق</button>
          </div>
        </Modal>
      </div>
    </>
  );
}

export default App;
