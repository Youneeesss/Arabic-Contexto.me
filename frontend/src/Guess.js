import React from "react";

function Guess({ word, score, allScores }) {

  const widthPercentage = (1 - (score / 1000))* 100;


  const yellowColor = score > 800 ? '#f26666' : score > 300 ? '#f7c0b5' : `rgba(255, 255, 0, 1)`;


  const guessStyle = {
    outline: 0,
    margin: '10px 0',
    padding: '15px',
    boxSizing: 'border-box',
    background: `linear-gradient(to right, ${yellowColor} ${widthPercentage}%, #b5e2dc ${widthPercentage}% 100%)`,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    border: score === getMinimumScore() ? "2px solid #000" : "transparent",
    borderRadius: "3px",
  };


  function getMinimumScore() {
    return Math.min(...allScores);
  }

  return (
    <div className="guess" style={guessStyle}>
      <span className="score" style={{fontWeight: 'bold'}}>{score}</span>
      <span className="guess-word" style={{fontWeight: 'bold'}}>{word}</span>
    </div>
  );
}
export default Guess;
