class Game {

    constructor(boardLength, boardHeight) {
        this.boardLength = boardLength
        this.boardHeight = boardHeight
        this.boardSize = boardLength*boardHeight
        this.gameBoard = new Array(this.boardSize).fill(-1)

        this.moveCount = 0
        // contains all the html tile elements 
        this.elementArray = null
        this.addEventListenerToTiles()
    }

    addEventListenerToTiles() {
        // adding event listeners to the tiles on the board to trigger on user interaction
        // except if it is a spectator in which case no listeners need to be added to the tiles for that user
        if (char_choice !== '-') { 
            this.elementArray = document.getElementsByClassName('square')
            for (var i = 0; i < this.elementArray.length; i++){
                this.elementArray[i].addEventListener("click", event=>{
                    const index = event.target.getAttribute('data-index')
                    if(this.gameBoard[index] == -1){
                        if(!myturn){
                            alert("Wait for other to place the move")
                        }
                        else{
                            document.getElementById("alert_move").style.display = 'none' // Remove the alert          
                            this.make_move(index, char_choice)
                        }
                    }
                })
            }
        } else {
            this.elementArray = document.getElementsByClassName('square') 
        }
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
        index = parseInt(index)
        
        // check if the move is valid if move is by current player
        // as move ny the other player is already validated
        if(player === char_choice) {
            if( !this.valid_move(index) ) { 
                alert("Invalid Move!")
                myturn = true
                return false 
            }
        }

        if(this.gameBoard[index] == -1){
            // send move update to backend for boradcasting across the websocket channel
            this.send_board_updates(index, player)

            // update board variable and the html
            this.update_board(index, player)
        }
        
        // check winner
        this.checkWinner(index, player)
        
        // change myturn to false so that other player can play
        myturn = false
    }

    make_spectator_move(index, player) {
        // convert index into integer
        index = parseInt(index)

        // set the value within the tile div to the player character
        this.elementArray[index].innerHTML = player

    }

    update_board(index, player) {
        // set the value within the tile div to the player character
        this.elementArray[index].innerHTML = player
    }

    send_board_updates(index, player) {
        // create the data to be transmitted to the backend via the websocket channel
        var data = {
            "event": "MOVE",
            "message": {
                "index": index,
                "player": player
            }
        }

        // if no move had been made at the index update the 
        // gameBoard variable and the HTML
        this.moveCount++
        if(player == 'X') {
            this.gameBoard[index] = 1
        } else if(player == 'O') {
            this.gameBoard[index] = 0
        } else {
            alert("Invalid character choice")
            return false
        }
        gameSocket.send(JSON.stringify(data))
    }


    // reset the board to game start state
    reset(){
        this.gameBoard = new Array(this.boardSize).fill(-1)
        this.moveCount = 0
        myturn = true
        // endgame = false
        // document.getElementById("alert_move").style.display = 'inline'        
        document.getElementById("alert_move").style.display = 'none' 
        for (var i = 0; i < this.elementArray.length; i++){
            this.elementArray[i].innerHTML = ""
        }
    }

    check_left(index) {
        var row_start_index = (Math.floor(index/this.boardLength))*this.boardLength

        var check_end_index = index - 3
        if (check_end_index < row_start_index) { return false } 
        for (var i=index; i>=check_end_index; i--) {
            if(this.gameBoard[i] !== this.gameBoard[index]) { return false}
        }
        return true
    }

    check_right(index) {
        var row_end_index = (Math.floor(index/this.boardLength)+1)*this.boardLength - 1

        var check_end_index = index + 3
        if (check_end_index > row_end_index) { return false } 
        for (var i=index; i<=check_end_index; i++) {
            if(this.gameBoard[i] !== this.gameBoard[index]) { return false}
        }
        return true
    }

    check_top(index) {
        var col_start_index = Math.floor(index/this.boardLength) + (index - (Math.floor(index/this.boardLength))*this.boardLength)
        
        var check_end_index = index - 3*this.boardLength
        if (check_end_index < 0) { return false } 
        for (var i=index; i>=check_end_index; i-=this.boardLength) {
            if(this.gameBoard[i] !== this.gameBoard[index]) { return false}
        }
        return true

    }

    check_bottom(index) {
        var col_end_index = Math.floor(index/this.boardLength) + (index - (Math.floor(index/this.boardLength))*this.boardLength)
        
        var check_end_index = index + 3*this.boardLength
        if (check_end_index > (this.boardSize-1)) { return false } 
        for (var i=index; i<=check_end_index; i+=this.boardLength) {
            if(this.gameBoard[i] !== this.gameBoard[index]) { return false}
        }
        return true
    }

    check_left_diag_top(index) {
        var row_index = (Math.floor(index/this.boardLength))
        var row_start_index = (Math.floor(index/this.boardLength))*this.boardLength
        
        if ((index - row_start_index < 3) || row_index < 3) { return false }
        var check_end_index = index - 3*(this.boardLength+1)
        for (var i=index; i>=check_end_index; i-=(this.boardLength+1)) {
            if(this.gameBoard[i] !== this.gameBoard[index]) { return false}
        }
        return true
    }

    check_left_diag_bottom(index) {
        var row_index = (Math.floor(index/this.boardLength))

        var row_end_index = (Math.floor(index/this.boardLength)+1)*this.boardLength - 1

        if ((row_end_index - index < 3) || (this.boardHeight - row_index - 1) < 3) { return false }
        var check_end_index = index + 3*(this.boardLength+1)
        for (var i=index; i<=check_end_index; i+=(this.boardLength+1)) {
            if(this.gameBoard[i] !== this.gameBoard[index]) { return false}
        }
        return true
    }

    check_right_diag_top(index) {
        var row_start_index = (Math.floor(index/this.boardLength))*this.boardLength
        var row_end_index = (Math.floor(index/this.boardLength)+1)*this.boardLength - 1

        if ((row_end_index - index < 3) || row_start_index < 3) { return false }
        var check_end_index = index - 3*(this.boardLength-1)
        for (var i=index; i>=check_end_index; i-=(this.boardLength-1)) {
            if(this.gameBoard[i] !== this.gameBoard[index]) { return false}
        }
        return true
    }

    check_right_diag_bottom(index) {
        var row_index = (Math.floor(index/this.boardLength))
        var row_start_index = (Math.floor(index/this.boardLength))*this.boardLength

        if ((index - row_start_index < 3) || (this.boardHeight - row_index - 1) < 3) { return false }
        var check_end_index = index + 3*(this.boardLength-1)
        for (var i=index; i<=check_end_index; i+=(this.boardLength-1)) {
            if(this.gameBoard[i] !== this.gameBoard[index]) { return false}
        }
        return true
    }

    checkWinner(index, player) {
        const win = this.didWin(index) 

        // if my turn check if end of game and send data back to backend
        if(myturn){
            if(win){
                var message = `${player} is a winner.`
                var data = {
                    "event": "END",
                    "message": message
                }
                gameSocket.send(JSON.stringify(data))
            } else if(!win && this.moveCount == 49){
                var message = "It's a draw."
                var data = {
                    "event": "END",
                    "message": message
                }
                gameSocket.send(JSON.stringify(data))
            }
        }

    }

    // check if there is a winner
    didWin(index){
        // let the default result if it is a win or not be false
        var win = false

        // check if after making the move at the current index 
        // if that has nearby matching neighbors of upto 4 continous tiles:
        // to the left abd to the right
        // towards top and towards bottom
        // both diagonals

        if (this.check_left(index) || 
            this.check_right(index) || 
            this.check_top(index) || 
            this.check_bottom(index) || 
            this.check_left_diag_top(index) || 
            this.check_left_diag_bottom(index) || 
            this.check_right_diag_top(index) ||
            this.check_right_diag_bottom(index)
        ){
            win = true
        }

        return win
    }

}

// connect function that helps set up the methods for websocket to receive and transmit data
function connect() {
    // on new connection send start event to the backend
    gameSocket.onopen = function open() {
        console.log('WebSockets connection created.')
        gameSocket.send(JSON.stringify({
            "event": "START",
            "message": ""
        }))
        endgame = false
    }

    // on connection close try to connect after a timeout of 1 second
    gameSocket.onclose = function (e) {
        console.log('Socket is closed. Reconnect will be attempted in 1 second.', e.reason)
        setTimeout(function () {
            connect()
        }, 1000)
    }

    // Sending the info about the room
    gameSocket.onmessage = function (e) {
        var data = JSON.parse(e.data)
        data = data["payload"]
        console.log(data)
        var message = data['message']
        var question = data['question']
        var event = data["event"]
        switch (event) {
            case "START":
                game.reset()
                break
            case "END":
                endgame = true
                if (char_choice === '-') {
                    alert(`${message} Join again?`)
                } else {
                    alert(`${message} ${question}`)
                }
                // setting timeout to allow for the last broadcast of the last move to propagate 
                // before resetting the websocker connection
                setTimeout(function () {
                    gameSocket.onopen()
                }, 1000)
                // resetting the game
                game.reset()
                break
            case "MOVE":
                if(!endgame && message["player"] === '-'){
                    game.make_spectator_move(message["index"], message["player"])
                } else if(!endgame && message["player"] != char_choice){
                    game.make_move(message["index"], message["player"])
                    myturn = true
                    document.getElementById("alert_move").style.display = 'inline'        
                }
                break
            default:
                console.log("No event")
        }
    }

    // call the onopen method when the socket has established connection
    if (gameSocket.readyState == WebSocket.OPEN) {
        gameSocket.onopen()
    }
}


//=========================================================================

// fetching the user parameters rendered into the html from the backend
var roomCode = document.getElementById('game_board').getAttribute('room_code')
var char_choice = document.getElementById('game_board').getAttribute('char_choice')

// create the websocket url and connect to it
var connectionString = `ws://${window.location.host}/ws/game/${roomCode}/`
var gameSocket = new WebSocket(connectionString)

// define myturn that keeps track of whose turn it is now
var myturn = true

var endgame = false

// Create an instance of the Game class
game = new Game(7, 7)

// calling the connect method here for the websocket to start listening for events 
connect()