import { useEffect, useState } from 'react';
import { gemTypes } from './constants/gems';
import { gameStates } from './constants/game-states';
import './App.css';

export const createBoard = (width, height) => {
  return new Array(height).fill(undefined).map(() => new Array(width).fill(0));
}

export const generateRandomGem = (gemTypes) => {
  const random = Math.floor(Math.random() * gemTypes.length);
  return gemTypes[random];
}

export const populateBoard = (board) => {
  return board.map(rows =>
    rows.map(() => generateRandomGem(gemTypes))
  )
}

export const isMatchingGem = (board, x1, y1, x2, y2) => {
  // handle edges of board
  if (
    x1 < 0 || x1 >= board.length || y1 < 0 || y1 >= board[0].length ||
    x2 < 0 || x2 >= board.length || y2 < 0 || y2 >= board[0].length
  ) {
    return false;
  }

  return board[x1][y1] === board[x2][y2];
}

export const isBoardValid = (board) => {
  // possibly create util function to increase readability
  // check if it is possible to match in a row
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[0].length - 1; j++) {
      if (board[i][j] === board[i][j+1]) {
        const leftPlusOne = isMatchingGem(board, i, j, i, j-2);
        const leftDiagonalUp = isMatchingGem(board, i, j, i-1, j-1);
        const leftDiagonalDown = isMatchingGem(board, i, j, i+1, j-1);
        const rightPlusOne = isMatchingGem(board, i, j+1, i, j+3);;
        const rightDiagonalUp = isMatchingGem(board, i, j+1, i-1, j+2);
        const rightDiagonalDown = isMatchingGem(board, i, j+1, i+1, j+2);
        const hasValidOption = leftPlusOne || leftDiagonalUp || leftDiagonalDown || rightPlusOne || rightDiagonalUp || rightDiagonalDown;
        if (hasValidOption) return true;
      }
    }
  }

  // possibly create util function to increase readability
  // check if it is possible to match in a column
  for (let i = 0; i < board.length - 1; i++) {
    for (let j = 0; j < board[0].length; j++) {
      if (board[i][j] === board[i+1][j]) {
        const upPlusOne = isMatchingGem(board, i, j, i, j-2);
        const upDiagonalRight = isMatchingGem(board, i, j, i-1, j-1);
        const upDiagonalLeft = isMatchingGem(board, i, j, i+1, j-1);
        const downPlusOne = isMatchingGem(board, i, j+1, i, j+3);;
        const downDiagonalRight = isMatchingGem(board, i, j+1, i-1, j+2);
        const downDiagonalLeft = isMatchingGem(board, i, j+1, i+1, j+2);
        const hasValidOption = upPlusOne || upDiagonalRight || upDiagonalLeft || downPlusOne || downDiagonalRight || downDiagonalLeft;
        if (hasValidOption) return true;
      }
    }
  }

  return false;
}

// this function is of O(n) time complexity, which may be okay for instantiation
// but for validity checking throughout the game, we may want to implement a state tracker
export const replaceTriplets = (board) => {
  // check rows
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[0].length - 2; j++) {
      if (board[i][j] === board[i][j+1] && board[i][j] === board[i][j+2]) {
        // replace first of the triplets
        // while also checking the gems immediately before and above it to make sure no new triplets pop up
        let randomGem;
        while (
          !randomGem || randomGem === board[i][j] ||
          (board[i-1] && board[i-1][j] === randomGem) ||
          board[i][j-1] === randomGem
        ) {
          randomGem = generateRandomGem(gemTypes);
        }

        board[i][j] = randomGem
      }
    }
  }

  // check columns
  for (let i = 0; i < board.length - 2; i++) {
    for (let j = 0; j < board[i].length ; j++) {
      if (board[i][j] === board[i+1][j] && board[i][j] === board[i+2][j]) {
        // replace first of the triplets
        // while also checking the gems immediately before and above it to make sure no new triplets pop up
        let randomGem;
        while (
          !randomGem || randomGem === board[i][j] ||
          (board[i-1] && board[i-1][j] === randomGem) ||
          board[i][j-1] === randomGem
        ) {
          randomGem = generateRandomGem(gemTypes);
        }

        board[i][j] = randomGem
      }
    }
  }
}

const App = () => {
  const [isValidBoard, setIsValidBoard] = useState(false);
  const [displayBoard, setDisplayBoard] = useState(createBoard(8, 8));

  // on mount - check if the initial board is valid
  useEffect(() => {
    let currentBoard;

    while (true) {
      if (currentBoard && isBoardValid(currentBoard)) {
        setDisplayBoard(currentBoard);
        setIsValidBoard(true);
        break;
      }

      currentBoard = populateBoard(createBoard(8, 8));
      replaceTriplets(currentBoard);
    }
 

  }, []);

  // everytime board is re-rendered, we want to confirm the player can still make a move
  // `isBoardValid` has a time complexity of O(n), which is okay for small boards
  // at extreme board sizes, we may want to consider managing validity in some sort of state tracker
  useEffect(() => {
    if (!isBoardValid(displayBoard)) {
      setIsValidBoard(false);
    }
  }, [displayBoard])

  return (
    <div className="window">
      <div className="board">
        {isValidBoard ? (
          displayBoard.map((rows, ii) => {
            return (
              <div className="board-row" key={`row-${ii}`}>
                {rows.map((square, jj) => (<div className={`board-column ${square}`} key={`square-${ii}-${jj}`}>
                  {/* <p>{square}</p> */}
                </div>))}
              </div>
            )
          })
        ) : (
          <div>{gameStates.GAME_OVER}</div>
        )}
      </div>
    </div>
  );
}

export default App;
