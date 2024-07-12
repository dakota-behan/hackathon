import * as THREE from "./three.js";
import Octree from "./Octree.js";
import { GLTFLoader } from "./GLTFLoader.js";
import { Capsule } from "./Capsule.js";
import { TextGeometry } from "./TextGeometry.js";
import { FontLoader } from "./FontLoader.js";

let canControl = false;
const changeControl = (bool = !canControl) => {
  canControl = bool;
};

addFunction("changeControl", changeControl);

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
      body.addEventListener("mousemove", this._onMouseMove);
      body.addEventListener("keydown", this._onKeyDown);
      body.addEventListener("keyup", this._onKeyUp);
      window.addEventListener("resize", () => {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
      });
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);
      this.mesh.rotation.y = this.pointerX * -this.lookSpeed;
      this.cameraUDGeo.rotation.x = this.pointerY * -this.lookSpeed;
      // this.mesh.dispatchEvent({ type: "update" });
    };
    update(delta = 0.16) {
      // console.log(this.mesh.position.x, this.mesh.position.z);
      this.mesh.position.y -= 0.05;
      if (canControl) {
        this.mesh.rotation.y =
          this.pointerX * -this.lookSpeed * (canControl ? 1 : 0);

        if (this.pointerY > 300) {
          this.pointerY = 300;
        }
        if (this.pointerY < -300) {
          this.pointerY = -300;
        }
        this.cameraUDGeo.rotation.x =
          this.pointerY * -this.lookSpeed * (canControl ? 1 : 0);
      }
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
      if (canControl) {
        document.getElementsByTagName("body")[0].requestPointerLock();
        document.getElementsByTagName("body")[0].requestFullscreen();
      }
    };

    _onMouseMove = (event) => {
      if (document.fullscreen && canControl) {
        this.pointerX += event.movementX;
        this.pointerX =
          (this.pointerX % ((2 * Math.PI) / this.lookSpeed)) *
          (canControl ? 1 : 0);
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
      scene.add(mapModel);
    },
    undefined,
    function (error) {
      console.error(error);
    }
  );
  gltfLoader.load(
    `./scripts/staticAssets/colMesh.gltf`,
    function (model) {
      worldOctree.fromGraphNode(model.scene);
      // scene.add(model);
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
      model.scene.children[0].children[0].children[0].children[0].fov = 100;
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

  const glowTexture = new THREE.TextureLoader().load(
    "./scripts/staticAssets/waypointTexture.png"
  );

  const fontLoader = new FontLoader();

  glowTexture.repeat.set(1, 1.6);

  const interactionSpots = {
    mailbox: {
      cordX: 33,
      cordY: 14,
      text: "FEEDBACK",
      documentElement: "feedback",
    },
    menu: {
      cordX: 31.5,
      cordY: 21.5,
      text: "MENU",
      documentElement: "menu",
    },
    boardgames: {
      cordX: 37,
      cordY: 34,
      text: "BOARD GAME\nLIST",
      documentElement: "boardgames",
    },
    reservationCalender: {
      cordX: 25.5,
      cordY: 28,
      text: "RESERVATIONS",
      documentElement: "reservation",
    },
  };

  fontLoader.load(
    "./scripts/staticAssets/helvetiker_regular.typeface.json",
    (font) => {
      for (let key in interactionSpots) {
        const e = interactionSpots[key];

        const cylinderGeo = new THREE.CylinderGeometry(
          2.5,
          2.5,
          10,
          16,
          1,
          true
        );
        const cylinderMat = new THREE.MeshStandardMaterial({
          side: 2,
          map: glowTexture,
          transparent: true,
        });
        const cylinderMesh = new THREE.Mesh(cylinderGeo, cylinderMat);
        cylinderMesh.position.x = e.cordX;
        cylinderMesh.position.y = 5;
        cylinderMesh.position.z = e.cordY;
        scene.add(cylinderMesh);
        console.log(key);
        const geometry = new TextGeometry(e.text, {
          font: font,
          size: 0.5,
          height: 0.5,
          curveSegments: 8,
          bevelEnabled: true,
          bevelThickness: 0.125,
          bevelSize: 0.025,
          bevelOffset: 0,
          bevelSegments: 4,
        });
        geometry.center();
        // material, mesh
        const material = new THREE.MeshNormalMaterial();
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = e.cordX;
        mesh.position.y = 8;
        mesh.position.z = e.cordY;
        scene.add(mesh);

        const openModal = (key) => {
          console.log(key);
          if (key == "e" && e.inRange) {
            changeControl(false);
            document
              .getElementById(e.documentElement)
              .classList.remove("hidden");
            document.exitPointerLock();
          }
        };

        document.addEventListener("keydown", (e) => openModal(e.key));

        const recursiveCheck = () => {
          if (!player) {
            setTimeout(() => {
              try {
                recursiveCheck();
              } catch (e) {}
            }, 1000 / 60);
          }
          mesh.rotation.y += 0.01;

          const distance = player.mesh.position.distanceTo(mesh.position);
          if (distance < 5) {
            e.inRange = true;
          } else {
            e.inRange = false;
          }

          setTimeout(() => {
            try {
              recursiveCheck();
            } catch (e) {}
          }, 1000 / 60);
        };
        try {
          recursiveCheck();
        } catch (e) {}
      }
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

  const render = () => {
    let delta = clock.getDelta();
    player.update(delta);
    renderer.render(scene, player.camera);
    requestAnimationFrame(render);
  };
  setTimeout(() => {
    render();
  }, 1000);

  document.getElementById("enterGameButton").addEventListener("click", () => {
    document.getElementById("initalMenu").classList.add("hidden");
    document.getElementsByTagName("body")[0].requestPointerLock();
    document.getElementsByTagName("body")[0].requestFullscreen();
    changeControl(true);
  });
  console.log(document.getElementsByClassName("closeBtn"));
  [...document.getElementsByClassName("closeBtn")].forEach((el) => {
    console.log(el);
    el.addEventListener("click", () => {
      console.log("clickX");
      document.getElementById("initalMenu").classList.add("hidden");
      document.getElementById("menu").classList.add("hidden");
      document.getElementById("reservation").classList.add("hidden");
      document.getElementById("feedback").classList.add("hidden");
      document.getElementById("boardgames").classList.add("hidden");
      changeControl(true);
      document.getElementsByTagName("body")[0].requestPointerLock();
      document.getElementsByTagName("body")[0].requestFullscreen();
    });
  });
};

init();

// mailbox = 33,13
// menu = 31.5, 21.5
// boardgames = 37, 34
// reservation / calender = 25.5,26
