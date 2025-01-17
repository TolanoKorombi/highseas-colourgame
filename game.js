class Shape {
    constructor(newShape) {
        this.colour = {
            r : newShape.colour.r,
            g : newShape.colour.g,
            b : newShape.colour.b
        };
    }
}

class Triangle extends Shape{
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
                x: newTriangle.coordinates.c.x,
                y: newTriangle.coordinates.center.y
            }
        };
    }
}

class Circle extends Shape{
    constructor(newCircle) {
        newCircle.colour = newCircle.owner;
        super(newCircle);
        this.owner = newCircle.owner;
        this.position = newCircle.position;
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
    meeplesPerPlayer : 4, //The meeples must form a triangle therefore it must be possible to form a triangle with the specified number
    allCircles : [],
    draw : function(indexPosition) {
        const circle = this.allCircles[indexPosition];
        const triangle = board.allTriangles[circle.position];
        ctx.beginPath();
        ctx.arc(triangle.coordinates.center.x*cp, triangle.coordinates.center.y*cp, this.radius*cp, 0, 2*Math.PI);

        ctx.fillStyle = `rgb(${circle.colour.r}, ${circle.colour.g}, ${circle.colour.b})`;
        ctx.fill();

        ctx.lineWidth = 2;
        ctx.strokeStyle = `rgb(${circle.owner.r}, ${circle.owner.g}, ${circle.owner.b})`;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(triangle.coordinates.center.x*cp, triangle.coordinates.center.y*cp, this.radius*cp+2, 0, 2*Math.PI);

        ctx.lineWidth = 1;
        ctx.strokeStyle = "#000";
        ctx.stroke();
    },
    create : function() {
        const newCircle = {owner:{}};
        let playerBase = [0, board.allTriangles.length-board.allTriangles.at(-1).position.column-1, board.allTriangles.length-1];
        let positionChange = 0;
        let baseRow;

        for (let player = 0; player < 3; player++){
            positionChange = 0;
            for (let meeple = 0; meeple < this.meeplesPerPlayer; meeple++){
                newCircle.position = playerBase[player]+positionChange;
                newCircle.owner = {r : 255, g : 0, b : 0};
                this.draw(this.allCircles.push(new Circle(newCircle))-1);

                if (player === 0 || player === 1) {
                    if (player === 1 && meeple===baseRow){

                    } else{
                        positionChange++;
                    }
                }

            }
            if (player===0){
                baseRow = board.allTriangles[newCircle.position].position.column;
            }
        }
    }
};





function resize() {
    canvas.create();
    for (let row in board.allTriangles) {
        for (let column in board.allTriangles[row]){
            board.draw(row, column)
        }
    }
    for (let circle in meeples.allCircles) {
        meeples.draw(circle);
    }
}

//Start of initalization and event adding 
canvas.create();
board.create();


//meeples.create();

window.addEventListener("resize", resize);

