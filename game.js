const canvas = {
    element : document.getElementById("gameCanvas"),
    edge : null
};
const container = {
    element : document.getElementById("canvasContainer"),
    width : null,
    height : null
};
const ctx = canvas.element.getContext("2d");
const rows = 7;
const changePerRow = 255/(rows-1);
let cp;

class Triangle {
    constructor(positionNew, coordinatesNew, colourNew) {
            this.position = {
                row : positionNew.row,
                upsideDown : positionNew.upsideDown,
                coloumn : positionNew.column
            };
            this.coordinates = {
                a : {
                    x : coordinatesNew.a.x,
                    y : coordinatesNew.a.y,
                },
                b : {
                    x : coordinatesNew.b.x,
                    y : coordinatesNew.b.y,
                },
                c : {
                    x : coordinatesNew.c.x,
                    y : coordinatesNew.c.y,
                },
            };
            this.colour = {
                r : colourNew.r,
                g : colourNew.g,
                b : colourNew.b
            };
    }
}

const triangles = {
    edge : 10,
    allTriangles : [],
    create : function(positionNew, coordinatesNew, colourNew, update) {
        if (update===false) {
            this.allTriangles.push(new Triangle(positionNew, coordinatesNew, colourNew));
        } else {
            const triangle = this.allTriangles[update];
            triangle.position = positionNew;
            triangle.coordinates = coordinatesNew;
            triangle.colour = colourNew;
        }
    },
    draw : function(indexPosition) {
        const triangle = this.allTriangles[indexPosition];
        ctx.beginPath();
        ctx.moveTo(triangle.coordinates.c.x, triangle.coordinates.c.y);
        ctx.lineTo(triangle.coordinates.b.x, triangle.coordinates.b.y);
        ctx.lineTo(triangle.coordinates.a.x, triangle.coordinates.a.y);
        ctx.closePath();
        
        ctx.fillStyle = `rgb(${triangle.colour.r}, ${triangle.colour.g}, ${triangle.colour.b})`;
        ctx.fill();

        ctx.strokeStyle = "#000";
        ctx.stroke();

    }
};
triangles.height = Math.sqrt(Math.pow(triangles.edge, 2)-Math.pow(triangles.edge/2, 2));


function setSize(update) {
    container.width = container.element.clientWidth;
    container.height = container.element.clientHeight;
    
    //Makes the Canvas a square which edges are as long as the shortest edge of the container
    if (container.width<container.height){
        canvas.edge = container.width;
    } else {
        canvas.edge = container.height;
    }

    cp = canvas.edge/100;

    canvas.element.width = canvas.edge;
    canvas.element.height = canvas.edge;

    // Creates and updates the triangles
    let columns = 1;
    let upsideDown = false;
    let indexPosition = 0;
    const c = {x:50, y:10, rowStart:50};
    const rgbRow = {r:255, gb:0};
    const gbColumn = {g:rgbRow.gb,b:0,changePerColumn:255/(columns-1)};
    const newTriangle = {position:{}, coordinates:{}, colour:{}};

    for (let row = 0; row < rows; row++) {
        c.x = c.rowStart;
        gbColumn.g = rgbRow.gb
        gbColumn.b = 0
        gbColumn.changePerColumn = rgbRow.gb/(columns-1);
        upsideDown = false; 
        for (let column = 0; column < columns; column++) {
            if (!(update===false)){
                update = indexPosition;
            }
            if (upsideDown===false){
                newTriangle.position = {
                    row : row, 
                    upsideDown : upsideDown,
                    column : column
                }
                newTriangle.coordinates = {
                    a : {
                        x : (c.x-triangles.edge/2)*cp,
                        y : (c.y+triangles.height)*cp
                    },
                    b : {
                        x : (c.x+triangles.edge/2)*cp,
                        y : (c.y+triangles.height)*cp
                    },
                    c : {
                        x : (c.x)*cp,
                        y : (c.y)*cp
                    }
                };
                upsideDown = true; 
            }
            else {
                newTriangle.position = {
                    row : row, 
                    upsideDown : upsideDown,
                    column : column
                }
                newTriangle.coordinates = {
                    a : {
                        x : (c.x-triangles.edge/2)*cp,
                        y : (c.y)*cp
                    },
                    b : {
                        x : (c.x+triangles.edge/2)*cp,
                        y : (c.y)*cp
                    },
                    c : {
                        x : (c.x)*cp,
                        y : (c.y+triangles.height)*cp
                    }
                };
                upsideDown = false;
            }
            c.x += triangles.edge/2;
            newTriangle.colour = {
                r : rgbRow.r,
                g : gbColumn.g,
                b : gbColumn.b
            }
            triangles.create(newTriangle.position, newTriangle.coordinates, newTriangle.colour, update);
            triangles.draw(indexPosition);
            gbColumn.g -= gbColumn.changePerColumn;
            gbColumn.b += gbColumn.changePerColumn;
            indexPosition++;
        }
        rgbRow.r -= changePerRow;
        rgbRow.gb += changePerRow;
        c.y += triangles.height;
        c.rowStart -= triangles.edge/2;
        columns += 2;
    }
}

setSize(false);

document.getElementsByTagName("BODY")[0].onresize = function() {setSize()};