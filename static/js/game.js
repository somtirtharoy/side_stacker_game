class Game {

    constructor(boardLength, boardHeight) {
        this.boardLength = boardLength
        this.boardHeight = boardHeight
        this.boardSize = boardLength*boardHeight
        this.gameBoard = new Array(this.boardSize).fill(-1)

        this.moveCount = 0;
        // this.myturn = true;
    }
    
    // check if the move is valid or not
    valid_move(index) {
        // check if the tile already has a move
        if (this.gameBoard[index] !== -1) { 
            return false 
        }

        // check if the move is the first from the side
        if (index % 7 === 0 || (index+1) % 7 === 0) { 
            return true 
        } else if (this.gameBoard[index-1] === -1 && this.gameBoard[index+1] === -1) {
            // check if the move is on top of another move and not in the middle
            // without any neighboring filled tile
            return false
        }
        return true  
    }

    // function implementing how to make a move on the board
    make_move(index, player){
        // convert index into integer
        index = parseInt(index);
        
        // check if valid move if move is by current player
        if(player === char_choice) {
            if( !this.valid_move(index) ) { 
                alert("Invalid Move!")
                myturn = true
                return false 
            }
        }

        let data = {
            "event": "MOVE",
            "message": {
                "index": index,
                "player": player
            }
        }
        
        if(this.gameBoard[index] == -1){
            this.moveCount++;
            if(player == 'X') {
                this.gameBoard[index] = 1;
            } else if(player == 'O') {
                this.gameBoard[index] = 0;
            } else {
                alert("Invalid character choice");
                return false;
            }
            gameSocket.send(JSON.stringify(data))
        }

        // set the value within the tile div to the player character
        elementArray[index].innerHTML = player;
        
        // check winner
        const win = this.checkWinner(index);
        console.log("Win: ", win)

        // if my turn check if end of game and send data back to backend
        console.log("myturn after checking win", myturn)
        if(myturn){
            console.log("win inside condition", win)
            if(win){
                data = {
                    "event": "END",
                    "message": `${player} is a winner. Play again?`
                }
                gameSocket.send(JSON.stringify(data))
            }
            else if(!win && this.moveCount == 49){
                data = {
                    "event": "END",
                    "message": "It's a draw. Play again?"
                }
                gameSocket.send(JSON.stringify(data))
            }
        }
        myturn = false
    }


    // reset the board to game start state
    reset(){
        this.gameBoard = new Array(this.boardSize).fill(-1)
        this.moveCount = 0;
        myturn = true;
        document.getElementById("alert_move").style.display = 'inline';        
        for (var i = 0; i < elementArray.length; i++){
            elementArray[i].innerHTML = "";
        }
    }

    check_left(index) {
        var row_start_index = (Math.floor(index/this.boardLength))*this.boardLength

        var check_end_index = index - 3
        if (check_end_index < row_start_index) { return false } 
        for (i=index; i>=check_end_index; i--) {
            if(this.gameBoard[i] !== this.gameBoard[index]) { return false}
        }
        
        return true
    }

    check_right(index) {
        var row_end_index = (Math.floor(index/this.boardLength)+1)*this.boardLength - 1

        var check_end_index = index + 3
        if (check_end_index > row_end_index) { return false } 
        for (i=index; i<=check_end_index; i++) {
            if(this.gameBoard[i] !== this.gameBoard[index]) { return false}
        }
        
        return true
    }

    check_top(index) {
        var col_start_index = Math.floor(index/this.boardLength) + (index - (Math.floor(index/this.boardLength))*this.boardLength)
        
        var check_end_index = index - 3*this.boardLength
        if (check_end_index < 0) { return false } 
        for (i=index; i>=check_end_index; i-=this.boardLength) {
            if(this.gameBoard[i] !== this.gameBoard[index]) { return false}
        }
        
        return true
    }

    check_bottom(index) {
        var col_end_index = Math.floor(index/this.boardLength) + (index - (Math.floor(index/this.boardLength))*this.boardLength)
        
        var check_end_index = index + 3*this.boardLength
        if (check_end_index > (this.boardSize-1)) { return false } 
        for (i=index; i<=check_end_index; i+=this.boardLength) {
            if(this.gameBoard[i] !== this.gameBoard[index]) { return false}
        }
        
        return true
    }

    check_left_diag(index) {
        var row_start_index = (Math.floor(index/this.boardLength))*this.boardLength
        
        if ((index - row_start_index < 3) || row_start_index < 3) { return false }
        var check_end_index = index - 3*(this.boardLength+1)
        for (i=index; i>=check_end_index; i-=(this.boardLength+1)) {
            if(this.gameBoard[i] !== this.gameBoard[index]) { return false}
        }

        return true
    }

    check_right_diag(index) {
        var row_start_index = (Math.floor(index/this.boardLength))*this.boardLength
        var row_end_index = (Math.floor(index/this.boardLength)+1)*this.boardLength - 1

        if ((row_end_index - index < 3) || (this.boardHeight - row_start_index - 1) < 3) { return false }
        var check_end_index = index + 3*(this.boardLength+1)
        for (i=index; i<=check_end_index; i+=(this.boardLength+1)) {
            if(this.gameBoard[i] !== this.gameBoard[index]) { return false}
        }

        return true
    }

    // check if there is a winner
    checkWinner(index){
        // let the default result if it is a win or not be false
        let win = false;
        // check if after making the move at the current index 
        // if that has nearby matching neighbors of upto 4 continous tiles:
        // to the left abd to the right
        // towrds top and towards bottom
        // both diagonals

        if ( this.check_left(index) || this.check_right(index) || this.check_top(index) || this.check_bottom(index) || this.check_left_diag(index) || this.check_right_diag(index)) {
            win = true
        }

        return win;
    }

}


//=========================================================================

// fetching the user parameters rendered into the html from the backend
var roomCode = document.getElementById('game_board').getAttribute('room_code');
var char_choice = document.getElementById('game_board').getAttribute('char_choice');

// create the websocket url and connect to it
var connectionString = `ws://${window.location.host}/ws/game/${roomCode}/`;
var gameSocket = new WebSocket(connectionString);

// define myturn that keeps track of whose turn it is now
let myturn = true;

// Create an instance of the Game class
game = new Game(7, 7)

// adding event listeners to the tiles on the board to trigger on user interaction
let elementArray = document.getElementsByClassName('square');
for (var i = 0; i < elementArray.length; i++){
    elementArray[i].addEventListener("click", event=>{
        const index = event.target.getAttribute('data-index');
        if(game.gameBoard[index] == -1){
            if(!myturn){
                alert("Wait for other to place the move")
            }
            else{
                document.getElementById("alert_move").style.display = 'none'; // Hide          
                game.make_move(index, char_choice);
            }
        }
    })
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
                game.reset();
                break;
            case "END":
                alert(message);
                game.reset();
                break;
            case "MOVE":
                if(message["player"] != char_choice){
                    game.make_move(message["index"], message["player"])
                    // elementArray[message["index"]].innerHTML = message["player"];
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
