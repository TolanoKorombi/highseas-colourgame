class Shape {
    constructor(newShape) {
        this.colour = {
            r : newShape.colour.r,
            g : newShape.colour.g,
            b : newShape.colour.b
        };
    }
}

class Triangle extends Shape {
    constructor(newTriangle) {
        super(newTriangle);
        this.upsideDown = newTriangle.upsideDown;
        this.coordinates = {
            a: {
                x : newTriangle.coordinates.a.x,
                y : newTriangle.coordinates.a.y
            },
            b : {
                x : newTriangle.coordinates.b.x,
                y : newTriangle.coordinates.b.y
            },
            c : {
                x : newTriangle.coordinates.c.x,
                y : newTriangle.coordinates.c.y
            },
            center : {
                x : newTriangle.coordinates.c.x,
                y : newTriangle.coordinates.center.y
            }
        };
        this.meeple = {
            player : null,
            circle : null
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
    }
}

class Player {
    constructor(newPlayer) {

        this.colour = {r:0,g:0,b:0};
        this.colour[newPlayer] = 255;
        this.circles = [];

        const newCircle = {
            colour : this.colour,
            triangle : {
                row : board.allTriangles.length-meeples.rowsPerPlayer,
                column : 0
            }
        };

        if (newPlayer === "r") {
            newCircle.triangle.row = 0;
        }else if (newPlayer === "b") {
            newCircle.triangle.column = board.allTriangles[newCircle.triangle.row].length-1;
        }       

        let columns = 1;

        for (let row = 0; row < meeples.rowsPerPlayer; row++) {
            for (let column = 0; column < columns; column++) {
                this.circles.push(new Circle(newCircle));
                newCircle.triangle.column++;
            }
            
            if (newPlayer === "b") {
                newCircle.triangle.column -= columns;
            }else {
                newCircle.triangle.column = 0;
            }
            
            newCircle.triangle.row++;

            columns += 2;
        }
    }
}

const canvas = {
    element : document.getElementById("gameCanvas"),
    edge : null,
    create : function() {
        container.width = container.element.clientWidth;
        container.height = container.element.clientHeight;
    
        //Makes the Canvas a square which edges are as long as the shortest edge of the container
        if (container.width<container.height) {
            this.edge = container.width;
        } else {
            this.edge = container.height;
        }

        cp = this.edge/100;
        this.element.width = this.edge;
        this.element.height = this.edge;

        ctx.lineWidth = 0.12*cp;
    }
};

const container = {
    element : document.getElementById("canvasContainer"),
    width : null,
    height : null
};
const body = document.getElementsByTagName("body")[0];
const ctx = canvas.element.getContext("2d");
ctx.strokeStyle = "#000";
let cp;

const board = {
    edge : 10,
    rows : 7,
    allTriangles : [],
    draw : function(row, column,) {
        const triangle = this.allTriangles[row][column];
        ctx.beginPath();
        ctx.moveTo(triangle.coordinates.c.x*cp, triangle.coordinates.c.y*cp);
        ctx.lineTo(triangle.coordinates.b.x*cp, triangle.coordinates.b.y*cp);
        ctx.lineTo(triangle.coordinates.a.x*cp, triangle.coordinates.a.y*cp);
        ctx.closePath();
        
        ctx.fillStyle = `rgb(${triangle.colour.r}, ${triangle.colour.g}, ${triangle.colour.b})`;
        ctx.fill();
        ctx.stroke();
    },
    create : function() {
        let columns = 1;
        let upsideDown = false;
        const c = {x:50, y:10, rowStart:50};
        const rgbRow = {r:255, gb:0};
        const gbColumn = {g:rgbRow.gb,b:0,changePerColumn:255/(columns-1)};
        const newTriangle = {position:{}, coordinates:{a:{},b:{},c:{},center:{}}, colour:{}};
        for (let row = 0; row < this.rows; row++) {
            c.x = c.rowStart;
            gbColumn.g = rgbRow.gb;
            gbColumn.b = 0;
            gbColumn.changePerColumn = rgbRow.gb/(columns-1);
            upsideDown = false;
            this.allTriangles.push([]);
            for (let column = 0; column < columns; column++) {
                newTriangle.upsideDown = upsideDown;
                newTriangle.colour.r = rgbRow.r;
                newTriangle.colour.g = gbColumn.g;
                newTriangle.colour.b = gbColumn.b;
                newTriangle.coordinates.a.x = c.x-this.edge/2;
                newTriangle.coordinates.b.x = c.x+this.edge/2;
                newTriangle.coordinates.c.x = c.x;

                if (upsideDown===false) {
                    newTriangle.coordinates.a.y = c.y+this.height;
                    newTriangle.coordinates.b.y = c.y+this.height;
                    newTriangle.coordinates.c.y = c.y;
                    newTriangle.coordinates.center.y = c.y+this.twoThirdOfHeight;
                    upsideDown = true; 
                }
                else {
                    newTriangle.coordinates.a.y = c.y;
                    newTriangle.coordinates.b.y = c.y;
                    newTriangle.coordinates.c.y = c.y+this.height;
                    newTriangle.coordinates.center.y = c.y+this.height-this.twoThirdOfHeight;
                    upsideDown = false;
                }            

                this.draw(row, this.allTriangles[row].push(new Triangle(newTriangle))-1);
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
    radius : board.height/3.6,
    rowsPerPlayer : 3, 
    draw : function(player, circle) {
        const meeple = players[player].circles[circle];
        const triangle = board.allTriangles[meeple.triangle.row][meeple.triangle.column];
        ctx.beginPath();
        ctx.arc(triangle.coordinates.center.x*cp, triangle.coordinates.center.y*cp, this.radius*cp, 0, 2*Math.PI);

        ctx.fillStyle = `rgb(${meeple.colour.r}, ${meeple.colour.g}, ${meeple.colour.b})`;
        ctx.fill();

       /* ctx.strokeStyle = `rgb(${circle.player.r}, ${circle.player.g}, ${circle.player.b})`;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(triangle.coordinates.center.x*cp, triangle.coordinates.center.y*cp, this.radius*cp+2, 0, 2*Math.PI);*/

        ctx.stroke();
    }, 
    /*drawInit : function(center, colour) {
        ctx.beginPath();
        ctx.arc(center.x*cp, center.y*cp, this.radius*cp, 0, 2*Math.PI);

        ctx.fillStyle = `rgb(${colour.r}, ${colour.g}, ${colour.b})`;
        ctx.fill();
        ctx.stroke();
    },*/
    create : function() {
        for (let player in players){
            players[player] = new Player(player);
            for (let circle in players[player].circles) {
                this.draw(player, circle);
            }
        }
    }
};

const players = {
    r : null,
    g : null,
    b : null,
}

function resize() {
    canvas.create();
    for (let row in board.allTriangles) {
        for (let column in board.allTriangles[row]){
            board.draw(row, column)
        }
    }
    for (let player in players){
        for (let circle in players[player].circles) {
            meeples.draw(player, circle)
        }
    }
}

//Start of initalization and event adding 
canvas.create();
board.create();

meeples.create();

window.addEventListener("resize", resize);