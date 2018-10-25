var renderer = null, 
scene = null, 
camera = null,
root = null,
group = null,
orbitControls = null,
Player = null;

var moveup=true, moveleft=true, moveright=true;

var duration = 20000; // ms

var currentTime = Date.now();

var initTimer = true, time = null, timer = 30;
var highScore = 0, score = 0;

var canvas = null;

var keypressed = false;

var PlayerBox = null, PlayerBoxHelper = null;
var move = null;
var colliderObjects = [], moveObjects = [], movementColliders = [], cars = [], woods = [];
var PlayerBoxSize = new THREE.Vector3( 1.5, 1.5, 1.5 );

var carAnimation = null, woodAnimation = [];

function onKeyDown(event)
{
    Collision();
    if (!keypressed) { //this will help me prevent my character from moving more than I want it to
        //console.log(event.keyCode);
        switch(event.keyCode)
        {
            case 38:
                if(moveup)
                {
                    Player.position.z -= 2;

                }
                move = 'up';
                moveright=true;
                moveleft=true;
                break;

            case 37:
                if(moveleft)
                {
                    Player.position.x -= 2;

                }
                else
                {
                    console.log("No me debería poder mover");
                }
                move = 'left';
                moveright=true;
                moveup=true;
                break;

            case 39:
                if(moveright)
                {
                     Player.position.x += 2;

                }
                move = 'right';
                moveup=true;
                moveleft=true;
                break;
        }

        console.log(Player);
        keypressed = true;
    }
}

function onKeyUp(event)
{
    keypressed = false;
}

function Collision() {
    PlayerBoxHelper.update();
    PlayerBox = new THREE.Box3().setFromObject(Player);
    //PlayerBox = new THREE.Box3().setFromCenterAndSize({center: Player.position, size: PlayerBoxSize});

    for (var collider of colliderObjects) {
        if (PlayerBox.intersectsBox(collider)) {
            console.log('Collides');
            switch(move) {
                case 'up':
                        console.log("Can't move up anymore");
                        //Player.position.z += 2;
                        moveup=false;
                        moveright=true;
                        moveleft=true;
                        break;

                case 'right':
                        console.log("can't move right anymore");
                        //Player.position.x -= 2;
                        moveright=false;
                        moveup=true;
                        moveleft=true;
                        break;

                case 'left':
                        //Player.position.x += 2;
                        console.log("can't move left anymore");
                        moveleft=false;
                        moveup=true;
                        moveright=true;
                        break;


                default:
                        break;
            }

            move = 'else';
        }
    }


//this is if it collides with the moving objects
    for (var collider of movementColliders) {
        if (PlayerBox.intersectsBox(collider)) {
            console.log('Collide with moving car');
            Player.position.x=0;
            Player.position.y=-20;
            Player.position.z=0
        }
    }
}

function updateMovementColliders() {
    movementColliders = [];
    for (var moveColliders of moveObjects) {
        BoxCollider = new THREE.Box3().setFromObject(moveColliders);
        movementColliders.push(BoxCollider);
    }
}

function Car_Animation() {

    for (var car of cars) {
        duration = 3000;
        console.log(duration);
        carAnimation = new KF.KeyFrameAnimator;
        carAnimation.init({ 
            interps:
                [
                    { 
                        keys:[0, .5, 1], 
                        values:[
                                { x : 12 },
                                { x : -12 },
                                { x : 12 },
                                ],
                        target:car.position
                    }
                ],
            loop: true,
            duration: duration
        });
        carAnimation.start();
    }
}

function run() {
    requestAnimationFrame(function() { run(); });
    
        // Render the scene
        renderer.render( scene, camera );

        // Update objects that can move
        updateMovementColliders();

        // Collider detection
        Collision();

        // Update the animations
        KF.update();

        // Update the camera controller
        orbitControls.update();
}

function setLightColor(light, r, g, b)
{
    r /= 255;
    g /= 255;
    b /= 255;
    
    light.color.setRGB(r, g, b);
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
    camera.position.set(0, 6, 30);
    scene.add(camera);

    orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
        
    // Create a group to hold all the objects
    root = new THREE.Object3D;
    
    spotLight = new THREE.SpotLight (0xffffff);
    spotLight.position.set(-30, 8, -10);
    spotLight.target.position.set(-2, 0, -2);
    root.add(spotLight);

    spotLight.castShadow = true;

    spotLight.shadow.camera.near = 1;
    spotLight.shadow.camera.far = 200;
    spotLight.shadow.camera.fov = 45;
    
    spotLight.shadow.mapSize.width = SHADOW_MAP_WIDTH;
    spotLight.shadow.mapSize.height = SHADOW_MAP_HEIGHT;

    ambientLight = new THREE.AmbientLight ( 0x888888 );
    root.add(ambientLight);
    
    // Create the objects
    // loadFBX();
    /*geometry = new THREE.BoxBufferGeometry( 1, 1, 1 );
    var object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );
    scene.add(object);*/

    // Create a group to hold the objects
    group = new THREE.Object3D;
    root.add(group);

    // Create a texture map
    var map = new THREE.TextureLoader().load(mapUrl);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(8, 8);

    var color = 0xffffff;

    // Put in a ground plane to show off the lighting
    geometry = new THREE.PlaneGeometry(200, 200, 50, 50);
    var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color:color, map:map, side:THREE.DoubleSide}));

    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = -4.02;
    
    // Add the mesh to our group
    group.add( mesh );
    mesh.castShadow = false;
    mesh.receiveShadow = true;
    x = 6;
    z = 6;
    material = new THREE.MeshPhongMaterial({ color: 0xff54262 });
    geometry = new THREE.CubeGeometry(2, 10, 2);

    // And put the geometry and material together into a mesh
    object = new THREE.Mesh(geometry, material);
    object.position.x = x;
    object.position.z = -z;
    object.position.y = 1.5;

    // Collider
      BoxCollider = new THREE.Box3().setFromObject(object);
      BoxColliderHelper = new THREE.BoxHelper(object, 0x00ff00);
    console.log(BoxCollider);
    colliderObjects.push(BoxCollider);

    group.add(mesh);
    group.add(object);
    

    x = 20;
    z = 20;
    material = new THREE.MeshPhongMaterial({ color: 0xffffff });
    geometry = new THREE.CubeGeometry(2, 2, 2);

    object = new THREE.Mesh(geometry, material);
    object.position.x = x;
    object.position.z = -z;

    BoxCollider = new THREE.Box3().setFromObject(object);
    colliderObjects.push(BoxCollider);

    moveObjects.push(object);
    cars.push(object);
    
    group.add(mesh);
    group.add(object);

    var material = new THREE.MeshPhongMaterial({ color: 0xffffff });
    geometry = new THREE.CubeGeometry(2, 2, 2);

    // And put the geometry and material together into a mesh
    Player = new THREE.Mesh(geometry, material);
    Player.position.x=0;
    Player.position.z=0;

    PlayerBoxHelper =new THREE.BoxHelper(Player, 0x00ff00);

    group.add(Player);
    group.add(PlayerBoxHelper);

   

    // Create the animations
    Car_Animation();

    // Now add the group to our scene
    scene.add( root );
}