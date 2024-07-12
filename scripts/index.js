const init = () => {
  // scene setup
  const clock = new THREE.Clock();
  const scene = new THREE.Scene();
  const worldOctree = new Octree();
  const camera = new THREE.PerspectiveCamera(
    90,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  const renderer = new THREE.WebGLRenderer();

  renderer.setSize(window.innerWidth, window.innerHeight);

  document.body.appendChild(renderer.domElement);

  scene.background = new THREE.Color("#09f");

  const gltfLoader = new GLTFLoader();

  let mapModel = null;

  class Player {
    constructor(y = 0, x = 2) {
      this.lookSpeed = 0.003;
      this.mesh = playerModel;
      this.camera = this.mesh.children[0].children[0].children[0].children[0];
      this.cameraUDGeo = this.mesh.children[0].children[0].children[0];
      ///////////////////////////////////////////////////////////////////////////////////////////////////////

      // this.mesh
      ///////////////////////////////////////////////////////////////////////////////////////////////////////
      this.pointerX = 1200;
      this.pointerY = -60;

      this.x = x * 20;
      this.y = y * 20;

      this.mesh.position.set(this.x, 4.25, this.y);

      this.playerCollider = new Capsule(
        new THREE.Vector3(0, this.mesh.position.y - 1, 0),
        new THREE.Vector3(0, this.mesh.position.y + 1, 0),
        0.5
      );

      this.walkSpeed = 16;
      scene.add(this.mesh);

      this.leftClick = false;
      this.rightClick = false;
      this.moveForward = false;
      this.moveLeft = false;
      this.moveRight = false;
      this.moveBackward = false;

      this._init();
    }
    _init = async () => {
      //adding controls to the page

      let body = document.getElementsByTagName("body")[0];
      body.addEventListener("mousedown", this._onMouseDown);
      body.addEventListener("mouseup", this._onMouseUp);
      body.addEventListener("mousemove", this._onMouseMove);
      body.addEventListener("keydown", this._onKeyDown);
      body.addEventListener("keyup", this._onKeyUp);
      window.addEventListener("resize", () => {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
      });

      // this.mesh.dispatchEvent({ type: "update" });
    };
    update(delta = 0.16) {
      this.mesh.rotation.y = this.pointerX * -this.lookSpeed;

      if (this.pointerY > 300) {
        this.pointerY = 300;
      }
      if (this.pointerY < -300) {
        this.pointerY = -300;
      }
      this.cameraUDGeo.rotation.x = this.pointerY * -this.lookSpeed;
      // console.log(delta)
      let realSpeed = 10 * delta;
      if (this.moveForward) {
        //moving in the direction the player is looking

        this.mesh.position.x +=
          Math.cos(this.mesh.rotation.y + Math.PI * 0.5) * realSpeed;

        this.mesh.position.z -=
          Math.sin(this.mesh.rotation.y + Math.PI * 0.5) * realSpeed;
      }
      if (this.moveLeft) {
        //moving in the direction the player is looking

        this.mesh.position.x +=
          Math.cos(this.mesh.rotation.y + Math.PI) * realSpeed;

        this.mesh.position.z -=
          Math.sin(this.mesh.rotation.y + Math.PI) * realSpeed;
      }
      if (this.moveRight) {
        //moving in the direction the player is looking

        this.mesh.position.x += Math.cos(this.mesh.rotation.y) * realSpeed;

        this.mesh.position.z -= Math.sin(this.mesh.rotation.y) * realSpeed;
      }
      if (this.moveBackward) {
        //moving in the direction the player is looking

        this.mesh.position.x -=
          Math.cos(this.mesh.rotation.y + Math.PI * 0.5) * realSpeed;

        this.mesh.position.z +=
          Math.sin(this.mesh.rotation.y + Math.PI * 0.5) * realSpeed;
      }

      this.playerCollider.start.set(
        this.mesh.position.x,
        this.mesh.position.y + 1,
        this.mesh.position.z
      );
      this.playerCollider.end.set(
        this.mesh.position.x,
        this.mesh.position.y - 1,
        this.mesh.position.z
      );
      let result = worldOctree.capsuleIntersect(this.playerCollider);

      if (result) {
        this.playerCollider.translate(
          result.normal.multiplyScalar(result.depth)
        );
        this.mesh.position.x = this.playerCollider.start.x;
        this.mesh.position.y = this.playerCollider.start.y - 1;
        this.mesh.position.z = this.playerCollider.start.z;
      }
    }
    _onMouseDown = (event) => {
      //fullscreen/lock mouse
      document.getElementsByTagName("body")[0].requestPointerLock();
      document.getElementsByTagName("body")[0].requestFullscreen();
      if (this.health > 0) {
        switch (event.button) {
          case 0:
            this.leftClick = true;
            this.handleShoot();
            break;
          case 2:
            this.rightClick = true;
            this.handleStartADS();
            break;
        }
      }
    };
    _onMouseUp = (event) => {
      switch (event.button) {
        case 0:
          this.leftClick = false;
          break;
        case 2:
          this.rightClick = false;
          this.handleEndADS();
          break;
      }
    };
    _onMouseMove = (event) => {
      if (document.fullscreen) {
        this.pointerX += event.movementX;
        this.pointerX = this.pointerX % ((2 * Math.PI) / this.lookSpeed);
        this.pointerY += event.movementY;
      }
    };
    _onKeyDown = (event) => {
      switch (event.code) {
        case "ArrowUp":
        case "KeyW":
          this.moveForward = true;
          break;

        case "ArrowLeft":
        case "KeyA":
          this.moveLeft = true;
          break;

        case "ArrowDown":
        case "KeyS":
          this.moveBackward = true;
          break;

        case "ArrowRight":
        case "KeyD":
          this.moveRight = true;
          break;

        case "KeyR":
          this.handleReload();
          break;
        case "KeyE":
          this.interacting = true;
          break;

        case "KeyQ":
          this.handleWeaponSwap();
          break;
        case "KeyF":
          this.flashlightOn = !this.flashlightOn;
          break;

        case "ShiftRight":
        case "ShiftLeft":
          this.sprint = true;
          break;
      }
    };
    _onKeyUp = (event) => {
      switch (event.code) {
        case "ArrowUp":
        case "KeyW":
          this.moveForward = false;
          break;

        case "ArrowLeft":
        case "KeyA":
          this.moveLeft = false;
          break;

        case "ArrowDown":
        case "KeyS":
          this.moveBackward = false;
          break;

        case "ArrowRight":
        case "KeyD":
          this.moveRight = false;
          break;

        // case 'keyR':this.reload();break;
        case "KeyE":
          this.interacting = false;
          break;

        case "ShiftRight":
        case "ShiftLeft":
          this.sprint = false;
          break;
      }
    };
  }

  gltfLoader.load(
    `./scripts/staticAssets/fullMap.gltf`,
    function (model) {
      mapModel = model.scene.clone();
      worldOctree.fromGraphNode(mapModel);
      scene.add(mapModel);
    },
    undefined,
    function (error) {
      console.error(error);
    }
  );
  let player = null;
  let playerModel = null;
  gltfLoader.load(
    `./scripts/staticAssets/playerSpawn.gltf`,
    function (model) {
      playerModel = model.scene.clone();

      player = new Player();
      // console.log(player);
      scene.add(playerModel);
    },
    undefined,
    function (error) {
      console.error(error);
    }
  );

  // Scene lighting
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2);
  directionalLight.position.set(1, 1, 1);
  scene.add(directionalLight);

  const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.7);
  directionalLight2.position.set(-1, 1, 1);
  scene.add(directionalLight2);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  ambientLight.position.set(-1, 1, 1);
  scene.add(ambientLight);

  // camera.position.z = 10;
  // camera.position.x = 5;
  // camera.position.y = 2;
  const render = () => {
    let delta = clock.getDelta();
    player.update(delta);
    renderer.render(scene, player.camera);
    requestAnimationFrame(render);
  };
  setTimeout(() => {
    render();
  }, 3000);
};

init();

///////////////////////////////

// const geometry = new THREE.BoxGeometry(1, 1, 1);
// const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
// const cube = new THREE.Mesh(geometry, material);
// scene.add(cube);

// camera.position.z = 5;

// function animate() {
//   renderer.render(scene, camera);
// }
