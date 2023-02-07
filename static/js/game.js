// TODO: refactor code into a class
// function Game() {

// }

// function Connection() {

// }


// fetching the user parameters rendered into the html from the backend
var roomCode = document.getElementById('game_board').getAttribute('room_code');
var char_choice = document.getElementById('game_board').getAttribute('char_choice');

// create the websocket url and connect to it
var connectionString = `ws://${window.location.host}/ws/game/${roomCode}/`;
var gameSocket = new WebSocket(connectionString);

// define the board and other parameters for game play
var boardLength = 7
var boardHeight = 7
var boardSize = boardLength*boardHeight
var gameBoard = new Array(boardSize).fill(-1)
winIndices = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
]

let moveCount = 0;
let myturn = true;

// adding event listeners to the tiles on the board to trigger on user interaction
let elementArray = document.getElementsByClassName('square');
for (var i = 0; i < elementArray.length; i++){
    elementArray[i].addEventListener("click", event=>{
        const index = event.target.getAttribute('data-index');
        if(gameBoard[index] == -1){
            if(!myturn){
                alert("Wait for other to place the move")
            }
            else{
                myturn = false;
                document.getElementById("alert_move").style.display = 'none'; // Hide          
                make_move(index, char_choice);
            }
        }
    })
}


// function implementing how to make a move on the board
// TODO: check if move is valid

function valid_move(index) {
    // check if the tile already has a move
    if (gameBoard[index] != -1) { return false }

    // check if the move is the first from the side
    if (index % 7 === 0 || (index+1) % 7 === 0) { 
        return true 
    } else if (gameBoard[index-1] === -1 && gameBoard[index+1] === -1) {
        // check if the move is on top of another move and not in the middle
        // without any neighboring filled tile
        // if (!((index - 1) < 0) && Math.floor((index - 1)/7) == Math.floor(index/7) ) {
        return false
    }
    return true  
}

function make_move(index, player){
    // check if valid move
    if( !valid_move(index) ) { return false }

    index = parseInt(index);
    let data = {
        "event": "MOVE",
        "message": {
            "index": index,
            "player": player
        }
    }
    
    if(gameBoard[index] == -1){
        moveCount++;
        if(player == 'X')
            gameBoard[index] = 1;
        else if(player == 'O')
            gameBoard[index] = 0;
        else{
            alert("Invalid character choice");
            return false;
        }
        gameSocket.send(JSON.stringify(data))
    }

    // set the value within the tile div to the player character
    elementArray[index].innerHTML = player;
    
    // check winner
    const win = checkWinner(index);

    // if my turn check if end of game and send data back to backend
    if(myturn){
        if(win){
            data = {
                "event": "END",
                "message": `${player} is a winner. Play again?`
            }
            gameSocket.send(JSON.stringify(data))
        }
        else if(!win && moveCount == 9){
            data = {
                "event": "END",
                "message": "It's a draw. Play again?"
            }
            gameSocket.send(JSON.stringify(data))
        }
    }
}


// reset the board to game start state
function reset(){
    gameBoard = new Array(boardSize).fill(-1)
    moveCount = 0;
    myturn = true;
    document.getElementById("alert_move").style.display = 'inline';        
    for (var i = 0; i < elementArray.length; i++){
        elementArray[i].innerHTML = "";
    }
}

// method checking if theres a match in winning conditions
// const check = (winIndex) => {
//     if (
//       gameBoard[winIndex[0]] !== -1 &&
//       gameBoard[winIndex[0]] === gameBoard[winIndex[1]] &&
//       gameBoard[winIndex[0]] === gameBoard[winIndex[2]]
//     )   return true;
//     return false;
// };

function check_left(index) {
    row_start_index = (Math.floor(index/boardLength))*boardLength

    check_end_index = index - 4
    if (check_end_index < row_start_index) { return false } 
    for (i=index; i>=check_end_index; i--) {
        if(gameBoard[i] !== gameBoard[index]) { return false}
    }
    
    return true
}

function check_right(index) {
    row_end_index = (Math.floor(index/boardLength)+1)*boardLength - 1

    check_end_index = index + 4
    if (check_end_index > row_end_index) { return false } 
    for (i=index; i<=check_end_index; i++) {
        if(gameBoard[i] !== gameBoard[index]) { return false}
    }
    
    return true
}

function check_top(index) {
    col_start_index = Math.floor(index/boardLength) + (index - (Math.floor(index/boardLength))*boardLength)
    
    check_end_index = index - 4*boardLength
    if (check_end_index < 0) { return false } 
    for (i=index; i>=check_end_index; i-=boardLength) {
        if(gameBoard[i] !== gameBoard[index]) { return false}
    }
    
    return true
}

function check_bottom(index) {
    col_end_index = Math.floor(index/boardLength) + (index - (Math.floor(index/boardLength))*boardLength)
    
    check_end_index = index + 4*boardLength
    if (check_end_index > (boardSize-1)) { return false } 
    for (i=index; i<=check_end_index; i+=boardLength) {
        if(gameBoard[i] !== gameBoard[index]) { return false}
    }
    
    return true
}

function check_left_diag(index) {
    row_start_index = (Math.floor(index/boardLength))*boardLength
    
    if ((index - row_start_index < 4) || row_start_index < 4) { return false }
    check_end_index = index - 4*(boardLength+1)
    for (i=index; i>=check_end_index; i-=(boardLength+1)) {
        if(gameBoard[i] !== gameBoard[index]) { return false}
    }

    return true
}

function check_right_diag(index) {
    row_start_index = (Math.floor(index/boardLength))*boardLength
    row_end_index = (Math.floor(index/boardLength)+1)*boardLength - 1

    if ((row_end_index - index < 4) || (boardHeight - row_start_index - 1) < 4) { return false }
    check_end_index = index + 4*(boardLength+1)
    for (i=index; i<=check_end_index; i+=(boardLength+1)) {
        if(gameBoard[i] !== gameBoard[index]) { return false}
    }

    return true
}

// check if there is a winner
function checkWinner(index){
    let win = false;
    // check if after making the move at the current index 
    // if that has nearby matching neighbors of upto 4 continous tiles:
    // left to right
    // top to bottom
    // diagonally
    // when the element is the last
    // when the element is third
    // when the element is second

    // if (index % 7 === 0) { 
    //     // check up, down, diagonal up right, diagonal down right
    // }

    // if ((index+1) % 7 === 0) {
    //     // check up, down, diagonal up left, diagonal down left
    // }

    // for all other places
    if ( check_left(index) || check_right(index) || check_top(index) || check_bottom(index) || check_left_diag(index) || check_right_diag(index)) {
        win = true
    }

    return win;
}


// connect function that helps set up the methods for websocket to receive and transmit data
function connect() {
    // on new connection send start event to the backend
    gameSocket.onopen = function open() {
        console.log('WebSockets connection created.');
        gameSocket.send(JSON.stringify({
            "event": "START",
            "message": ""
        }));
    };

    // on connection close try to connect after a timeout of 1 second
    gameSocket.onclose = function (e) {
        console.log('Socket is closed. Reconnect will be attempted in 1 second.', e.reason);
        setTimeout(function () {
            connect();
        }, 1000);
    };

    // Sending the info about the room
    gameSocket.onmessage = function (e) {
        let data = JSON.parse(e.data);
        data = data["payload"];
        let message = data['message'];
        let event = data["event"];
        switch (event) {
            case "START":
                reset();
                break;
            case "END":
                alert(message);
                reset();
                break;
            case "MOVE":
                if(message["player"] != char_choice){
                    make_move(message["index"], message["player"])
                    myturn = true;
                    document.getElementById("alert_move").style.display = 'inline';        
                }
                break;
            default:
                console.log("No event")
        }
    };

    // call the onopen method when the socket has established connection
    if (gameSocket.readyState == WebSocket.OPEN) {
        gameSocket.onopen();
    }
}

// calling the connect method here
connect();
