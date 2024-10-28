"use client";
import React, { useRef, useEffect, useState } from "react";
import { useProgress } from "@react-three/drei";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import LoaderMT from "../loader/LoaderMT";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass';

const ThreeScene = () => {
  const mountRef = useRef(null);
  const { progress } = useProgress();
  // const [animationActions, setAnimationActions] = useState([]);
  // const [currentAnimation, setCurrentAnimation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  console.log(loadingProgress);

  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xa0a0a0);
    scene.fog = new THREE.Fog(0xa0a0a0, 10, 50);

    // Camera position
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      1,
      100
    );
    camera.position.set(-3, 1, 4);

    // Renderer Settings
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    // Post-processing setup
    const composer = new EffectComposer(renderer);

    // Add standard render pass
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    // Add afterimage pass for motion blur effect
    const afterimagePass = new AfterimagePass(0.3); // Value between 0 and 1
    composer.addPass(afterimagePass);

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

    // Animation mixer
    const mixer = new THREE.AnimationMixer(scene);

    // GLTF Loader
    const loader = new GLTFLoader();
    loader.load(
      "./cristiano-ronaldo-2/ronaldo_Animation.gltf", // Replace with your model path
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
          // setAnimationActions(actions);

          // Start the first animation by default
          if (actions.length > 0) {
            actions[0].action.play();
            // setCurrentAnimation(actions[0].name);
          }
        }
        // Set loading to false when the model is fully loaded
        setIsLoading(false);
      },
      (xhr) => {
        console.log(xhr);
        setLoadingProgress(Math.round(progress));
      },
      (error) => {
        console.error("An error happened", error);
        setIsLoading(false);
      }
    );

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
      composer.render();
      // renderer.render(scene, camera);
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
  // const changeAnimation = (animationName) => {
  //   animationActions.forEach(({ name, action }) => {
  //     if (name === animationName) {
  //       action.play();
  //       // setCurrentAnimation(name);
  //     } else {
  //       action.stop();
  //     }
  //   });
  // };

  return (
    <div style={{ position: "relative" }}>
      <div ref={mountRef} />
      {isLoading && <LoaderMT progress={progress} />}
      {/* {!isLoading && (
        <div className="absolute top-4 left-4 bg-white p-4 rounded shadow">
          <h3 className="text-lg font-bold mb-2">Animations:</h3>
          <div className="flex flex-wrap gap-2">
            {animationActions.map(({ name }) => (
              <button
                key={name}
                onClick={() => changeAnimation(name)}
                className="px-3 py-1 bg-blue-500 text-black rounded hover:bg-blue-600 transition-colors"
              >
                {name}
              </button>
            ))}
          </div>
          <p className="mt-2">Current Animation: {currentAnimation}</p>
        </div>
      )} */}
    </div>
  );
};

export default ThreeScene;
