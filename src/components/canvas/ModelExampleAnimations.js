"use client";
import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const ThreeScene = () => {
  const mountRef = useRef(null);
  const [animationActions, setAnimationActions] = useState([]);
  const [currentAnimation, setCurrentAnimation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xa0a0a0);
    scene.fog = new THREE.Fog(0xa0a0a0, 10, 50);

    // Lighting
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 3);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 3);
    dirLight.position.set(3, 10, 10);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 2;
    dirLight.shadow.camera.bottom = -2;
    dirLight.shadow.camera.left = -2;
    dirLight.shadow.camera.right = 2;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 40;
    scene.add(dirLight);

    // Mesh Settings
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshPhongMaterial({ color: 0xcbcbcb, depthWrite: false })
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    scene.add(mesh);

    // Camera position
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      1,
      100
    );
    camera.position.set(-3, 1, 4);

    // Animation mixer
    const mixer = new THREE.AnimationMixer(scene);

    // GLTF Loader
    const loader = new GLTFLoader();
    loader.load(
      "./cristiano-ronaldo/RonaldoAnimationGLTF.gltf", // Replace with your model path
      (gltf) => {
        // Scene Settings
        scene.add(gltf.scene);

        // Model Settings
        const model = gltf.scene;
        model.traverse((object) => {
          if (object.isMesh) object.castShadow = true;
        });

        // Skeleton Settings
        const skeleton = new THREE.SkeletonHelper(model);
        skeleton.visible = false;
        scene.add(skeleton);

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
        // Set loading to false when the model is fully loaded
        setIsLoading(false);
      },
      (xhr) => {
        const progress = (xhr.loaded / xhr.total) * 100;
        setLoadingProgress(Math.round(progress));
      },
      (error) => {
        console.error("An error happened", error);
        setIsLoading(false);
      }
    );

    // Renderer Settings
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.target.set(0, 1, 0);
    controls.update();

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
    <div style={{ position: "relative" }}>
      <div ref={mountRef} />
      {isLoading && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            color: "white",
            fontSize: "24px",
          }}
        >
          Loading... {loadingProgress}%
        </div>
      )}
      {!isLoading && (
        <div>
          <h3>Animations:</h3>
          {animationActions.map(({ name }) => (
            <button key={name} onClick={() => changeAnimation(name)}>
              {name}
            </button>
          ))}
          <p>Current Animation: {currentAnimation}</p>
        </div>
      )}
    </div>
  );
};

export default ThreeScene;
