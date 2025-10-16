class Shape {
    constructor(newShape) {
        this.color = {
            r : newShape.color.r,
            g : newShape.color.g,
            b : newShape.color.b
        };
    }
}

class Triangle extends Shape {
    constructor(newTriangle) {
        super(newTriangle);
        this.upsideDown = newTriangle.upsideDown;
        this.coordinates = {
            a: {
                x : newTriangle.a.x,
                y : newTriangle.a.y
            },
            b : {
                x : newTriangle.b.x,
                y : newTriangle.b.y
            },
            c : {
                x : newTriangle.c.x,
                y : newTriangle.c.y
            },
            center : {
                x : newTriangle.c.x,
                y : newTriangle.centerY
            }
        };
        this.meeple = {
            player : null,
            circle : null
        };
        this.position = {
            row : newTriangle.row,
            column : newTriangle.column
        };
    }
}

class Circle extends Shape {
    constructor(newCircle) {
        super(newCircle);
        this.triangle = {
            row : newCircle.triangle.row,
            column : newCircle.triangle.column
        };
        this.position = {
            player : newCircle.position.player,
            circle : newCircle.position.circle
        };
    }
    move(target) {
        const current = board.allTriangles[this.triangle.row][this.triangle.column];
        let playersInGame = 3;
        let winner;

        current.meeple.player = null;
        current.meeple.circle = null;
        
        this.triangle.row = target.position.row;
        this.triangle.column = target.position.column;

        target.meeple.player = this.position.player;
        target.meeple.circle = this.position.circle;

        activePlayer++;
        if (activePlayer>2) {
            activePlayer = 0;
        }
        for (let player in players) {
            if (players[activePlayer].circles.length === 0) {
                activePlayer++;
                playersInGame--;
            } else {
                winner = player;
            }
        }
        if (playersInGame<2) {
            endGame(winner);
        }

        if (activePlayer>2) {
            activePlayer = 0;
        }

        meeples.selected = null;
        resize();
    }
    delete() {
        const playerCircles = players[this.position.player].circles;
        const current = board.allTriangles[this.triangle.row][this.triangle.column];
        const rearrangedCircle = playerCircles[playerCircles.length-1];
        const rearrangedTriangle = board.allTriangles[rearrangedCircle.triangle.row][rearrangedCircle.triangle.column];

        current.meeple.player = null;
        current.meeple.circle = null;
        
        rearrangedCircle.position.circle = this.position.circle;
        rearrangedTriangle.meeple.circle = rearrangedCircle.position.circle; 
        playerCircles[this.position.circle] = rearrangedCircle;
        

        playerCircles.pop();
    }
}

class Player {
    constructor(newPlayer) {

        let color;

        if (newPlayer === "0") {
            color = "r";
        } else if (newPlayer === "1") {
            color = "g";
        } else {
            color = "b";
        }

        this.color = {r:0,g:0,b:0};
        this.color[color] = 255;
        this.circles = [];

        const newCircle = {
            color : this.color,
            triangle : {
                row : board.rows-meeples.rowsPerPlayer,
                column : 0
            },
            position : {
                player : Number(newPlayer),
                circle : 0,
            }
        };

        if (newPlayer === "0") {
            newCircle.triangle.row = 0;
        }else if (newPlayer === "2") {
            newCircle.triangle.column = (newCircle.triangle.row)*2;
        }       

        let columns = 1;
        let triangle;
        let centerY;
        let circleElement;

        for (let row = 0; row < meeples.rowsPerPlayer; row++) {
            for (let column = 0; column < columns; column++) { 
                triangle = document.getElementById(`${newCircle.triangle.row},${newCircle.triangle.column}`).points

                centerY = 0;
                for (let point = 0; point < triangle.length; point++) {
                    centerY += triangle[point].y;
                }
                centerY = centerY/3;

                circleElement = svg.element.appendChild(document.createElementNS("http://www.w3.org/2000/svg" ,"circle"));
                circleElement.setAttribute("id", `${newCircle.position.player},${newCircle.triangle.row},${newCircle.triangle.column}`);
                circleElement.setAttribute("r", meeples.radius);
                circleElement.setAttribute("cx", triangle[0].x);
                circleElement.setAttribute("cy", centerY);
                circleElement.setAttribute("fill", `rgb(${newCircle.color.r}, ${newCircle.color.g}, ${newCircle.color.b})`);
                circleElement.setAttribute("stroke-width", svg.strokeWidth);
                circleElement.setAttribute("stroke", svg.strokeColor);
                
                newCircle.triangle.column++;
                newCircle.position.circle++;
            }
            
            if (newPlayer === "2") {
                newCircle.triangle.column -= columns;
            }else {
                newCircle.triangle.column = 0;
            }
            
            newCircle.triangle.row++;

            columns += 2;
        }
    }
}

const svg = {
    element : document.getElementById("gameSVG"),
    edge : null,
    strokeWidth : 0.12,
    strokeColor : "#000",
    create : function() {
        container.width = container.element.clientWidth;
        container.height = container.element.clientHeight;
    
        //Makes the SVG a square which edges are as long as the shortest edge of the container
        if (container.width<container.height) {
            this.edge = container.width;
        } else {
            this.edge = container.height;
        }

        this.element.setAttribute("width", this.edge);
        this.element.setAttribute("height", this.edge);

    }
};

const container = {
    element : document.getElementById("svgContainer"),
    width : null,
    height : null
};
const body = document.getElementsByTagName("body")[0];
const absoluteValueM = Math.sqrt(3)

const board = {
    edge : 12,
    rows : 7,
    selected: null,
    create : function() {
        let columns = 1;
        let upsideDown = false;
        const c = {x:50, y:10, rowStart:50};
        const rgbRow = {r:255, gb:0};
        const gbColumn = {g:rgbRow.gb,b:0,changePerColumn:255/(columns-1)};
        const newTriangle = {a:{}, b:{}, c:{}};
        let triangleElement;
        for (let row = 0; row < this.rows; row++) {
            c.x = c.rowStart;
            gbColumn.g = rgbRow.gb;
            gbColumn.b = 0;
            gbColumn.changePerColumn = rgbRow.gb/(columns-1);
            upsideDown = false;
            for (let column = 0; column < columns; column++) {
                
                newTriangle.a.x = c.x-this.edge/2;
                newTriangle.b.x = c.x+this.edge/2;  
                newTriangle.c.x = c.x;

                if (upsideDown===false) {
                    newTriangle.a.y = c.y+this.height;
                    newTriangle.b.y = c.y+this.height;
                    newTriangle.c.y = c.y;
                    newTriangle.centerY = c.y+this.twoThirdOfHeight;
                    upsideDown = true; 
                }
                else {
                    newTriangle.a.y = c.y;
                    newTriangle.b.y = c.y;
                    newTriangle.c.y = c.y+this.height;
                    newTriangle.centerY = c.y+this.height-this.twoThirdOfHeight;
                    upsideDown = false;
                }            

                triangleElement = svg.element.appendChild(document.createElementNS("http://www.w3.org/2000/svg" ,"polygon"));
                triangleElement.setAttribute("fill", `rgb(${rgbRow.r}, ${gbColumn.g}, ${gbColumn.b})`);
                triangleElement.setAttribute("stroke-width", svg.strokeWidth);
                triangleElement.setAttribute("stroke", svg.strokeColor);
                triangleElement.setAttribute("points", `${newTriangle.c.x},${newTriangle.c.y} ${newTriangle.b.x},${newTriangle.b.y} ${newTriangle.a.x},${newTriangle.a.y}`);
                triangleElement.setAttribute("id", `${row},${column}`);
                
                gbColumn.g -= gbColumn.changePerColumn;
                gbColumn.b += gbColumn.changePerColumn;
                c.x += this.edge/2;
            }
            rowArray = [];
            rgbRow.r -= this.changePerRow;
            rgbRow.gb += this.changePerRow;
            c.y += this.height;
            c.rowStart -= this.edge/2;
            columns += 2;
            }
    },
    
};
board.height = Math.sqrt(Math.pow(board.edge, 2)-Math.pow(board.edge/2, 2));
board.changePerRow = 255/(board.rows-1);
board.twoThirdOfHeight = board.height*2/3;

const meeples = {
    radius : board.height/3.8,
    rowsPerPlayer : 3, 
    selected : null,
    draw : function(player, circle) {
        const pl = players[player];
        const meeple = pl.circles[circle];
        const triangle = board.allTriangles[meeple.triangle.row][meeple.triangle.column];
        ctx.beginPath();
        ctx.arc(triangle.coordinates.center.x*cp, triangle.coordinates.centerY*cp, this.radius*cp, 0, 2*Math.PI);

        ctx.fillStyle = `rgb(${meeple.color.r}, ${meeple.color.g}, ${meeple.color.b})`;
        ctx.fill();

        ctx.lineWidth = ctx.lineWidth*2;
        ctx.strokeStyle = `rgb(${pl.color.r}, ${pl.color.g}, ${pl.color.b})`;
        ctx.stroke();
        

        ctx.beginPath();
        ctx.arc(triangle.coordinates.center.x*cp, triangle.coordinates.centerY*cp, this.radius*cp+ctx.lineWidth, 0, 2*Math.PI);

        ctx.lineWidth = ctx.lineWidth/2;
        ctx.strokeStyle = "#000";
        ctx.stroke();
    },
    create : function() {
        for (let player in players){
            players[player] = new Player(player);
        }
    },
    beat : function(triangle, attackingMeeple) {
        const defendingMeeple = players[triangle.meeple.player].circles[triangle.meeple.circle];
        const resultColor = { r : 0, g : 0, b: 0};
        const winner = {player: null, value: 0}

        for (let color in resultColor) {
            resultColor[color] = (defendingMeeple.color[color] + attackingMeeple.color[color] + triangle.color[color])/3;
            if (resultColor[color]>winner.value) {
                winner.player = color;
                winner.value = resultColor[color];
            } else if (resultColor[color] === winner.value) { //Problem draw between defender and uninvolved results in ein of attacker
                winner.player = attackingMeeple.position.player;
                winner.value = resultColor[color];
            } /*else if (resultColor[color] === winner.value && defendingMeeple.color[color]) {
                winner.player = defendingMeeple.position.player;
                winner.value = resultColor[color];
            }*/
        }
        
        if (winner.player === "r") {
            winner.player = 0;
        } else if (winner.player === "g") {
            winner.player = 1;
        } else if (winner.player === "b") {
            winner.player = 2;
        }

        if (winner.player === defendingMeeple.position.player) {
            players[winner.player].circles[defendingMeeple.position.circle].color = resultColor;
            attackingMeeple.delete();
            defendingMeeple.move(board.selected);

        } else if (winner.player === attackingMeeple.position.player) {
            players[winner.player].circles[attackingMeeple.position.circle].color = resultColor;
            defendingMeeple.delete();
            attackingMeeple.move(board.selected);

        } else {
            const newCircle = {
                color : resultColor,
                position : {
                    player : winner.player,
                    circle : players[winner.player].circles.length
                },
                triangle : defendingMeeple.triangle
            };
            const uninvolvedPlayer = players[winner.player];

            uninvolvedPlayer.circles.push(new Circle(newCircle));
            
            attackingMeeple.delete();
            defendingMeeple.delete();
            uninvolvedPlayer.circles[uninvolvedPlayer.circles.length-1].move(board.selected);
        }
    }
};

const players = [null, null, null];
let activePlayer = 0;

function deleteArrayElement(arr, index) {
     
}

function f(x, modifier, coordinates)  {
    let m = absoluteValueM*modifier;
    return m*x + coordinates.c.y - m*coordinates.c.x;
}

function binaryTriangleSearch(arr, x, y) {
    let min = 0;
    let max = arr.length-1;
    let mid;

    if (x === undefined) {
        while (min<=max) {
            mid = Math.round((min+max)/2);

            if (arr[mid][0].coordinates.c.y < y) {
                if (arr[mid][0].coordinates.a.y > y) {
                    return mid;
                } else {
                    min = mid+1;
                }
            } else {
                max = mid-1;
            }
        }
    } else {
        while (min<=max) {
            mid = Math.round((min+max)/2);

            if (arr[mid].upsideDown===false){
                if ( y > f(x, 1, arr[mid].coordinates)) {
                    if (y > f(x, -1, arr[mid].coordinates)) {
                        return mid;
                    } else {
                        max = mid-1;
                    }
                } else {
                    min = mid+1;
                }  
            } else {
                if ( y < f(x, -1, arr[mid].coordinates)) {
                    if (y < f(x, 1, arr[mid].coordinates)) {
                        return mid;
                    } else {
                        max = mid-1;
                    }
                } else {
                    min = mid+1;
                }
            }            
        }
    }

    return false;
}

//window.addEventListener("resize", svg.create()); doesn't work therefore this function is necessary
//TO DO: find a better way to add the event listener
function resize() { 
    svg.create();   
}

function endGame(winner) {  
    let winnerName;
    if (winner === 0) {
        winnerName = "Red";
    } else if (winner === 1){
        winnerName = "Green";
    } else {
        winnerName = "Blue"; 
    }
    
    canvas.create();
    ctx.beginPath();
    ctx.font = `${20*cp}px Verdana`;
    ctx.fillStyle = `rgb(${players[winner].color.r}, ${players[winner].color.g}, ${players[winner].color.b})`
    ctx.fillText(`${winnerName} won!`, 10*cp, 10*cp);
}

function getInput(e) {
    let x = e.offsetX/cp;
    let y = e.offsetY/cp;
        
    let row = binaryTriangleSearch(board.allTriangles, undefined, y);
    if (row===false) {return;}
    let column = binaryTriangleSearch(board.allTriangles[row], x, y);
    if (column===false) {return;}
    board.selected = board.allTriangles[row][column];

    if (board.selected.meeple.player === activePlayer) {
        meeples.selected = players[activePlayer].circles[board.selected.meeple.circle];
    } else if (board.selected.meeple.player != null && meeples.selected != null) {
        meeples.beat(board.selected, meeples.selected);
    } else if (meeples.selected != null) {
        meeples.selected.move(board.selected);
    }
}



//Start of initalization and event adding 
svg.create();
board.create(); 

meeples.create();

window.addEventListener("resize", resize);



/*canvas.element.addEventListener("click", getInput);
canvas.element.addEventListener("ontouch", getInput);
*/

//let test = 