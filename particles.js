//SECTION globals
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

let renderList = [];
let prevAnimTime;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


//SECTION event listeners
window.addEventListener("resize",()=>{
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
})

document.addEventListener("keypress", (e)=>{
    if (e.keyCode == 102) {
        console.log(`'F' is pressed`);
        toggleFullScreen()
    }
})

canvas.addEventListener("fullscreenchange",(e)=>{
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
})

//SECTION methods
function toggleFullScreen() {
    if(!document.fullscreenElement) {
        canvas.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}


function Particle (pos, velocity, radius, color, lifetime) {
    
    renderList.push(this);

    this.pos = pos; //position should be an object with x and y variable
    this.velocity = velocity; //again an object with a delta x and delta y
    this.radius = radius;
    this.color = color;
    this.lifetime = lifetime;
    this.age = this.lifetime;
    this.growing = true;
    this.growTime = 0.001;

    this.spawn = function(dTime){
        if((this.growTime/this.age)>=1){
            this.growing = false;
            return;
        } else{
            this.draw(this.radius*(this.growTime/this.age));
            this.growTime -=- (dTime/1000).toFixed(3);
        }
    }

    this.normal = function(dTime){
        //call to render
        this.draw(this.radius*(this.lifetime/this.age));

        //action to be done on each update
        if(this.pos.x - (this.radius*(this.lifetime/this.age)) <= 0 || this.pos.x + this.radius*(this.lifetime/this.age) >= canvas.width){
            this.velocity.x = -this.velocity.x;
        }

        if (this.pos.y - this.radius*(this.lifetime/this.age) <= 0 || this.pos.y + this.radius*(this.lifetime/this.age) >= canvas.height){
            this.velocity.y = -this.velocity.y;
        }

        this.pos.x += this.velocity.x * (dTime/100);
        this.pos.y += this.velocity.y * (dTime/100);
        this.lifetime -= (dTime/1000).toFixed(3);
    }

    this.draw = function(radius) {
        ctx.beginPath();
        ctx.arc(this.pos.x,this.pos.y,radius,0,Math.PI*2)
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    this.update = function(dTime) {
        if(this.growing){
            this.spawn(dTime);
        }
        if(!this.growing){
            this.normal(dTime);
        }
    }
}

let animate = function (currTime){
    if(!prevAnimTime){prevAnimTime=currTime}
    if(currTime == prevAnimTime){
        console.log(`repeated time: ${currTime}`);
    }
    let deltaTime = currTime - prevAnimTime;

    ctx.clearRect(0,0,canvas.width,canvas.height);

    for(let i = 0; i<renderList.length;i++){
        if(renderList[i].lifetime <= 0){
            renderList.splice(i,1);
            let l = Math.floor(700/renderList.length)*2;
            for(let c = 0; c<l;c++){
                createParticle();
            }
            //console.log(`Particle count: ${renderList.length}`);
        } else {
            renderList[i].update(deltaTime);
        }
    }

    let velocitySumX = 0;
    renderList.forEach(element => velocitySumX += Math.abs(element.velocity.x));

    let velocitySumY = 0;
    renderList.forEach(element => velocitySumY += Math.abs(element.velocity.y));

    console.log(`average velocity x: ${velocitySumX/renderList.length} y: ${velocitySumY/renderList.length}`);


    prevAnimTime = currTime;
    requestAnimationFrame(animate);
}

let createParticle = function (){

    let colorRange = [
        "#FFC16E",
        "#FFD69F",
        "#FFFFFF",
        "#DDF7F5",
        "#7AD9D0",
    ]

    let radius = Math.random() * 2 + 2;
    let velocity = {
        x: ((Math.random()-0.5)),
        y: ((Math.random()-0.5)),
    }
    let pos = {
        x: Math.random() * (canvas.width - radius*2)+radius,
        y: Math.random() * (canvas.height - radius*2)+radius,
    }
    let lifetime = Math.floor(Math.random() * 40 + 10);

    let color = colorRange[Math.floor(Math.random()*colorRange.length)];

    new Particle(pos,velocity,radius,color, lifetime);
}

//SECTION runtime
//test
for (let i=0; i<250;i++){
    createParticle();
}

requestAnimationFrame(animate);