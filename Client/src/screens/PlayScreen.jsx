import { useEffect, useState, useRef } from 'react';
import bgimage from '/playscreen_bg.jpg';
import mobilebg from '/playscreen_mobile-bg.png';
import pipeImg from '/playscreen_obstacle.png';

import Bird from './Objects/Bird.jsx';
import Pipe from './Objects/Pipe.jsx';
import PipeBottom from './Objects/PipeBottom.jsx';
import ScoreBoard from './Objects/ScoreBoard.jsx';
import CountDown from './Objects/CountDown.jsx';

const gravity = 5;
const birdWidth = 48;
const birdHeight = 53;
const pipeWidth = 100;

const animalsAndBirds = [
  'Lion',
  'Elephant',
  'Tiger',
  'Giraffe',
  'Zebra',
  'Bear',
  'Kangaroo',
  'Panda',
  'Wolf',
  'Deer',
  'Rabbit',
  'Fox',
  'Hippopotamus',
  'Rhinoceros',
  'Monkey',
  'Dolphin',
  'Whale',
  'Shark',
  'Crocodile',
  'Turtle',
  'Eagle',
  'Parrot',
  'Sparrow',
  'Peacock',
  'Owl',
  'Penguin',
  'Flamingo',
  'Pigeon',
  'Swan',
  'Seagull',
  'Woodpecker',
  'Hummingbird',
  'Kingfisher',
  'Robin',
  'Canary',
  'Hawk',
  'Ostrich',
  'Pelican',
  'Toucan',
  'Vulture',
];

const adjectives = [
  'Brave',
  'Majestic',
  'Ferocious',
  'Tall',
  'Striped',
  'Strong',
  'Agile',
  'Cuddly',
  'Fierce',
  'Graceful',
  'Quick',
  'Sly',
  'Massive',
  'Horned',
  'Curious',
  'Intelligent',
  'Gentle',
  'Powerful',
  'Stealthy',
  'Shelled',
  'Regal',
  'Colorful',
  'Chirpy',
  'Elegant',
  'Nocturnal',
  'Aquatic',
  'Pink',
  'Urban',
  'Serene',
  'Coastal',
  'Persistent',
  'Tiny',
  'Vibrant',
  'Cheerful',
  'Sunny',
  'Sharp-eyed',
  'Flightless',
  'Wide-beaked',
  'Exotic',
  'Scavenging',
];

const getRandomName = () => {
  const randomAdjective =
    adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomAnimalOrBird =
    animalsAndBirds[Math.floor(Math.random() * animalsAndBirds.length)];
  const randomName = randomAdjective + randomAnimalOrBird;
  localStorage.setItem('username', randomName);
  return randomName;
};

const submitScore = async (username, score) => {
  try {
    const rank = -1;
    const data = {
      username,
      score,
      rank,
    };

    const response = await fetch('http://localhost:5000/api/gameusers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to submit game data');
    }

    const result = await response.json();
    console.log(result.message);
  } catch (error) {
    console.error('Error submitting game data:', error);
  }
};

export default function PlayScreen({
  setScreen,
  score,
  setScore,
  bestScore,
  setBestScore,
}) {
  const [birdVelocity, setBirdVelocity] = useState(0);
  const [gravityAcceleration, setGravityAcceleration] = useState(1);
  const [birdAngle, setBirdAngle] = useState(0);

  const [pipes, setPipes] = useState([]);
  const [curr_dimensions, setDimensions] = useState({
    curr_width: window.innerWidth,
    curr_height: window.innerHeight,
  });
  const imageRef = useRef(null);

  const [birdTop, setBirdTop] = useState(window.innerHeight * 0.4);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [count, setCount] = useState(3);

  useEffect(() => {
    setScore(0);
  }, [setScore]);

  useEffect(() => {
    const ReSize = () => {
      setDimensions({
        curr_width: window.innerWidth,
        curr_height: window.innerHeight,
      });
    };
    window.addEventListener('resize', ReSize);
    return () => window.removeEventListener('resize', ReSize);
  }, []);

  useEffect(() => {
    if (count > 0) {
      const countdownInterval = setInterval(() => {
        setCount((prevCountdown) => prevCountdown - 1);
      }, 1000);
      return () => clearInterval(countdownInterval);
    } else {
      setGameStarted(true);
    }
  }, [count]);

  // useEffect(() => {
  //   if (gameStarted && !gameOver) {
  //     const birdVal = setInterval(() => {
  //       setBirdTop((birdTop) => Math.min(birdTop + gravity, window.innerHeight - birdHeight - 70));
  //     }, 27);
  //     return () => clearInterval(birdVal);
  //   }
  // }, [gameStarted, birdTop, gameOver]);

  useEffect(() => {
    if (gameStarted && !gameOver) {
      const birdVal = setInterval(() => {
        setBirdVelocity((prevVelocity) => prevVelocity + gravityAcceleration);
        setBirdTop((prevBirdTop) => {
          const newTop = Math.min(
            prevBirdTop + birdVelocity,
            window.innerHeight - birdHeight - 70
          );
          return newTop;
        });
        setBirdAngle(() => {
          // Calculate the angle based on the velocity
          const angle = Math.min(90, Math.max(-30, birdVelocity * 2)); // Adjust these values as needed
          return angle;
        });
      }, 27);

      return () => clearInterval(birdVal);
    }
  }, [gameStarted, birdVelocity, gravityAcceleration, gameOver]);

  useEffect(() => {
    if (gameStarted && !gameOver) {
      const pipesGenerated = setInterval(() => {
        const heightArray = [400, 150, 300, 250, 200, 350];
        const randomIndex =
          Math.floor(Math.random() * (heightArray.length / 2)) * 2;
        const randomHeight1 = heightArray[randomIndex];
        const randomHeight = heightArray[randomIndex + 1];
        setPipes((prevPipes) => [
          ...prevPipes,
          {
            height: randomHeight,
            height1: randomHeight1,
            x: curr_dimensions.curr_width,
          },
        ]);
      }, 3000);
      return () => clearInterval(pipesGenerated);
    }
  }, [gameStarted, curr_dimensions, gameOver]);

  useEffect(() => {
    if (gameStarted && !gameOver) {
      const movePipes = setInterval(() => {
        setPipes((prevPipes) =>
          prevPipes
            .map((pipe) => ({ ...pipe, x: pipe.x - 5 }))
            .filter((pipe) => pipe.x > -pipeWidth)
        );
      }, 20);
      return () => clearInterval(movePipes);
    }
  }, [gameStarted, gameOver]);

  useEffect(() => {
    if (gameStarted && !gameOver) {
      const checkCollision = () => {
        pipes.forEach((pipe) => {
          const birdLeft = curr_dimensions.curr_width * 0.2;
          const birdRight = birdLeft + birdWidth;
          const birdTopPosition = birdTop;
          const birdBottom = birdTopPosition + birdHeight;

          const pipeLeft = pipe.x;
          const pipeRight = pipe.x + pipeWidth;

          const topPipeBottom = pipe.height - 70;
          const bottomPipeTop = curr_dimensions.curr_height - pipe.height1 - 70;

          if (
            (birdRight > pipeLeft &&
              birdLeft < pipeRight &&
              (birdTopPosition < topPipeBottom - 5 ||
                birdBottom > bottomPipeTop - 5)) ||
            curr_dimensions.curr_height - birdBottom <= 70
          ) {
            setGameOver(true);
            setTimeout(async () => {
              setBestScore(Math.max(score, bestScore));
              const randomName = getRandomName();
              await submitScore(randomName, score);
              setScreen('gameover');
            }, 250);
          }

          pipes.forEach((pipe) => {
            if (pipe.scoreUpdated === undefined) {
              pipe.scoreUpdated = false;
            }

            if (
              !gameOver &&
              birdRight > pipeLeft + 5 &&
              birdLeft < pipeRight + 5 &&
              (birdTopPosition > topPipeBottom || birdBottom < bottomPipeTop)
            ) {
              if (!pipe.scoreUpdated) {
                if (curr_dimensions.curr_width > 640) {
                  setScore((prevScore) => prevScore + 0.5);
                  pipe.scoreUpdated = true;
                } else {
                  setScore((prevScore) => prevScore + 1);
                  pipe.scoreUpdated = true;
                }
              }
            } else if (birdLeft > pipeRight) {
              pipe.scoreUpdated = false;
            }
          });
        });
      };

      const collisionCheckInterval = setInterval(checkCollision, 5);

      return () => clearInterval(collisionCheckInterval);
    }
  }, [gameStarted, birdTop, pipes, curr_dimensions, gameOver]);

  const handleControl = () => {
    if (birdTop > 53 && gameStarted && !gameOver) {
      setBirdTop((birdTop) => birdTop - 70);
    }
  };

  // useEffect(() => {
  //   const handleKeyDown = (event) => {
  //     event.preventDefault();
  //     if (event.key === " " && birdTop > 53 && gameStarted && !gameOver) {
  //       setBirdTop((birdTop) => birdTop - 70);
  //     }
  //   };

  //   document.addEventListener("keydown", handleKeyDown);

  //   return () => {
  //     document.removeEventListener("keydown", handleKeyDown);
  //   };
  // }, [birdTop, gameStarted, gameOver]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      event.preventDefault();
      if (event.key === ' ' && birdTop > 53 && gameStarted && !gameOver) {
        setBirdVelocity(-10); // Set a negative velocity to simulate the jump
        setBirdAngle(-30);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [birdTop, gameStarted, gameOver]);

  return (
    <>
      <div
        className="w-full h-[100vh] flex align-middle justify-center overflow-x-hidden"
        onClick={handleControl}
      >
        <div className="w-full h-[100vh] flex align-middle justify-center relative bg-black">
          <img
            src={curr_dimensions.curr_width > 640 ? bgimage : mobilebg}
            width="100%"
            height="auto"
            id="background"
            ref={imageRef}
            alt="background"
            className="opacity-70"
          />
          {pipes.map((pipe, index) => (
            <Pipe
              key={`top-${index}`}
              x={pipe.x}
              height={pipe.height}
              pipeImg={pipeImg}
              pipeWidth={pipeWidth}
            />
          ))}
          {pipes.map((pipe, index) => (
            <PipeBottom
              key={`bottom-${index}`}
              x={pipe.x}
              height={pipe.height1}
              pipeImg={pipeImg}
              pipeWidth={pipeWidth}
            />
          ))}
          <ScoreBoard score={score} />
          <CountDown count={count} gameStarted={gameStarted} />
          <Bird
            window_width={curr_dimensions.curr_width}
            bird_top={birdTop}
            gameOver={gameOver}
            birdAngle={birdAngle}
          />
        </div>
      </div>
    </>
  );
}
