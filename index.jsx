const { useState, useEffect } = React;

const WIN_PATTERNS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function calculateWinner(board) {
  for (const [a, b, c] of WIN_PATTERNS) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return {
        winner: board[a],
        line: [a, b, c],
      };
    }
  }

  return null;
}

function minimax(board, isMaximizing) {
  const result = calculateWinner(board);

  if (result?.winner === "O") return 1;
  if (result?.winner === "X") return -1;

  if (board.every((cell) => cell !== null)) return 0;

  if (isMaximizing) {
    let best = -Infinity;

    for (let i = 0; i < board.length; i++) {
      if (!board[i]) {
        board[i] = "O";
        best = Math.max(best, minimax(board, false));
        board[i] = null;
      }
    }

    return best;
  }

  let best = Infinity;

  for (let i = 0; i < board.length; i++) {
    if (!board[i]) {
      board[i] = "X";
      best = Math.min(best, minimax(board, true));
      board[i] = null;
    }
  }

  return best;
}

function getBestMove(board, difficulty) {
  const available = board
    .map((cell, index) => (cell === null ? index : null))
    .filter((v) => v !== null);

  if (difficulty === "easy") {
    return available[Math.floor(Math.random() * available.length)];
  }

  if (difficulty === "medium" && Math.random() < 0.4) {
    return available[Math.floor(Math.random() * available.length)];
  }

  let bestScore = -Infinity;
  let move;

  for (let i = 0; i < board.length; i++) {
    if (!board[i]) {
      board[i] = "O";

      const score = minimax(board, false);

      board[i] = null;

      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }

  return move;
}

function Square({ value, onClick, highlight }) {
  return (
    <button
      className={`square ${highlight ? "winner-square" : ""}`}
      onClick={onClick}
    >
      <span className={value === "X" ? "x-color" : "o-color"}>
        {value}
      </span>
    </button>
  );
}

function Game({ singlePlayer, goHome, darkMode, setDarkMode }) {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xNext, setXNext] = useState(true);

  const [difficulty, setDifficulty] = useState("easy");

  const [score, setScore] = useState({
    X: 0,
    O: 0,
    draw: 0,
  });

  const result = calculateWinner(board);

  const winner = result?.winner;

  const winningLine = result?.line || [];

  const isDraw =
    !winner && board.every((cell) => cell !== null);

  useEffect(() => {
    if (
      singlePlayer &&
      !xNext &&
      !winner &&
      !isDraw
    ) {
      const timeout = setTimeout(() => {
        const move = getBestMove(
          [...board],
          difficulty
        );

        if (move !== undefined) {
          handleClick(move);
        }
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [xNext, board]);

  useEffect(() => {
    if (winner) {
      setScore((prev) => ({
        ...prev,
        [winner]: prev[winner] + 1,
      }));
    }

    if (isDraw) {
      setScore((prev) => ({
        ...prev,
        draw: prev.draw + 1,
      }));
    }
  }, [winner, isDraw]);

  function handleClick(index) {
    if (board[index] || winner) return;

    const next = board.slice();

    next[index] = xNext ? "X" : "O";

    setBoard(next);

    setXNext(!xNext);
  }

  function resetGame() {
    setBoard(Array(9).fill(null));
    setXNext(true);
  }

  function resetScore() {
    setScore({
      X: 0,
      O: 0,
      draw: 0,
    });
  }

  let status;

  if (winner) {
    status = `🏆 Winner: ${winner}`;
  } else if (isDraw) {
    status = "🤝 Draw Game";
  } else {
    status = `🎯 Turn: ${xNext ? "X" : "O"}`;
  }

  return (
    <div className={`container ${darkMode ? "dark-theme" : "light-theme"
      }`}>
      <h1>Ultimate Tic Tac Toe</h1>

      <div className="top-controls">
        {singlePlayer && (
          <select
            value={difficulty}
            onChange={(e) =>
              setDifficulty(e.target.value)
            }
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        )}

        <button
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? "🌞 Light" : "🌙 Dark"}
        </button>

        <button onClick={goHome}>
          🏠 Home
        </button>
      </div>

      <div className="scoreboard">
        <div>
          <h2>X</h2>
          <span>{score.X}</span>
        </div>

        <div>
          <h2>Draw</h2>
          <span>{score.draw}</span>
        </div>

        <div>
          <h2>O</h2>
          <span>{score.O}</span>
        </div>
      </div>

      <div className="status">{status}</div>

      <div className="board">
        {board.map((cell, index) => (
          <Square
            key={index}
            value={cell}
            highlight={winningLine.includes(index)}
            onClick={() => handleClick(index)}
          />
        ))}
      </div>

      <div className="buttons">
        <button onClick={resetGame}>
          🔄 New Game
        </button>

        <button onClick={resetScore}>
          🧹 Reset Score
        </button>
      </div>
      <footer className="mt-auto py-4 px-6 text-center">
        <p className="text-xs text-slate-400 dark:text-slate-600">
          © 2026 Ultimate Tic-Tac-Toe Game. All Rights Reserved by{" "}
          <span className="text-brand-500 font-medium">
            Ayush Racherlawar
          </span>
        </p>
      </footer>
    </div>
  );
}

function Home({ startGame }) {
  return (
    <div className="home-screen">
      <h1>Ultimate Tic Tac Toe</h1>

      <p>Choose Your Game Mode</p>

      <div className="home-buttons">
        <button onClick={() => startGame(true)}>
          🤖 Player vs AI
        </button>

        <button onClick={() => startGame(false)}>
          👥 Two Player
        </button>
      </div>
    </div>
  );
}

function App() {
  const [started, setStarted] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const [singlePlayer, setSinglePlayer] =
    useState(true);

  function startGame(ai) {
    setSinglePlayer(ai);
    setStarted(true);
  }

  if (!started) {
    return <Home startGame={startGame} />;
  }

  return (
    <Game
      singlePlayer={singlePlayer}
      goHome={() => setStarted(false)}
      darkMode={darkMode}
      setDarkMode={setDarkMode}
    />
  );
}

ReactDOM.createRoot(
  document.getElementById("root")
).render(<App />);