import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import ThreeGlobe from "three-globe";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import ISSPath from "./ISS_stationary.glb";

function EarthGlobe() {
  const globeEl = useRef(null);
  useEffect(() => {
    const Globe = new ThreeGlobe()
      .globeImageUrl(
        "//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
      )
      .objectLat("lat")
      .objectLng("lng")
      .objectAltitude("alt")
      .objectFacesSurface(false);

    // Setup renderer
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    globeEl.current.appendChild(renderer.domElement);

    // Setup scene
    const scene = new THREE.Scene();
    scene.add(Globe);
    scene.add(new THREE.AmbientLight(0xcccccc, Math.PI));
    scene.add(new THREE.DirectionalLight(0xffffff, 0.6 * Math.PI));

    // Setup camera
    const camera = new THREE.PerspectiveCamera();
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    camera.position.z = 500;

    // Add camera controls
    const tbControls = new TrackballControls(camera, renderer.domElement);
    tbControls.minDistance = 101;
    tbControls.rotateSpeed = 5;
    tbControls.zoomSpeed = 0.8;

    const loader = new GLTFLoader();
    loader.load(ISSPath, function (object) {
      console.log(object);
      const iss = object.scene;
      iss.position.z = 150
      scene.add(iss);
    });
    
    // Kick-off renderer
    function animate() {
        // IIFE
        // Frame cycle
        tbControls.update();
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }
    setTimeout(() => {
        animate()
    }, 1000);
}, []);

  return <div ref={globeEl} />;
}

export default EarthGlobe;
