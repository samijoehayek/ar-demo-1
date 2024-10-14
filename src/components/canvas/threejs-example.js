import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const ThreeJSAnimation = () => {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const statsRef = useRef(null);
  const modelRef = useRef(null);
  const skeletonRef = useRef(null);
  const mixerRef = useRef(null);
  const clockRef = useRef(new THREE.Clock());
  const guiRef = useRef(null);

  const crossFadeControls = useRef([]);
  const allActions = useRef([]);
  const baseActions = useRef({
    idle: { weight: 1 },
    walk: { weight: 0 },
    run: { weight: 0 },
  });
  const additiveActions = useRef({
    sneak_pose: { weight: 0 },
    sad_pose: { weight: 0 },
    agree: { weight: 0 },
    headShake: { weight: 0 },
  });

  const [currentBaseAction, setCurrentBaseAction] = useState("idle");
  const [panelSettings, setPanelSettings] = useState({
    "modify time scale": 1.0,
  });
  const [numAnimations, setNumAnimations] = useState(0);

  useEffect(() => {
    init();
    return () => {
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (statsRef.current) {
        document.body.removeChild(statsRef.current.dom);
      }
      if (guiRef.current) {
        guiRef.current.destroy();
      }
      window.removeEventListener("resize", onWindowResize);
    };
  }, []);

  const init = () => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xa0a0a0);
    scene.fog = new THREE.Fog(0xa0a0a0, 10, 50);

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

    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshPhongMaterial({ color: 0xcbcbcb, depthWrite: false })
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    scene.add(mesh);

    const loader = new GLTFLoader();
    loader.load("./cristiano-ronaldo/RonaldoAnimationGLTF.gltf", (gltf) => {
      modelRef.current = gltf.scene;
      scene.add(gltf.scene);

      modelRef.current.traverse((object) => {
        if (object.isMesh) object.castShadow = true;
      });

      skeletonRef.current = new THREE.SkeletonHelper(modelRef.current);
      skeletonRef.current.visible = false;
      scene.add(skeletonRef.current);

      const animations = gltf.animations;
      mixerRef.current = new THREE.AnimationMixer(modelRef.current);

      setNumAnimations(animations.length);

      for (let i = 0; i !== animations.length; ++i) {
        let clip = animations[i];
        const name = clip.name;

        if (baseActions.current[name]) {
          const action = mixerRef.current.clipAction(clip);
          activateAction(action);
          baseActions.current[name].action = action;
          allActions.current.push(action);
        } else if (additiveActions.current[name]) {
          THREE.AnimationUtils.makeClipAdditive(clip);

          if (clip.name.endsWith("_pose")) {
            clip = THREE.AnimationUtils.subclip(clip, clip.name, 2, 3, 30);
          }

          const action = mixerRef.current.clipAction(clip);
          activateAction(action);
          additiveActions.current[name].action = action;
          allActions.current.push(action);
        }
      }

      //   createPanel();
      //   animate();
    });

    rendererRef.current = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current.setPixelRatio(window.devicePixelRatio);
    rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    rendererRef.current.shadowMap.enabled = true;
    containerRef.current.appendChild(rendererRef.current.domElement);

    cameraRef.current = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      1,
      100
    );
    cameraRef.current.position.set(-1, 2, 3);

    const controls = new OrbitControls(
      cameraRef.current,
      rendererRef.current.domElement
    );
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.target.set(0, 1, 0);
    controls.update();

    statsRef.current = new Stats();
    document.body.appendChild(statsRef.current.dom);

    window.addEventListener("resize", onWindowResize);
  };

  //   const createPanel = () => {
  //     guiRef.current = new GUI({ width: 310 });

  //     const folder1 = guiRef.current.addFolder("Base Actions");
  //     const folder2 = guiRef.current.addFolder("Additive Action Weights");
  //     const folder3 = guiRef.current.addFolder("General Speed");

  //     const baseNames = ["None", ...Object.keys(baseActions.current)];

  //     for (let i = 0; i < baseNames.length; i++) {
  //       const name = baseNames[i];
  //       const settings = baseActions.current[name];
  //       panelSettings[name] = () => {
  //         const currentSettings = baseActions.current[currentBaseAction];
  //         const currentAction = currentSettings ? currentSettings.action : null;
  //         const action = settings ? settings.action : null;

  //         if (currentAction !== action) {
  //           prepareCrossFade(currentAction, action, 0.35);
  //         }
  //       };

  //       crossFadeControls.current.push(folder1.add(panelSettings, name));
  //     }

  //     for (const name of Object.keys(additiveActions.current)) {
  //       const settings = additiveActions.current[name];
  //       panelSettings[name] = settings.weight;
  //       folder2
  //         .add(panelSettings, name, 0.0, 1.0, 0.01)
  //         .listen()
  //         .onChange((weight) => {
  //           setWeight(settings.action, weight);
  //           settings.weight = weight;
  //         });
  //     }

  //     folder3
  //       .add(panelSettings, "modify time scale", 0.0, 1.5, 0.01)
  //       .onChange(modifyTimeScale);

  //     folder1.open();
  //     folder2.open();
  //     folder3.open();

  //     crossFadeControls.current.forEach((control) => {
  //       control.setInactive = () => {
  //         control.domElement.classList.add("control-inactive");
  //       };

  //       control.setActive = () => {
  //         control.domElement.classList.remove("control-inactive");
  //       };

  //       const settings = baseActions.current[control.property];

  //       if (!settings || !settings.weight) {
  //         control.setInactive();
  //       }
  //     });

  //     setPanelSettings({ ...panelSettings });
  //   };

  //   const prepareCrossFade = (startAction, endAction, duration) => {
  //     if (currentBaseAction === "idle" || !startAction || !endAction) {
  //       executeCrossFade(startAction, endAction, duration);
  //     } else {
  //       synchronizeCrossFade(startAction, endAction, duration);
  //     }

  //     if (endAction) {
  //       const clip = endAction.getClip();
  //       setCurrentBaseAction(clip.name);
  //     } else {
  //       setCurrentBaseAction("None");
  //     }

  //     crossFadeControls.current.forEach((control) => {
  //       const name = control.property;

  //       if (name === currentBaseAction) {
  //         control.setActive();
  //       } else {
  //         control.setInactive();
  //       }
  //     });
  //   };

  const executeCrossFade = (startAction, endAction, duration) => {
    if (endAction) {
      setWeight(endAction, 1);
      endAction.time = 0;

      if (startAction) {
        startAction.crossFadeTo(endAction, duration, true);
      } else {
        endAction.fadeIn(duration);
      }
    } else {
      startAction.fadeOut(duration);
    }
  };

  const synchronizeCrossFade = (startAction, endAction, duration) => {
    mixerRef.current.addEventListener("loop", onLoopFinished);

    function onLoopFinished(event) {
      if (event.action === startAction) {
        mixerRef.current.removeEventListener("loop", onLoopFinished);
        executeCrossFade(startAction, endAction, duration);
      }
    }
  };

  const setWeight = (action, weight) => {
    action.enabled = true;
    action.setEffectiveTimeScale(1);
    action.setEffectiveWeight(weight);
  };

  const modifyTimeScale = (speed) => {
    mixerRef.current.timeScale = speed;
  };

  const activateAction = (action) => {
    const clip = action.getClip();
    const settings =
      baseActions.current[clip.name] || additiveActions.current[clip.name];
    setWeight(action, settings.weight);
    action.play();
  };

  //   const animate = () => {
  //     requestAnimationFrame(animate);

  //     for (let i = 0; i !== numAnimations; ++i) {
  //       const action = allActions.current[i];
  //       const clip = action.getClip();
  //       const settings =
  //         baseActions.current[clip.name] || additiveActions.current[clip.name];
  //       settings.weight = action.getEffectiveWeight();
  //     }

  //     const mixerUpdateDelta = clockRef.current.getDelta();
  //     mixerRef.current.update(mixerUpdateDelta);

  //     rendererRef.current.render(scene, cameraRef.current);
  //     statsRef.current.update();
  //   };

  const onWindowResize = () => {
    cameraRef.current.aspect = window.innerWidth / window.innerHeight;
    cameraRef.current.updateProjectionMatrix();
    rendererRef.current.setSize(window.innerWidth, window.innerHeight);
  };

  return <div ref={containerRef} />;
};

export default ThreeJSAnimation;
