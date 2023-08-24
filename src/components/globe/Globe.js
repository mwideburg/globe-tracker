import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import ThreeGlobe from "three-globe";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import ISSPath from "./ISS_stationary.glb";
import axios from "axios";

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
    let iss;
    const loader = new GLTFLoader();
    const EARTH_RADIUS = 6371; // Earth radius in kilometers
    const ISS_ALTITUDE = 50; // average altitude of ISS in kilometers (this is an approximation)
    function latLongToVector3(lat, lon, radius) {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);

      const x = -((radius + ISS_ALTITUDE) * Math.sin(phi) * Math.cos(theta));
      const y = (radius + ISS_ALTITUDE) * Math.cos(phi); 
      const z = (radius + ISS_ALTITUDE) * Math.sin(phi) * Math.sin(theta);

      return new THREE.Vector3(x, y, z);
    }

    loader.load(ISSPath, function (object) {
      console.log(object);
      iss = object.scene;
      iss.scale.set(0.4, 0.4, 0.4);

      // We'll use an example latitude and longitude for this case.
      const latitude = 0; // replace with actual latitude
      const longitude = 0; // replace with actual longitude
      const position = latLongToVector3(
        latitude,
        longitude,
        EARTH_RADIUS
      );

      iss.position.set(position.x, position.y, position.z);
      iss.lookAt(new THREE.Vector3(0, 0, 0));
      iss.rotateY(90)
      iss.rotateY(Math.PI);
      scene.add(iss);
    });

    // function latLongToVector3(latitude, longitude, radius) {
    //   const lat = THREE.MathUtils.degToRad(90 - latitude);
    //   const lon = THREE.MathUtils.degToRad(longitude);

    //   const x = radius * Math.sin(lat) * Math.cos(lon);
    //   const y = radius * Math.cos(lat);
    //   const z = radius * Math.sin(lat) * Math.sin(lon);

    //   return new THREE.Vector3(x, y, z);
    // }

    const updateIssLocation = async () => {
      try {
        return axios.get("http://api.open-notify.org/iss-now.json");
      } catch (err) {
        console.log(err);
      }
    };

    setInterval(async () => {
      const res = await updateIssLocation()
        .then((data) => {
          if (data.data.iss_position) {
            const latitude = parseFloat(data.data.iss_position.latitude);
            const longitude = parseFloat(data.data.iss_position.longitude);

            const earthRadius = 100; // This value should match the radius you're using for the Earth in your 3D scene
            const issAltitude = 1.5; // This is an example value; you'd replace it with the actual altitude from your data (if available) or an approximation.
            const issPosition = latLongToVector3(
              latitude,
              longitude,
              earthRadius + issAltitude
            );

            iss.position.set(issPosition.x, issPosition.y, issPosition.z);
          }
        })
        .catch((error) => {
          console.log(error); // Handle the error
        });
    }, 1000);

    // Kick-off renderer
    function animate() {
      // IIFE
      // Frame cycle
      tbControls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    setTimeout(() => {
      animate();
    }, 1000);
  }, []);

  return <div ref={globeEl} />;
}

export default EarthGlobe;
