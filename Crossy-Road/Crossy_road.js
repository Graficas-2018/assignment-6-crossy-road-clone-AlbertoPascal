var renderer = null, 
scene = null, 
camera = null,
root = null,
group = null,
orbitControls = null,
Player = null;

var duration = 20000; // ms

var currentTime = Date.now();

var initTimer = true, time = null, timer = 30;
var highScore = 0, score = 0;

var canvas = null;
var orientation = -1;
var keypressed = false;

var PlayerBox = null, PlayerCollisionbox = null;
var move = null;
var Add_Colliders = [];
var NeedToMove = [];
var movementColliders = [];
var Floor_Blocks = [];
var cars = [];
var wooden_bridges = [];
var PlayerBoxSize = new THREE.Vector3( 1.5, 1.5, 1.5 );

var carAnimation = null, wooden_bridgeAnimation = [], objAnimation = null;

var drowned = false, collideswooden_bridge = false;

var grass_part = 0;
var SafeZone = 0;
var score = 0;

function Grass(position) {
    geometry = new THREE.PlaneGeometry(40, 2, 50, 50);
    var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color:0x00ff00}));
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = -1;
    mesh.position.z = -position * 2;
    mesh.tag = 'grass_part';

    // grass_part collider
    var cubeBBox = new THREE.Box3().setFromObject(mesh);
    cubeBBox.tag = 'grass_part';

    Floor_Blocks.push(cubeBBox);

    var x = Math.floor(Math.random() * 13 - 6) * 2;

    if (position == 0) {
        while (x == Player.position.x)
            x = Math.floor(Math.random() * 13 - 6) * 2;
    }
    //var z = Math.floor(Math.random() * 3) * 2;
    material = new THREE.MeshPhongMaterial({ color: 0x106300 });
    geometry = new THREE.CubeGeometry(2, 5, 2);

    // And put the geometry and material together into a mesh
    var object = new THREE.Mesh(geometry, material);
    object.position.x = x;
    object.position.z = -position * 2;
    object.position.y = 1.5;

    // Collider
    cubeBBox = new THREE.Box3().setFromObject(object);
    //var cubeBBoxHelper = new THREE.BoxHelper(object, 0x00ff00);
    //console.log(cubeBBox);
    Add_Colliders.push(cubeBBox);

    group.add(mesh);
    group.add(object);
    //group.add(cubeBBoxHelper);
}

function Cars(position) {
    geometry = new THREE.PlaneGeometry(40, 1.95, 50, 50);
    mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color:0x669999}));
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = -1;
    mesh.position.z = -position * 2;

    mesh.tag = 'road';

    // road collider
    cubeBBox = new THREE.Box3().setFromObject(mesh);
    cubeBBox.tag = 'road';

    Floor_Blocks.push(cubeBBox);

    geometry = new THREE.PlaneGeometry(40, 0.05, 0.05, 0.05);
    mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color:0xffff99}));
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = -1;
    mesh.position.z = -position * 2;

    mesh.tag = 'road';

    // road collider
    cubeBBox = new THREE.Box3().setFromObject(mesh);
    cubeBBox.tag = 'road';

    Floor_Blocks.push(cubeBBox);

    var color = new THREE.Color("#ff66ff");
    material = new THREE.MeshPhongMaterial({ color: color });
    geometry = new THREE.CubeGeometry(2, 2, 2);

    var object = new THREE.Mesh(geometry, material);
    object.position.z = -position * 2;

    NeedToMove.push(object);
    cars.push(object);

    //var orientation= (Math.random());
    if(orientation<0)
    {
        objectMovementA(object);
        orientation=1;
    }
    else
    {
        objectMovementB(object);
        orientation=-1;
    }
    //objectMovement(object);
    
    group.add(mesh);
    group.add(object);
}

function River(position) {
    geometry = new THREE.PlaneGeometry(40, 2, 50, 50);
    mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color:0x3399ff, side:THREE.DoubleSide}));
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = -1;
    mesh.position.z = -position * 2;
    group.add(mesh);
    //waterCollider
    Water_area = new THREE.Box3().setFromObject(mesh);
    Water_area.tag = 'water';

    Floor_Blocks.push(Water_area);

    //z = Math.floor(Math.random() * 2 + 1) * 2 + 12;

    geometry = new THREE.PlaneGeometry(3, 2, 10, 10);
    object = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({ color: 0x996600 }));
    object.rotation.x = -Math.PI / 2;
    object.position.z = -position * 2;
    object.position.y = -0.99;

    object.tag = 'wooden_bridge';

    NeedToMove.push(object);

    if(orientation<0)
    {
        objectMovementA(object);
        orientation=1;
    }
    else
    {
        objectMovementB(object);
        orientation=-1;
    }

    wooden_bridges.push(object);
    group.add(object);

    wooden_bridgeAnimation.push(new KF.KeyFrameAnimator)
}

function InitializeMap() {

    // We will always start with grass_part to prevent insta deaths. 
    Grass(0);
    Grass(1);
    Grass(2);
    

    var sections=0;
    var floors=0;
    var water=0;
    var grass=0;
    for(var i=3; ; i+=2)
    {
        which=Math.floor(Math.random()*3);

        if(which==0)
        {
            //I put grass
            Grass(i);
            Grass(i+1);

            floors++;
        }
        else if(which==1)
        {
            River(i);
            River(i+1)
            water++;
        }
        else
        {
            Cars(i);
            Cars(i+1);
            grass++;
        }

        if(floors>0 && water>0 && grass>0)
        {
            sections++;
            floors=0;
            water=0;
            grass=0;
        }
        if(sections>5)
        {
            break;
        }
    }
   
}

function onKeyDown(event)
{
    if (!keypressed) {
        switch(event.keyCode)
        {
            case 38:
                Player.position.z -= 2;
                camera.position.z-=2;
                spotLight.position.z-=2;
                camera.rotation.x = -1.249;
                camera.rotation.y= -0.00331147;
                camera.rotation.z=-0.009934;
                spotLight.target.position=Player.position;

                move = 'up';
                score++;

                break;

            case 37:
                Player.position.x -= 2;
                move = 'left';
                break;

            case 39:
                Player.position.x += 2;
                move = 'right';
                break;
        }

        keypressed = true;
    }
}

function onKeyUp(event)
{
    keypressed = false;
}

function OnCollision() {
    //PlayerCollisionbox.update();
    //PlayerBox = new THREE.Box3().setFromObject(Player);
    PlayerBox = new THREE.Box3().setFromCenterAndSize(Player.position, PlayerBoxSize);
    PlayerDownBox = new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(Player.position.x, Player.position.y - 0.5, Player.position.z),
       new THREE.Vector3(0, 1, 0));


    for (var collider of Add_Colliders) {
        if (PlayerBox.intersectsBox(collider)) {
            switch(move) {
                case 'up':
                        Player.position.z += 2;
                        spotLight.position.z -= 1.5;
                        spotLight.target.position=Player.position;
                        score--;
                        break;

                case 'right':
                        Player.position.x -= 2;
                        break;

                case 'left':
                        Player.position.x += 2;
                        break;

                default:
                        break;
            }

            move = 'else';
        }
    }

    SafeZone = 0;
    for (var collider of Floor_Blocks) {
        if (PlayerDownBox.intersectsBox(collider)) {
            if (collider.tag == 'water'){
                drowned = true;
            } else {
                if (collider.tag == 'grass_part' || collider.tag == 'road')
                    SafeZone = 1;
            }
        }
    }

    if (SafeZone == 0)
        drowned = true;

    for (var collider of movementColliders) {
        if (PlayerBox.intersectsBox(collider)) {
            Player.position.x = 0;
            Player.position.y = 0;
            Player.position.z = 0;
            camera.position.set(-.11748, 33.6584, 11.2188);

            //camera.position.z = 0;
            spotLight.position.z = -10;
            score = 0;
        }

        if (PlayerDownBox.intersectsBox(collider)) {
            if (collider.tag == 'wooden_bridge') {
                collideswooden_bridge = true;
                Player.position.x = collider.getCenter().x;
            }
        }
    }

    if (collideswooden_bridge) {
        collideswooden_bridge = false;
        drowned = false;
    }

    if (drowned) {
        Player.position.x = 0;
        Player.position.y = 0;
        Player.position.z = 0;
        collideswooden_bridge = false;
        drowned = false;
        camera.position.set(-.11748, 33.6584, 11.2188);
        camera.rotation.x = -1.249;
        camera.rotation.y= -0.00331147;
        camera.rotation.z=-0.009934;

        //camera.position.z = 0;
        spotLight.position.z = -10;
        score = 0;
    }

    document.getElementById("score").innerHTML = score;

}

function updateMovementColliders() {
    movementColliders = [];
    for (var moveColliders of NeedToMove) {
        cubeBBox = new THREE.Box3().setFromObject(moveColliders);
        if (moveColliders.tag == 'wooden_bridge') {
            //console.log('wooden_bridge');
            cubeBBox.tag = 'wooden_bridge'
            cubeBBox.theObject = movementColliders;
        }

        movementColliders.push(cubeBBox);
    }
}

function objectMovementA(obj) {
    if (obj.tag == 'car')
        duration = (Math.random() * 5 + 1) * 1000;
    else
        duration = (Math.random() * 3 + 3) * 1000;

    objAnimation = new KF.KeyFrameAnimator;
    objAnimation.init({ 
        interps:
            [
                { 
                    keys:[0, 0.2, 0.4, 0.6, 0.8, 1], 
                    values:[
                            { x : 20 },
                            { x: 12 }, 
                            { x: 4 }, 
                            {x: -4 },
                            {x: -12 },
                            {x : -20 },
                            
                            ],
                    target:obj.position
                }
            ],
        loop: true,
        duration: duration
    });
    objAnimation.start();

}
function objectMovementB(obj) {
    if (obj.tag == 'car')
        duration = (Math.random() * 5 + 1) * 1000;
    else
        duration = (Math.random() * 3 + 3) * 1000;

    objAnimation = new KF.KeyFrameAnimator;
    objAnimation.init({ 
        interps:
            [
                { 
                    keys:[0, 0.2, 0.4, 0.6, 0.8, 1], 
                    values:[
                            { x : -20 },
                            { x: -12 }, 
                            { x: -4 }, 
                            {x: 4 },
                            {x: 12 },
                            {x : 20 },
                            
                            ],
                    target:obj.position
                }
            ],
        loop: true,
        duration: duration
    });
    objAnimation.start();

}

function run() {
    requestAnimationFrame(function() { run(); });
    
        // Render the scene
        renderer.render( scene, camera );

        // Update objects that can move
        updateMovementColliders();

        // Collider detection
        OnCollision();

        // Update the animations
        KF.update();

        // Update the camera controller
       // orbitControls.update();
}

var directionalLight = null;
var spotLight = null;
var ambientLight = null;
var mapUrl = "../images/water_texture.jpg";

var SHADOW_MAP_WIDTH = 2048, SHADOW_MAP_HEIGHT = 2048;

function createScene(canvas) {

    this.canvas = canvas;
    
    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    // Set the viewport size
    renderer.setSize(canvas.width, canvas.height);

    // Turn on shadows
    renderer.shadowMap.enabled = true;
    // Options are THREE.BasicShadowMap, THREE.PCFShadowMap, PCFSoftShadowMap
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Create a new Three.js scene
    scene = new THREE.Scene();

    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 4000 );
    camera.position.set(-.11748, 33.6584, 11.2188);

    
    camera.rotation.x = -1.249;
    camera.rotation.y= -0.00331147;
    camera.rotation.z=-0.009934;
    scene.add(camera);

    //orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
        
    // Create a group to hold all the objects
    root = new THREE.Object3D;
    
    spotLight = new THREE.SpotLight (0xffffff);
    spotLight.position.set(-30, 8, -10);
    spotLight.target.position.set(10, 10, 10);
    spotLight.rotation.x=-Math.PI/2;
    root.add(spotLight);


    spotLight.castShadow = true;

    spotLight.shadow.camera.near = 1;
    spotLight.shadow.camera.far = 200;
    spotLight.shadow.camera.fov = 45;
    
    spotLight.shadow.mapSize.width = SHADOW_MAP_WIDTH;
    spotLight.shadow.mapSize.height = SHADOW_MAP_HEIGHT;

    ambientLight = new THREE.AmbientLight ( 0x888888 );
    root.add(ambientLight);
    group = new THREE.Object3D;
    geometry= new THREE.PlaneGeometry(100,100,100);
    material= new THREE.MeshPhongMaterial({color: 0xf99999})

    fondo= new THREE.Mesh(geometry, material);
    fondo.rotation.x=Math.PI/2;
    fondo.position.y=-2;
    group.add(fondo);
    root.add(group);

    var material = new THREE.MeshPhongMaterial({ color: 0xffff00 });
    geometry = new THREE.CubeGeometry(2, 2, 2);

    // And put the geometry and material together into a mesh
    Player = new THREE.Mesh(geometry, material);

    //PlayerCollisionbox =new THREE.BoxHelper(Player, 0x00ff00);



    root.add(Player);
    //root.add(PlayerCollisionbox);

    InitializeMap();


    // Create the animations
    document.getElementById("score").innerHTML = score;

    // Now add the group to our scene
    scene.add( root );
}