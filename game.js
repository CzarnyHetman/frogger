const WIDTH = 9;
const HEIGHT = 10;
var TIMER_ID;
var leftMovingObjects = []; 
var rightMovingObjects = [];
var playerObject;
var secondsLeft = 15;

const initGameBoard = (gameBoard ,width, height) => {
    for(var h = 0; h < height; h++){
        var row = document.createElement('div');
        row.className = 'row';
        gameBoard.appendChild(row);
        for(var w = 0; w < width; w++){
            var cell = document.createElement('div');
            cell.className = 'cell'
            cell.setAttribute('W', w);
            cell.setAttribute('H', h);

            row.appendChild(cell);
        }
    }
}

const isMovePossible = (x, y, dx, dy) => {
    if(x + dx >= WIDTH || x + dx < 0) return false;
    if(y + dy >= HEIGHT || y + dy < 0) return false;
    return true;
}

var Element = function(type, x, y){
    this.type = type,
    this.x = x,
    this.y = y,
    this.getGridCell = () => {
        return document.querySelector(`div[w='${this.x}'][h='${this.y}']`);
    }
    this.render = () => {
        this.getGridCell().classList.add(this.type);
    },
    this.remove = () => {
        this.getGridCell().classList.remove(this.type);
    },
    this.move = (dx, dy) => {
        if(isMovePossible(x, y, dx, dy)){
            this.remove()
            this.x += dx;
            this.y += dy;
            this.render();
        }
    },
    this.render();
}

var Que = function(type, backgroundType, direction, y, pattern){
    this.type = type,
    this.backgroundType = backgroundType
    this.y = y,
    this.pattern = pattern,
    this.index = 0,
    this.array = [],
    this.direction = direction,
    this.dx = direction === 'left' ? -1 : 1
    this.remove = () => {
        this.array.forEach((element) => {
            element?.remove();
        });
    }
    this.render = () => {
        this.array.forEach((element) => {
            element?.render();
        });
    },
    this.nextFromPattern = () => {
        var result = this.pattern[this.index]
        this.index = (++this.index)%this.pattern.length;
        return result;
    },
    this.initBackground = () => {
        var arr = [];
        for(var i = 0; i < WIDTH; i++){
            arr.push(new Element(backgroundType, i, y));
        }
        return arr;
    },
    this.generate = () => {
        this.initBackground(this.backgroundType, this.y);
        for(var i = 0; i < WIDTH; i++){
            if( this.nextFromPattern()){
                if(direction === 'left')
                    this.array[i] = new Element(this.type, i, this.y);
                else
                    this.array[i] = new Element(this.type, WIDTH - 1 - i, this.y);
            }else {
                this.array[i] = null;
            }
        }
        this.render();
    },
    this.move = () => {
        this.remove();
        this.array.shift();
        this.array.forEach((element) => {
            if(!!element)
                element.x = element?.x + this.dx;
        });
        if(this.nextFromPattern()){
            if(direction === 'left')
                this.array.push(new Element(this.type, WIDTH - 1, this.y));
            else
                this.array.push(new Element(this.type, 0, this.y));
        }
        else {
            this.array.push(null);
        }
        this.render();
        console.log(this.array);
    }
    this.generate();
}

const stop = () => {
    clearInterval(TIMER_ID);
    var pauseButton = document.querySelector('#pause');
    pauseButton.onclick = () => start();
}

const handleUserInput = (e) => {
    switch(e.key){
        case 'ArrowLeft':
            playerObject.move(-1, 0);
            break 
        case 'ArrowRight':
            playerObject.move(1, 0);
            break
        case 'ArrowUp':
            playerObject.move(0, -1);
            break 
        case 'ArrowDown':
            playerObject.move(0, 1);
            break
        case 'p':
            stop();
            break;
    }
    checkConditions();
}

const isWinCondition = () => {
    return !!document.querySelector('.player.finishLine');
}

const isLosingCondition = () => {
    return !!document.querySelector('.player.log') || !!document.querySelector('.player.car');
}

const checkConditions = () => {
    if ( secondsLeft <= 0 || isLosingCondition() || isWinCondition()){
        document.removeEventListener('keyup', handleUserInput);
        stop();
        var result = document.querySelector('#result');

        if (secondsLeft <= 0) {
            result.innerHTML = 'Times out! Better luck next time...';
            document.querySelector('.player').classList.add('dead');
        } else if ( isLosingCondition()){
            result.innerHTML = 'Colision! Better luck next time...';
            document.querySelector('.player').classList.add('dead');
        } else if ( isWinCondition()){
            result.innerHTML = 'Congratulations! <BR> You won!';
        }
    }
}

const initControls = () => {
    document.addEventListener('keyup', handleUserInput);
}

const updateTimer = () => {
    secondsLeft -= 1;
    document.querySelector('#secondsLeft').innerHTML = secondsLeft;
}

const start = () => {
    TIMER_ID = setInterval(() => {
        leftMovingObjects.forEach(element => element.move(-1, 0));
        rightMovingObjects.forEach(ele => ele.move(1, 0));
        updateTimer();
        checkConditions();
    }, 1000);
    var pauseButton = document.querySelector('#pause');
    pauseButton.onclick = () => stop();
}

const init = () => {
    console.log("Hello, frogger!");
    var gameBoard = document.querySelector('#gameBoard');
    initGameBoard(gameBoard, WIDTH,HEIGHT);
    document.querySelector('#secondsLeft').innerHTML = secondsLeft;

    playerObject = new Element('player', 4, 8)

    new Element('finishLine', 4, 0);

    leftMovingObjects.push(new Que('log', 'river', 'left', 2, [true, true, true, false, false]));
    rightMovingObjects.push(new Que('log', 'river','right', 3, [true, true, true, false, false]));
    
    leftMovingObjects.push(new Que('car', 'road', 'left', 5, [false, true, false]));
    rightMovingObjects.push(new Que('car', 'road', 'right', 6, [false, true, false]));
    
    initControls();

    start();
};

init();