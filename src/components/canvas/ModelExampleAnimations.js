import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const ThreeScene = () => {
  const mountRef = useRef(null);
  const [animationActions, setAnimationActions] = useState([]);
  const [currentAnimation, setCurrentAnimation] = useState(null);

  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer();

    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 1, 0);
    scene.add(directionalLight);

    // Camera position
    camera.position.z = 5;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);

    // Animation mixer
    const mixer = new THREE.AnimationMixer(scene);

    // GLTF Loader
    const loader = new GLTFLoader();
    loader.load(
      "./cristiano-ronaldo/ssdfsdfsfd.gltf", // Replace with your model path
      (gltf) => {
        scene.add(gltf.scene);

        // Process animations
        const animations = gltf.animations;
        if (animations && animations.length) {
          const actions = animations.map((animation) => {
            const action = mixer.clipAction(animation);
            return { name: animation.name, action };
          });
          setAnimationActions(actions);

          // Start the first animation by default
          if (actions.length > 0) {
            actions[0].action.play();
            setCurrentAnimation(actions[0].name);
          }
        }
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      (error) => {
        console.error("An error happened", error);
      }
    );

    // Animation loop
    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);
      const delta = clock.getDelta();
      mixer.update(delta);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  // Function to change animation
  const changeAnimation = (animationName) => {
    animationActions.forEach(({ name, action }) => {
      if (name === animationName) {
        action.play();
        setCurrentAnimation(name);
      } else {
        action.stop();
      }
    });
  };

  return (
    <div>
      <div ref={mountRef} />
      <div>
        <h3>Animations:</h3>
        {animationActions.map(({ name }) => (
          <button key={name} onClick={() => changeAnimation(name)}>
            {name}
          </button>
        ))}
      </div>
      <p>Current Animation: {currentAnimation}</p>
    </div>
  );
};

export default ThreeScene;
