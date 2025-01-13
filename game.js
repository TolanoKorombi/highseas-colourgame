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
    },
    update : function() {
        this.create();
        for (let triangle in board.allTriangles) {
            board.draw(triangle);
        }
    }
};
const container = {
    element : document.getElementById("canvasContainer"),
    width : null,
    height : null
};
const body = document.getElementsByTagName("body")[0]
const ctx = canvas.element.getContext("2d");
let cp;

class Shape {
    constructor(newShape) {
        this.position = {
            row : newShape.position.row,
            column : newShape.position.column
        };
        this.coordinates = {
            c : {
                x : newShape.coordinates.c.x,
                y : newShape.coordinates.c.y,
            }
        };
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
        this.position.upsideDown = newTriangle.position.upsideDown;
        this.coordinates.a = {
            x : newTriangle.coordinates.a.x,
            y : newTriangle.coordinates.a.y,
        };
        this.coordinates.b = {
            x : newTriangle.coordinates.b.x,
            y : newTriangle.coordinates.b.y,
        };
    }
}

class Circle extends Shape{
    constructor(positionNew, coordinatesNew, ownerNew) {
        const colourNew = {r:0,g:0,b:0}; 
        this.owner = ownerNew;
        if (ownerNew==="r") {
            colourNew.r = 255;
        }else if (ownerNew==="g") {
            colourNew.g = 255;
        }else {
            colourNew.b = 255;
        }
        super(positionNew, coordinatesNew, colourNew);
    }
}

const board = {
    edge : 10,
    rows : 7,
    allTriangles : [],
    draw : function(indexPosition) {
        const triangle = this.allTriangles[indexPosition];
        ctx.beginPath();
        ctx.moveTo(triangle.coordinates.c.x*cp, triangle.coordinates.c.y*cp);
        ctx.lineTo(triangle.coordinates.b.x*cp, triangle.coordinates.b.y*cp);
        ctx.lineTo(triangle.coordinates.a.x*cp, triangle.coordinates.a.y*cp);
        ctx.closePath();
        
        ctx.fillStyle = `rgb(${triangle.colour.r}, ${triangle.colour.g}, ${triangle.colour.b})`;
        ctx.fill();

        ctx.strokeStyle = "#000";
        ctx.stroke();
    },
    create : function() {
        let columns = 1;
        let upsideDown = false;
        let indexPosition = 0;
        const c = {x:50, y:10, rowStart:50};
        const rgbRow = {r:255, gb:0};
        const gbColumn = {g:rgbRow.gb,b:0,changePerColumn:255/(columns-1)};
        const newTriangle = {position:{}, coordinates:{a:{},b:{},c:{}}, colour:{}};
        for (let row = 0; row < board.rows; row++) {
            c.x = c.rowStart;
            gbColumn.g = rgbRow.gb;
            gbColumn.b = 0;
            gbColumn.changePerColumn = rgbRow.gb/(columns-1);
            upsideDown = false; 
            for (let column = 0; column < columns; column++) {
                newTriangle.position.row = row;
                newTriangle.position.upsideDown = upsideDown;
                newTriangle.position.column = column;    
                newTriangle.colour.r = rgbRow.r;
                newTriangle.colour.g = gbColumn.g;
                newTriangle.colour.b = gbColumn.b;
                newTriangle.coordinates.a.x = c.x-board.edge/2;
                newTriangle.coordinates.b.x = c.x+board.edge/2;
                newTriangle.coordinates.c.x = c.x;

                if (upsideDown===false) {
                    newTriangle.coordinates.a.y = c.y+board.height;
                    newTriangle.coordinates.b.y = c.y+board.height;
                    newTriangle.coordinates.c.y = c.y;
                    upsideDown = true; 
                }
                else {
                    newTriangle.coordinates.a.y = c.y;
                    newTriangle.coordinates.b.y = c.y;
                    newTriangle.coordinates.c.y = c.y+board.height;
                    upsideDown = false;
                }            

                this.allTriangles.push(new Triangle(newTriangle));
                board.draw(indexPosition);
                gbColumn.g -= gbColumn.changePerColumn;
                gbColumn.b += gbColumn.changePerColumn;
                c.x += board.edge/2;
                indexPosition++;
            }
            rgbRow.r -= board.changePerRow;
            rgbRow.gb += board.changePerRow;
            c.y += board.height;
            c.rowStart -= board.edge/2;
            columns += 2;
        }
    },
    
};
board.height = Math.sqrt(Math.pow(board.edge, 2)-Math.pow(board.edge/2, 2));
board.changePerRow = 255/(board.rows-1);

canvas.create();
board.create();

body.onresize = function() {canvas.update()};