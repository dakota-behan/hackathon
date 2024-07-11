import * as THREE from "./three.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const controls = new OrbitControls(camera, renderer.domElement);
const loader = new GLTFLoader();

// npm install --save three
// npm install --save-dev vite
// npx vite
// npx serve .

console.log("You are connected");
console.log("\n---------------\n");
// const test1 = document.getElementById('first')
// const test2 = document.getElementById('test')
// console.log(test1.innerText)
// console.log(test2.innerText)
