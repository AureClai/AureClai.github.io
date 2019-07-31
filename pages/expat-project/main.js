

// CLASSES //////////////////////////////////////////////
// Timer
class Timer {
    constructor(deltaTime = 1 / 60) {
        let accumulatedTime = 0;
        this.lastTime = 0;
        this.raf;

        this.isRunning = false;
        this.updateProxy = (time) => {
            const theTime = Date.now();
            accumulatedTime += (theTime - this.lastTime) / 1000;

            if (accumulatedTime > 1) accumulatedTime = 1;

            while (accumulatedTime > deltaTime) {
                this.update(deltaTime);
                accumulatedTime -= deltaTime;
            }
            this.lastTime = theTime;
            // TODO: REMOVE THIS
            //this.stop();
            //return;
            this.enqueue();
        }
    }
    enqueue() {
        if (this.isRunning) {
            //console.log('enqueuing :' + Date.now());
            this.raf = requestAnimationFrame(this.updateProxy);
        }
    }
    start() {
        this.isRunning = true;
        this.lastTime = Date.now();
        this.enqueue();
    }

    stop() {
        this.isRunning = false;
        cancelAnimationFrame(this.raf);
    }
}

class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    plus(other) {
        return new Vector2(this.x + other.x, this.y + other.y);
    }

    minus(other) {
        return new Vector2(this.x - other.x, this.y - other.y);
    }

    times(number) {
        return new Vector2(this.x * number, this.y * number);
    }
}

class Axis {
    constructor(xmin, xmax, ymin, ymax) {
        this.xmin = xmin;
        this.xmax = xmax;
        this.ymax = ymax;
        this.ymin = ymin;
    }

    convertToPixels(vect) {
        //console.log('I get the vect in axis:')
        //console.log(vect)
        let x = (vect.x - this.xmin) / (this.xmax - this.xmin) * canvas.width;
        let y = (1 - (vect.y - this.ymin) / (this.ymax - this.ymin)) * canvas.height;
        let newVect = new Vector2(x, y);
        //console.log('And I return in pixels :')
        //console.log(newVect)
        return newVect;
    }

    getCenter() {
        return this.convertToPixels(new Vector2(0, 0));
    }

    convertRadius(radius) {
        let xRadius = radius / (this.xmax - this.xmin) * canvas.width;
        let yRadius = radius / (this.ymax - this.ymin) * canvas.height;

        return new Vector2(xRadius, yRadius);
    }

    plot(xs, ys, color = 'black') {
        ctx.strokeStyle = color;
        ctx.beginPath();
        let points = [];
        for (let i = 0; i < xs.length; i++) {
            points.push(new Vector2(xs[i], ys[i]));
        }
        points.forEach((point) => {
            let converted = this.convertToPixels(point);
            ctx.lineTo(converted.x, converted.y)
        });
        ctx.stroke();
    }

    patch(xs, ys, color = 'rgb(102, 102, 102)') {
        ctx.fillStyle = color;
        ctx.beginPath();
        let points = [];
        for (let i = 0; i < xs.length; i++) {
            points.push(new Vector2(xs[i], ys[i]));
        }
        points.forEach((point) => {
            let converted = this.convertToPixels(point);
            ctx.lineTo(converted.x, converted.y)
        });
        ctx.fill();
    }

    text(x, y, content, font = '20px sans-serif') {
        let point = this.convertToPixels(new Vector2(x, y));
        ctx.font = font;
        ctx.fillText(content, point.x, point.y);
    }

    mark(x, y, size = 14, color = 'black') {
        let point = this.convertToPixels(new Vector2(x, y));
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(point.x, point.y, size / 2, 0, Math.PI * 2, false);
        ctx.fill();
    }
}

// car
class Car {
    constructor(position, place, noID = false) {
        if (!noID) {
            this.id = cumIDs;
            cumIDs++;
            //console.log('Vehicle ' + cumIDs + ' placed ' + place);
        }
        this.position = position;
        this.place = place;
        this.leader = null;
        this.origin = place;
        this.toExit = false;
    }

    posOnDraw() {
        if (this.place === 'onRing') {
            let angle = this.position * Math.PI * 2 / L + Math.PI;
            let x = Math.cos(angle) * L / (2 * Math.PI);
            let y = Math.sin(angle) * L / (2 * Math.PI);
            return new Vector2(x, y);
        } else if (this.place === 'onExit') {
            return new Vector2(this.position + L / (2 * pi), 0);
        } else if (this.place === 'onEntry') {
            if (this.position <= L / (2 * pi)) {
                return new Vector2(-L / pi, L / (2 * pi) - this.position);
            } else {
                return new Vector2(-3 * L / (2 * pi) + this.position, 0);
            }
        }
    }

    draw() {
        let pos = this.posOnDraw();
        let color;
        if (this.leader) {
            let posLeader = this.leader.posOnDraw();
            // cals moy pos
            if (debug) {
                let ecart = this.leader.position - this.position;
                if (ecart < 0) ecart += L;
                let newPos = 0.5 * ecart + this.position;
                if (newPos >= L) newPos -= L;
                let tempCar = new Car(newPos, this.place, true);
                let tempPos = tempCar.posOnDraw();
                axis.plot([pos.x, tempPos.x], [pos.y, tempPos.y], 'green');
                axis.plot([tempPos.x, posLeader.x], [tempPos.y, posLeader.y], 'green');
            }

            //console.log(pos);
            // distance
            let dist = this.leader.position - this.position;
            if (dist < 0) {
                dist += L;
            }

            if (dist <= (dmin + 0.2 * (dconf - dmin))) {
                color = 'black';
            } else if (dist <= 0.5 * (dmin + dconf)) {
                //console.log('here');
                color = 'red';
            } else if (dist <= (dconf - 0.2 * (dconf - dmin))) {
                color = 'rgb(255,127,0)';
            } else {
                color = 'rgb(0,255,127)';
            }
            //console.log(dmin + ',' + dconf + ',' + dist);
        } else {
            color = 'rgb(0,255,127)';
        }

        axis.mark(pos.x, pos.y, 400 * 1 / L, color);
        if (debug) axis.text(pos.x + 0.1, pos.y + 0.1, Math.floor(this.position) + ' ' + this.place + ' - ID: ' + this.id, '14px sans-serif')
    }

    move(deltaTime) {
        if (this.leader && this.leader.place !== this.place) {
            this.leader = null;
        }
        
        if (this.place === 'onRing') {
            let distanceParcourue = vitesse * deltaTime;
            // movement
            if (this.leader != null){
                let dist = this.leader.position - this.position;
                if (dist < 0) {
                    dist += L;
                }
                
                if (dist > dmin){
                    let newellSpeed = vitesse;
                    if (dist < dconf){
                        distanceParcourue = vitesse * (dist - dmin)/(dconf - dmin) * deltaTime;
                    }
                } else {
                    distanceParcourue = 0;
                } // elle ne bouge pas
            }
            this.position += distanceParcourue;
            
            //console.log(this.id + ': I moved !')
            // Si el véhicule dépasse la position
            if (this.position >= L) {
                this.position -= L;
                carsOnRing.pop();
                carsOnRing.unshift(this);
            } else if (this.position - distanceParcourue < 0.25 * L && this.position >= 0.25 * L) {
                this.origin = 'onRing';
            }

            //sortie
            if (exitor.carsToExit >0 && this.position - distanceParcourue < 0.5*L && this.position >= 0.5 * L){
                this.position = this.position - L / 2;
                this.place = 'onExit';
                let follower = carsOnRing.find((car) => {
                    return car.leader == this;
                })
                if (follower && this.leader != follower){
                    follower.setLeader(this.leader);
                }
                carsOnExit.unshift(this);
                carsOnRing = carsOnRing.filter((car) => {
                    return car != this;
                });
                exitor.hasExited();
            }
        } else if (this.place === 'onExit') {
            let distanceParcourue = vitesse * deltaTime;
            this.position += distanceParcourue;
            if (this.position >= L / (2 * pi)){
                carsOnExit.pop();
            }
        } else if (this.place === 'onEntry') {
            let distanceParcourue = vitesse * deltaTime;
            if (this.leader != null) { // avec leader
                if (this.leader.position - this.position - distanceParcourue >= dmin) { // assez loin du leader
                    //console.log(this.position + distanceParcourue)
                    if (this.position + distanceParcourue > 0.75 * L / pi && this.position <= 0.75 * L / pi) { // il est censé franchir le point dur
                        if (light.isGreen) { // et que le passage est ouvert
                            this.position += distanceParcourue;
                        }
                    } else {
                        this.position += distanceParcourue;
                    }
                }
            } else { // sans leader
                if (this.position + distanceParcourue >= L / pi) {
                    if (carsOnRing.length > 1) {
                        let dist = carsOnRing[0].position - carsOnRing[carsOnRing.length - 1].position;
                        if (dist < 0) dist += L;
                        if (dist > dmin) {
                            // insertion
                            //console.log('I see a dist of ' + dist);
                            this.position += distanceParcourue;
                            this.position = this.position - L / pi;
                            this.place = 'onRing';
                            this.leader = carsOnRing[0];
                            carsOnRing.unshift(this);
                            carsOnEntry.pop();
                            carsOnRing[carsOnRing.length - 1].setLeader(this);
                            //console.log('' + this.leader.id + 'has bacome leader of' + this.id );
                        }
                    } else if (carsOnRing.length === 1) {
                        // insertion
                        this.position += distanceParcourue;
                        this.position = this.position - L / pi;
                        this.place = 'onRing';
                        this.leader = carsOnRing[0];
                        carsOnRing.unshift(this);
                        carsOnEntry.pop();
                        carsOnRing[1].setLeader(this);
                    } else {
                        // insertion
                        this.position += distanceParcourue;
                        this.position = this.position - L / pi;
                        this.place = 'onRing';
                        carsOnRing.unshift(this);
                        carsOnEntry.pop();
                    }

                } else { // le véhicule en entrée peut etre contraint par le flux
                    //console.log(carsOnRing[0].position - L / 2 + L / pi - this.position - distanceParcourue - 0.000001)
                    if (debug) {

                        let pos = this.posOnDraw();
                        let tempPos = carsOnRing[0].posOnDraw();
                        axis.plot([pos.x, tempPos.x], [pos.y, tempPos.y], 'red');
                    }
                    if (carsOnRing.length === 0 || (carsOnRing[0].position + (L / pi) - this.position - distanceParcourue - 0.01 >= dmin && carsOnRing[carsOnRing.length - 1].position < L - 0.01)) {
                        if (this.position + distanceParcourue > 0.75 * L / pi && this.position <= 0.75 * L / pi) { // il est censé franchir le point dur
                            if (light.isGreen) { // et que le passage est ouvert
                                this.position += distanceParcourue;
                            }
                        } else {
                            this.position += distanceParcourue;
                        }
                    }
                }
            }
        }
    }

    setLeader(leader) {
        this.leader = leader;
        //console.log(leader.id + " is the new leader for " + this.id);
    }
}

// canvas
var canvas = document.getElementById('canvas')
var ctx = canvas.getContext('2d');
var raf;
var buttonPause = document.getElementById('Pause');
var buttonToggle = document.getElementById('Toggle');
var buttonReset = document.getElementById('Reset');
var progressBar = document.getElementById('Progress');
var checkEntry = document.getElementById('entree');
var checkExit = document.getElementById('sortie');

const FPS = 240;
const deltaTime = 1 / FPS;
const timer = new Timer(deltaTime);
// update function
timer.update = function update() {
    dmin = Number(document.getElementById('Dmin').value);
    dconf = Number(document.getElementById('Dconf').value);
    vitesse = Number(document.getElementById('Vitesse').value);
    qentree = Number(document.getElementById('Qentree').value);
    qsortie = Number(document.getElementById('Qsortie').value);
    isCheckEntry = Boolean(checkEntry.checked);
    isCheckExit = Boolean(checkExit.checked);
    draw();
    tick(deltaTime);
}
// PARAMS
var running;
let isInitialized = false;
let L;
let dmin;
let dconf;
let vitesse;
let qentree;
let qsortie;
const pi = Math.PI;
let cumIDs = 0;
// axis
let axis;
//list voitures
let carsOnRing;
let carsOnExit;
let carsOnEntry;
let isCheckEntry;
let isCheckExit;
let isLost;
let debug = false;

// OBJECTS
let light = {
    isGreen: false,
    toggle: function () {
        this.isGreen = this.isGreen ? false : true;
        //console.log(this.isGreen ? 'green.' : 'red.');
    }
}

let insertor = {
    lastInsertion: 0,
    time: 0,
    tick(deltaTime) {
        this.time += deltaTime;
        this.insertion();
        this.testEnd();
    },
    insertion: function () {
        let nbPDTInsertion = 1 / (qentree);
        let timeSinceLastInsertion = this.time - this.lastInsertion;
        let condition = true;
        if (carsOnEntry.length != 0) {
            condition = carsOnEntry[0].position >= dmin; // si on a la place de rentrer
        }
        if (isCheckEntry && timeSinceLastInsertion >= nbPDTInsertion && condition) {
            let newCar = new Car(0, 'onEntry');
            if (carsOnEntry.length != 0) {
                newCar.leader = carsOnEntry[0];
            }
            carsOnEntry.unshift(newCar);
            this.lastInsertion = this.time;
        }
    },
    testEnd: function () {
        let distFeu = 0.75 * L / pi;
        // la file d'attente en entr�e est remont�e jusqu'� l'origine de la voie
        let cond1 = carsOnEntry.filter((car) => { return car.position < distFeu }).length >= (-1 + distFeu / dmin);
        let cond2 = this.time - this.lastInsertion > 2 * dmin / vitesse;
        // il y au moins une personne sur la file d'attente
        let cond3 = false;
        if (carsOnEntry.length != 0) {
            cond3 = carsOnEntry[0].position < dmin;
        }
        if (cond1 && cond2 && cond3) {
            endGame();
        }

    }
}

let exitor = {
    lastExitTick: 0,
    time: 0,
    carsToExit: 0,
    tick(deltaTime) {
        this.time += deltaTime;
        this.exit();
    },
    exit: function () {
        let nbPDTExit = 1 / (qsortie);
        let timeSinceLastExit = this.time - this.lastExitTick;
        if (isCheckExit && timeSinceLastExit >= nbPDTExit) {
            this.carsToExit++;
            this.lastExitTick = this.time;
        }
    },
    hasExited: function() {
        this.carsToExit --;
    }

}



function initialisation() {
    cumIDs = 0;
    progressBar.attributes[3].value = 0;
    exitor.carsToExit = 0;
    //insertor.init();
    // variables intéressantes
    L = Number(document.getElementById('L').value);
    let vitesse = document.getElementById('Vitesse').value;
    let densite = document.getElementById('Densite').value;
    let nombrePersonnes = Math.floor(L * densite);
    let ecartInitial = L / nombrePersonnes;
    //console.log(nombrePersonnes);
    axis = new Axis(0.4 * -L, 0.4 * L, 0.4 * -L / 2, 0.4 * L / 2);
    carsOnRing = [];
    for (let i = 0; i < nombrePersonnes; i++) {
        let pos = i * ecartInitial;
        carsOnRing.push(new Car(pos, 'onRing'));
    }
    if (carsOnRing.length > 1) {
        carsOnRing[carsOnRing.length - 1].setLeader(carsOnRing[0]);
        for (let i = 0; i < carsOnRing.length - 1; i++) {
            carsOnRing[i].setLeader(carsOnRing[i + 1]);
        }
    }


    // TODO: REMOVE THIS
    carsOnExit = [];
    /*for (let i = 0; i < 3; i++) {
        carsOnExit.push(new Car(i * ecartInitial, 'onExit'));
    }*/
    // TODO: REMOVE THIS
    carsOnEntry = [];/*
    for (let i = 0; i < 4; i++) {
        carsOnEntry.push(new Car(i * ecartInitial, 'onEntry'));
    }*/


    isInitialized = true;
}

// DRAWING FUNCTION
function draw() {

    //ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //console.log('updating :' + Date.now());

    // les cercles
    //console.log('Getting center')
    let center = axis.getCenter();
    //console.log(center)

    // cercle intérieur
    //console.log('Getting radius inner circle')
    let radius = axis.convertRadius(0.93 * L / (2 * Math.PI));
    //console.log(radius)
    ctx.strokeStyle = 'black'
    ctx.beginPath();
    ctx.ellipse(center.x, center.y, radius.x, radius.y, 0, 0, Math.PI * 2, true);
    ctx.stroke();
    // demi cercle extérieur haut
    radius = axis.convertRadius(1.07 * L / (2 * Math.PI));
    ctx.beginPath();
    ctx.ellipse(center.x, center.y, radius.x, radius.y, 0, 0.075, Math.PI - 0.075, false);
    ctx.stroke();
    // demi cercle extérieur bas
    ctx.beginPath();
    ctx.ellipse(center.x, center.y, radius.x, radius.y, 0, Math.PI + 0.075, Math.PI * 2 - 0.075, false);
    ctx.stroke();
    // passage de sortie
    //1
    axis.plot([1.07 * L / (2 * pi), 2.07 * L / (2 * pi)], [0.07 * L / (2 * pi), 0.07 * L / (2 * pi)]);
    axis.plot([1.07 * L / (2 * pi), 2.07 * L / (2 * pi)], [-0.07 * L / (2 * pi), -0.07 * L / (2 * pi)]);

    // passage d'entrée
    axis.plot([-L / pi - 0.07 * L / (2 * pi),
    -L / pi - 0.07 * L / (2 * pi),
    -3 * L / (4 * pi) - 0.035 * L / (2 * pi),
    -3 * L / (4 * pi) - 0.035 * L / (2 * pi),
    -3 * L / (4 * pi) + 0.035 * L / (2 * pi),
    -3 * L / (4 * pi) + 0.035 * L / (2 * pi),
    -1.07 * L / (2 * pi)],
        [L / (2 * pi),
        -0.07 * L / (2 * pi),
        -0.07 * L / (2 * pi),
        -0.055 * L / (2 * pi),
        -0.055 * L / (2 * pi),
        -0.07 * L / (2 * pi),
        -0.07 * L / (2 * pi)]);
    axis.plot([-L / pi + 0.07 * L / (2 * pi), -L / pi + 0.07 * L / (2 * pi), -3 * L / (4 * pi) - 0.035 * L / (2 * pi), -3 * L / (4 * pi) - 0.035 * L / (2 * pi), -3 * L / (4 * pi) + 0.035 * L / (2 * pi), -3 * L / (4 * pi) + 0.035 * L / (2 * pi), -1.07 * L / (2 * pi)], [L / (2 * pi), 0.07 * L / (2 * pi), 0.07 * L / (2 * pi), 0.055 * L / (2 * pi), 0.055 * L / (2 * pi), 0.07 * L / (2 * pi), 0.07 * L / (2 * pi)])

    // feu de signalisation
    axis.patch([-1.505 * L / (2 * pi), -1.495 * L / (2 * pi), -1.495 * L / (2 * pi), -1.505 * L / (2 * pi), -1.505 * L / (2 * pi)], [0.055 * L / (2 * pi), 0.055 * L / (2 * pi), 0.20 * L / (2 * pi), 0.20 * L / (2 * pi), 0.055 * L / (2 * pi)]);
    axis.plot([-1.505 * L / (2 * pi), -1.505 * L / (2 * pi)], [0.055 * L / (2 * pi), 0.20 * L / (2 * pi)]);
    axis.text(-L / (pi), 1.15 * L / (2 * pi), 'Entrée');//,'FontSize',12,'FontName','Garamond','HorizontalAlignment','Center');
    axis.text(-1.5 * L / (2 * pi), -0.18 * L / (2 * pi), 'Accés');//,'FontSize',12,'FontName','Garamond','HorizontalAlignment','Center');

    drawLight();

    // cars
    //1 - onRing
    carsOnRing.forEach((car) => {
        car.draw();
    });
    // 2- onExit
    carsOnExit.forEach((car) => {
        car.draw();
    });
    // 3- onEntry
    carsOnEntry.forEach((car) => {
        car.draw();
    });
}

function drawLight() {
    if (light.isGreen) {
        axis.mark(-1.5 * L / (2 * pi), 0.21 * L / (2 * pi), 14, 'lightgreen');
        axis.mark(-1.5 * L / (2 * pi), 0.27 * L / (2 * pi));
    } else {
        axis.mark(-1.5 * L / (2 * pi), 0.21 * L / (2 * pi));
        axis.mark(-1.5 * L / (2 * pi), 0.27 * L / (2 * pi), 14, 'red');
    }
}

function tick(deltaTime) {
    //2 - moving on ring
    //console.log('go move ! you ' + carsOnRing.length + ' vehicles !')
    carsOnRing.forEach((car) => {
        car.move(deltaTime);
    });
    //console.log('First vehicle id : ' + carsOnRing[0].id);

    // on s'occupe des véhicule en sortie
    carsOnExit.forEach((car) => {
        car.move(deltaTime);
    })

    // on s'occupe des véhicules en entrée 
    carsOnEntry.forEach((car) => {
        car.move(deltaTime);
    });


    // insertor handling
    insertor.tick(deltaTime);
    exitor.tick(deltaTime);
}

function endGame() {
    console.log('PERDU !!!')
    isLost = true;
    running = false;
    timer.stop();
    //ctx.strokeStyle = 'black';
    ctx.fillStyle = 'black';
    ctx.font = '30px sans-serif'
    //ctx.fillRect(canvas.width * 0.25, canvas.height * 0.25, canvas.width * 0.5, canvas.height * 0.5);
    //ctx.rect(canvas.width * 0.25, canvas.height * 0.25, canvas.width * 0.5, canvas.height * 0.5);
    ctx.fillText('PERDU !', canvas.width * 0.48, canvas.height * 0.48);
}

/*

CALLBACKS

*/

buttonPause.onclick = (e) => {
    if (!running && !isLost) {
        if (!isInitialized) {
            initialisation();
        }
        running = true;
        buttonPause.firstChild.data = "Pause"
        timer.start();

    } else {
        running = false;
        buttonPause.firstChild.data = "Lancer"
        timer.stop();
    }
}

buttonReset.onclick = (e) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    isLost = false;
    if (!running) {
        isInitialized = false;
        axis = null;
    } else {
        running = false;
        buttonPause.firstChild.data = "Lancer";
        isInitialized = false;
        axis = null;
        timer.stop();
    }
}

buttonToggle.onclick = (e) => {
    light.toggle();
    if (axis) drawLight();
    //let qent = document.getElementById('Qentree').value;
};
