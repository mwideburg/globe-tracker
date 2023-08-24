import React, { useEffect } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

function ISSModel(props) {
  useEffect(() => {
    const loader = new GLTFLoader();

    loader.load(
      "./ISS_stationary.gbl", // Replace with your model's path
      (gltf) => {
        props.onLoad(gltf.scene);
      },
      undefined,
      (error) =>
        console.error("An error occurred loading the GLTF model:", error)
    );
  }, [props]);

  return null;
}

export default ISSModel;
