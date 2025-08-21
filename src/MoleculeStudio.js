import React, { useState, useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';

const MoleculeStudio = () => {
  const [selectedMolecule, setSelectedMolecule] = useState('');
  const [moleculeData, setMoleculeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [autoRotate, setAutoRotate] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [viewMode, setViewMode] = useState('ball-stick');
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const frameId = useRef(null);
  const rotationSpeed = useRef(0.01);
  const controlsRef = useRef({ mouseDown: false, mouseX: 0, mouseY: 0 });

  // Built-in molecular database
  const moleculeDatabase = useMemo(() => ({
    water: {
      name: "Water",
      formula: "H₂O",
      description: "Essential for life, water is a polar molecule with unique properties.",
      molarMass: "18.02 g/mol",
      boilingPoint: "100°C",
      meltingPoint: "0°C",
      elements: {
        H: { radius: 0.3, color: "#FFFFFF", name: "Hydrogen" },
        O: { radius: 0.6, color: "#FF0D0D", name: "Oxygen" }
      },
      atoms: [
        { id: "O-1", element: "O", position: [0.0, 0.0, 0.0] },
        { id: "H-1", element: "H", position: [0.757, 0.586, 0.0] },
        { id: "H-2", element: "H", position: [-0.757, 0.586, 0.0] }
      ],
      bonds: [
        { atom1: "O-1", atom2: "H-1", type: "single" },
        { atom1: "O-1", atom2: "H-2", type: "single" }
      ]
    },
    methane: {
      name: "Methane",
      formula: "CH₄",
      description: "The simplest hydrocarbon and main component of natural gas.",
      molarMass: "16.04 g/mol",
      boilingPoint: "-162°C",
      meltingPoint: "-182°C",
      elements: {
        C: { radius: 0.7, color: "#909090", name: "Carbon" },
        H: { radius: 0.3, color: "#FFFFFF", name: "Hydrogen" }
      },
      atoms: [
        { id: "C-1", element: "C", position: [0.0, 0.0, 0.0] },
        { id: "H-1", element: "H", position: [1.09, 0.0, 0.0] },
        { id: "H-2", element: "H", position: [-0.36, 1.03, 0.0] },
        { id: "H-3", element: "H", position: [-0.36, -0.52, 0.89] },
        { id: "H-4", element: "H", position: [-0.36, -0.52, -0.89] }
      ],
      bonds: [
        { atom1: "C-1", atom2: "H-1", type: "single" },
        { atom1: "C-1", atom2: "H-2", type: "single" },
        { atom1: "C-1", atom2: "H-3", type: "single" },
        { atom1: "C-1", atom2: "H-4", type: "single" }
      ]
    },
    ammonia: {
      name: "Ammonia",
      formula: "NH₃",
      description: "A compound essential for fertilizer production and biological processes.",
      molarMass: "17.03 g/mol",
      boilingPoint: "-33°C",
      meltingPoint: "-78°C",
      elements: {
        N: { radius: 0.65, color: "#3050F8", name: "Nitrogen" },
        H: { radius: 0.3, color: "#FFFFFF", name: "Hydrogen" }
      },
      atoms: [
        { id: "N-1", element: "N", position: [0.0, 0.0, 0.0] },
        { id: "H-1", element: "H", position: [0.0, 1.01, 0.0] },
        { id: "H-2", element: "H", position: [0.87, -0.51, 0.0] },
        { id: "H-3", element: "H", position: [-0.87, -0.51, 0.0] }
      ],
      bonds: [
        { atom1: "N-1", atom2: "H-1", type: "single" },
        { atom1: "N-1", atom2: "H-2", type: "single" },
        { atom1: "N-1", atom2: "H-3", type: "single" }
      ]
    },
    "carbon-dioxide": {
      name: "Carbon Dioxide",
      formula: "CO₂",
      description: "A linear molecule important in photosynthesis and climate change.",
      molarMass: "44.01 g/mol",
      boilingPoint: "-78°C (sublimes)",
      meltingPoint: "-78°C",
      elements: {
        C: { radius: 0.7, color: "#909090", name: "Carbon" },
        O: { radius: 0.6, color: "#FF0D0D", name: "Oxygen" }
      },
      atoms: [
        { id: "C-1", element: "C", position: [0.0, 0.0, 0.0] },
        { id: "O-1", element: "O", position: [1.16, 0.0, 0.0] },
        { id: "O-2", element: "O", position: [-1.16, 0.0, 0.0] }
      ],
      bonds: [
        { atom1: "C-1", atom2: "O-1", type: "double" },
        { atom1: "C-1", atom2: "O-2", type: "double" }
      ]
    },
    ethylene: {
      name: "Ethylene",
      formula: "C₂H₄",
      description: "An important industrial chemical and plant hormone.",
      molarMass: "28.05 g/mol",
      boilingPoint: "-104°C",
      meltingPoint: "-169°C",
      elements: {
        C: { radius: 0.7, color: "#909090", name: "Carbon" },
        H: { radius: 0.3, color: "#FFFFFF", name: "Hydrogen" }
      },
      atoms: [
        { id: "C-1", element: "C", position: [0.67, 0.0, 0.0] },
        { id: "C-2", element: "C", position: [-0.67, 0.0, 0.0] },
        { id: "H-1", element: "H", position: [1.23, 0.92, 0.0] },
        { id: "H-2", element: "H", position: [1.23, -0.92, 0.0] },
        { id: "H-3", element: "H", position: [-1.23, 0.92, 0.0] },
        { id: "H-4", element: "H", position: [-1.23, -0.92, 0.0] }
      ],
      bonds: [
        { atom1: "C-1", atom2: "C-2", type: "double" },
        { atom1: "C-1", atom2: "H-1", type: "single" },
        { atom1: "C-1", atom2: "H-2", type: "single" },
        { atom1: "C-2", atom2: "H-3", type: "single" },
        { atom1: "C-2", atom2: "H-4", type: "single" }
      ]
    },
    ethanol: {
      name: "Ethanol",
      formula: "C₂H₆O",
      description: "Commonly known as alcohol, used in beverages and as fuel.",
      molarMass: "46.07 g/mol",
      boilingPoint: "78°C",
      meltingPoint: "-114°C",
      elements: {
        C: { radius: 0.7, color: "#909090", name: "Carbon" },
        H: { radius: 0.3, color: "#FFFFFF", name: "Hydrogen" },
        O: { radius: 0.6, color: "#FF0D0D", name: "Oxygen" }
      },
      atoms: [
        { id: "C-1", element: "C", position: [-1.31, -0.35, 0.0] },
        { id: "C-2", element: "C", position: [0.18, 0.0, 0.0] },
        { id: "O-1", element: "O", position: [1.31, -0.78, 0.0] },
        { id: "H-1", element: "H", position: [-1.31, -1.44, 0.0] },
        { id: "H-2", element: "H", position: [-1.85, 0.09, 0.89] },
        { id: "H-3", element: "H", position: [-1.85, 0.09, -0.89] },
        { id: "H-4", element: "H", position: [0.18, 1.09, 0.0] },
        { id: "H-5", element: "H", position: [0.72, -0.44, 0.89] },
        { id: "H-6", element: "H", position: [2.16, -0.48, 0.0] }
      ],
      bonds: [
        { atom1: "C-1", atom2: "C-2", type: "single" },
        { atom1: "C-2", atom2: "O-1", type: "single" },
        { atom1: "C-1", atom2: "H-1", type: "single" },
        { atom1: "C-1", atom2: "H-2", type: "single" },
        { atom1: "C-1", atom2: "H-3", type: "single" },
        { atom1: "C-2", atom2: "H-4", type: "single" },
        { atom1: "C-2", atom2: "H-5", type: "single" },
        { atom1: "O-1", atom2: "H-6", type: "single" }
      ]
    },
    benzene: {
      name: "Benzene",
      formula: "C₆H₆",
      description: "An aromatic hydrocarbon with a distinctive ring structure.",
      molarMass: "78.11 g/mol",
      boilingPoint: "80°C",
      meltingPoint: "5°C",
      elements: {
        C: { radius: 0.7, color: "#909090", name: "Carbon" },
        H: { radius: 0.3, color: "#FFFFFF", name: "Hydrogen" }
      },
      atoms: [
        { id: "C-1", element: "C", position: [1.21, 0.70, 0.0] },
        { id: "C-2", element: "C", position: [1.21, -0.70, 0.0] },
        { id: "C-3", element: "C", position: [0.0, -1.40, 0.0] },
        { id: "C-4", element: "C", position: [-1.21, -0.70, 0.0] },
        { id: "C-5", element: "C", position: [-1.21, 0.70, 0.0] },
        { id: "C-6", element: "C", position: [0.0, 1.40, 0.0] },
        { id: "H-1", element: "H", position: [2.15, 1.24, 0.0] },
        { id: "H-2", element: "H", position: [2.15, -1.24, 0.0] },
        { id: "H-3", element: "H", position: [0.0, -2.48, 0.0] },
        { id: "H-4", element: "H", position: [-2.15, -1.24, 0.0] },
        { id: "H-5", element: "H", position: [-2.15, 1.24, 0.0] },
        { id: "H-6", element: "H", position: [0.0, 2.48, 0.0] }
      ],
      bonds: [
        { atom1: "C-1", atom2: "C-2", type: "single" },
        { atom1: "C-2", atom2: "C-3", type: "double" },
        { atom1: "C-3", atom2: "C-4", type: "single" },
        { atom1: "C-4", atom2: "C-5", type: "double" },
        { atom1: "C-5", atom2: "C-6", type: "single" },
        { atom1: "C-6", atom2: "C-1", type: "double" },
        { atom1: "C-1", atom2: "H-1", type: "single" },
        { atom1: "C-2", atom2: "H-2", type: "single" },
        { atom1: "C-3", atom2: "H-3", type: "single" },
        { atom1: "C-4", atom2: "H-4", type: "single" },
        { atom1: "C-5", atom2: "H-5", type: "single" },
        { atom1: "C-6", atom2: "H-6", type: "single" }
      ]
    },
    glucose: {
      name: "Glucose",
      formula: "C₆H₁₂O₆",
      description: "A simple sugar that is an important energy source in living organisms.",
      molarMass: "180.16 g/mol",
      boilingPoint: "146°C (decomposes)",
      meltingPoint: "146°C",
      elements: {
        C: { radius: 0.7, color: "#909090", name: "Carbon" },
        H: { radius: 0.3, color: "#FFFFFF", name: "Hydrogen" },
        O: { radius: 0.6, color: "#FF0D0D", name: "Oxygen" }
      },
      atoms: [
        { id: "C-1", element: "C", position: [1.2, 0.7, 0.0] },
        { id: "C-2", element: "C", position: [0.0, 1.4, 0.0] },
        { id: "C-3", element: "C", position: [-1.2, 0.7, 0.0] },
        { id: "C-4", element: "C", position: [-1.2, -0.7, 0.0] },
        { id: "C-5", element: "C", position: [0.0, -1.4, 0.0] },
        { id: "C-6", element: "C", position: [1.2, -0.7, 0.0] },
        { id: "O-1", element: "O", position: [2.4, 1.4, 0.0] },
        { id: "O-2", element: "O", position: [0.0, 2.8, 0.0] },
        { id: "O-3", element: "O", position: [-2.4, 1.4, 0.0] },
        { id: "O-4", element: "O", position: [-2.4, -1.4, 0.0] },
        { id: "O-5", element: "O", position: [0.0, -2.8, 0.0] },
        { id: "O-6", element: "O", position: [2.4, -1.4, 0.0] },
        { id: "H-1", element: "H", position: [3.2, 1.0, 0.0] },
        { id: "H-2", element: "H", position: [0.8, 3.2, 0.0] },
        { id: "H-3", element: "H", position: [-3.2, 1.0, 0.0] },
        { id: "H-4", element: "H", position: [-3.2, -1.0, 0.0] },
        { id: "H-5", element: "H", position: [-0.8, -3.2, 0.0] },
        { id: "H-6", element: "H", position: [3.2, -1.0, 0.0] }
      ],
      bonds: [
        { atom1: "C-1", atom2: "C-2", type: "single" },
        { atom1: "C-2", atom2: "C-3", type: "single" },
        { atom1: "C-3", atom2: "C-4", type: "single" },
        { atom1: "C-4", atom2: "C-5", type: "single" },
        { atom1: "C-5", atom2: "C-6", type: "single" },
        { atom1: "C-6", atom2: "C-1", type: "single" },
        { atom1: "C-1", atom2: "O-1", type: "single" },
        { atom1: "C-2", atom2: "O-2", type: "single" },
        { atom1: "C-3", atom2: "O-3", type: "single" },
        { atom1: "C-4", atom2: "O-4", type: "single" },
        { atom1: "C-5", atom2: "O-5", type: "single" },
        { atom1: "C-6", atom2: "O-6", type: "single" },
        { atom1: "O-1", atom2: "H-1", type: "single" },
        { atom1: "O-2", atom2: "H-2", type: "single" },
        { atom1: "O-3", atom2: "H-3", type: "single" },
        { atom1: "O-4", atom2: "H-4", type: "single" },
        { atom1: "O-5", atom2: "H-5", type: "single" },
        { atom1: "O-6", atom2: "H-6", type: "single" }
      ]
    }
  }), []);

  const filteredMolecules = useMemo(() => {
    if (!searchTerm) return Object.entries(moleculeDatabase);
    return Object.entries(moleculeDatabase).filter(([key, molecule]) =>
      molecule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      molecule.formula.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, moleculeDatabase]);

  const initializeScene = () => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfafafa);
    
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 10);
    
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true
    });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Enhanced lighting setup
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.3);
    pointLight.position.set(-5, -5, 5);
    scene.add(pointLight);
    
    mountRef.current.appendChild(renderer.domElement);
    
    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;
    
    // Enhanced mouse controls with touch support
    const handleStart = (clientX, clientY) => {
      controlsRef.current.mouseDown = true;
      controlsRef.current.mouseX = clientX;
      controlsRef.current.mouseY = clientY;
      setAutoRotate(false);
    };

    const handleEnd = () => {
      controlsRef.current.mouseDown = false;
    };

    const handleMove = (clientX, clientY) => {
      if (!controlsRef.current.mouseDown || !sceneRef.current) return;
      
      const deltaX = clientX - controlsRef.current.mouseX;
      const deltaY = clientY - controlsRef.current.mouseY;
      
      sceneRef.current.rotation.y += deltaX * 0.01;
      sceneRef.current.rotation.x += deltaY * 0.01;
      
      controlsRef.current.mouseX = clientX;
      controlsRef.current.mouseY = clientY;
    };

    // Mouse events
    renderer.domElement.addEventListener('mousedown', (e) => handleStart(e.clientX, e.clientY));
    renderer.domElement.addEventListener('mouseup', handleEnd);
    renderer.domElement.addEventListener('mousemove', (e) => handleMove(e.clientX, e.clientY));
    
    // Touch events
    renderer.domElement.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (e.touches.length === 1) {
        handleStart(e.touches[0].clientX, e.touches[0].clientY);
      }
    });
    renderer.domElement.addEventListener('touchend', (e) => {
      e.preventDefault();
      handleEnd();
    });
    renderer.domElement.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (e.touches.length === 1) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    });
    
    // Wheel/pinch zoom
    const handleWheel = (event) => {
      event.preventDefault();
      camera.position.z += event.deltaY * 0.01;
      camera.position.z = Math.max(2, Math.min(50, camera.position.z));
    };
    
    renderer.domElement.addEventListener('wheel', handleWheel, { passive: false });
    
    // Animation loop
    const animate = () => {
      frameId.current = requestAnimationFrame(animate);
      
      if (autoRotate && sceneRef.current) {
        sceneRef.current.rotation.y += rotationSpeed.current;
      }
      
      renderer.render(scene, camera);
    };
    animate();
  };

  const clearScene = () => {
    if (!sceneRef.current) return;
    
    const objectsToRemove = [];
    sceneRef.current.traverse((child) => {
      if (child.isMesh && child.userData.isAtomOrBond) {
        objectsToRemove.push(child);
      }
    });
    
    objectsToRemove.forEach((obj) => {
      sceneRef.current.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach(mat => mat.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });
  };

  const createAtomGeometry = (radius, viewMode) => {
    switch (viewMode) {
      case 'space-fill':
        return new THREE.SphereGeometry(radius * 1.5, 32, 32);
      case 'wireframe':
        return new THREE.SphereGeometry(radius * 0.3, 16, 16);
      default: // ball-stick
        return new THREE.SphereGeometry(radius, 32, 32);
    }
  };

  const createAtomMaterial = (color, viewMode) => {
    const baseColor = new THREE.Color(color);
    
    switch (viewMode) {
      case 'wireframe':
        return new THREE.MeshBasicMaterial({ 
          color: baseColor,
          wireframe: true,
          transparent: true,
          opacity: 0.8
        });
      default:
        return new THREE.MeshLambertMaterial({ 
          color: baseColor,
          transparent: viewMode === 'space-fill' ? false : true,
          opacity: viewMode === 'space-fill' ? 1.0 : 0.9
        });
    }
  };

  const renderMolecule = (data) => {
    if (!sceneRef.current) return;
    
    clearScene();
    
    const atomMap = new Map();
    
    // Create atoms
    data.atoms.forEach((atom) => {
      const elementInfo = data.elements[atom.element];
      if (!elementInfo) return;
      
      const color = elementInfo.color;
      const radius = elementInfo.radius;
      const [x, y, z] = atom.position;
      
      const geometry = createAtomGeometry(radius, viewMode);
      const material = createAtomMaterial(color, viewMode);
      const sphere = new THREE.Mesh(geometry, material);
      
      sphere.position.set(x, y, z);
      sphere.castShadow = true;
      sphere.receiveShadow = true;
      sphere.userData = { isAtomOrBond: true, atomId: atom.id, element: atom.element };
      
      sceneRef.current.add(sphere);
      atomMap.set(atom.id, atom);
    });
    
    // Create bonds (skip for wireframe mode)
    if (viewMode !== 'wireframe') {
      data.bonds.forEach((bond) => {
        const atom1 = atomMap.get(bond.atom1);
        const atom2 = atomMap.get(bond.atom2);
        
        if (!atom1 || !atom2) return;
        
        const start = new THREE.Vector3(...atom1.position);
        const end = new THREE.Vector3(...atom2.position);
        const direction = new THREE.Vector3().subVectors(end, start);
        const distance = direction.length();
        
        const bondRadius = viewMode === 'space-fill' ? 0.1 : 0.05;
        
        if (bond.type === 'single') {
          const geometry = new THREE.CylinderGeometry(bondRadius, bondRadius, distance, 12);
          const material = new THREE.MeshLambertMaterial({ color: 0x666666 });
          const cylinder = new THREE.Mesh(geometry, material);
          
          cylinder.position.copy(start).add(end).divideScalar(2);
          cylinder.lookAt(end);
          cylinder.rotateX(Math.PI / 2);
          cylinder.userData = { isAtomOrBond: true };
          cylinder.castShadow = true;
          sceneRef.current.add(cylinder);
          
        } else if (bond.type === 'double') {
          const offset = 0.15;
          let perpendicular;
          if (Math.abs(direction.y) < 0.9) {
            perpendicular = new THREE.Vector3(0, 1, 0).cross(direction).normalize();
          } else {
            perpendicular = new THREE.Vector3(1, 0, 0).cross(direction).normalize();
          }
          perpendicular.multiplyScalar(offset);
          
          const midpoint = new THREE.Vector3().copy(start).add(end).divideScalar(2);
          
          // Create two cylinders
          for (let i = 0; i < 2; i++) {
            const geometry = new THREE.CylinderGeometry(bondRadius * 0.8, bondRadius * 0.8, distance, 12);
            const material = new THREE.MeshLambertMaterial({ color: 0x666666 });
            const cylinder = new THREE.Mesh(geometry, material);
            
            cylinder.position.copy(midpoint).add(perpendicular.clone().multiplyScalar(i === 0 ? 1 : -1));
            cylinder.lookAt(end);
            cylinder.rotateX(Math.PI / 2);
            cylinder.userData = { isAtomOrBond: true };
            cylinder.castShadow = true;
            sceneRef.current.add(cylinder);
          }
        }
      });
    }
    
    // Center and fit molecule
    const box = new THREE.Box3().setFromObject(sceneRef.current);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    sceneRef.current.position.sub(center);
    
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = cameraRef.current.fov * (Math.PI / 180);
    const distance = Math.abs(maxDim / (2 * Math.tan(fov / 2))) * 1.5;
    
    cameraRef.current.position.set(0, 0, Math.max(distance, 3));
    cameraRef.current.lookAt(0, 0, 0);
    
    setAutoRotate(true);
  };

  const loadMolecule = (moleculeKey) => {
    setLoading(true);
    setError('');
    
    // Simulate loading delay for better UX
    setTimeout(() => {
      const data = moleculeDatabase[moleculeKey];
      if (data) {
        setMoleculeData(data);
        renderMolecule(data);
        setAutoRotate(true);
      } else {
        setError('Molecule not found in database');
      }
      setLoading(false);
    }, 300);
  };

  const handleMoleculeSelect = (moleculeKey) => {
    setSelectedMolecule(moleculeKey);
    loadMolecule(moleculeKey);
    setIsMenuOpen(false);
    setShowInfo(false);
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    if (moleculeData) {
      renderMolecule(moleculeData);
    }
  };

  useEffect(() => {
    initializeScene();
    
    return () => {
      if (frameId.current) {
        cancelAnimationFrame(frameId.current);
      }
      if (rendererRef.current && mountRef.current && rendererRef.current.domElement.parentNode) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (rendererRef.current && cameraRef.current && mountRef.current) {
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        
        rendererRef.current.setSize(width, height);
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (moleculeData && viewMode) {
      renderMolecule(moleculeData);
    }
  }, [viewMode]);

 useEffect(() => {
  const handleResize = () => {
    const mobile = window.innerWidth < 1024;
    setIsMobile(mobile);
    if (!mobile) {
      setIsMenuOpen(false);
    }
  };

  handleResize();
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);

return (
  <div className="w-full h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col overflow-hidden">
    {/* Header */}
    <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="text-3xl">⚛️</div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Molecule Studio</h1>
              <p className="text-xs text-gray-500 hidden sm:block">Interactive 3D Molecular Viewer</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search molecules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 px-4 py-2 pl-10 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            {moleculeData && (
              <>
                <button
                  onClick={() => setShowInfo(!showInfo)}
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Info
                </button>
                <button
                  onClick={() => setAutoRotate(!autoRotate)}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    autoRotate ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  Auto Rotate
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </div>
    </div>

    {/* Mobile Menu */}
    {isMenuOpen && (
      <div className="lg:hidden bg-white border-b border-gray-200 shadow-lg">
        <div className="px-4 py-4 space-y-4">
          <input
            type="text"
            placeholder="Search molecules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {moleculeData && (
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setShowInfo(!showInfo);
                  setIsMenuOpen(false);
                }}
                className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 bg-gray-50 rounded-lg transition-colors"
              >
                Info
              </button>
              <button
                onClick={() => {
                  setAutoRotate(!autoRotate);
                  setIsMenuOpen(false);
                }}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  autoRotate ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600 bg-gray-50'
                }`}
              >
                Auto Rotate
              </button>
            </div>
          )}
        </div>
      </div>
    )}

    {/* Main Content */}
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
      {/* Mobile Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`${
        isMenuOpen ? 'block' : 'hidden lg:block'
      } w-full lg:w-80 bg-white border-r border-gray-200 overflow-y-auto lg:relative absolute lg:z-auto z-20 h-full lg:h-auto max-w-sm lg:max-w-none`}>
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Molecule Library</h2>
          
          {/* View Mode Selector */}
          {moleculeData && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">View Mode</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'ball-stick', label: 'Ball & Stick' },
                  { key: 'space-fill', label: 'Space Fill' },
                  { key: 'wireframe', label: 'Wireframe' }
                ].map((mode) => (
                  <button
                    key={mode.key}
                    onClick={() => handleViewModeChange(mode.key)}
                    className={`px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                      viewMode === mode.key
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Molecule List */}
          <div className="space-y-2">
            {filteredMolecules.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🔍</div>
                <p>No molecules found</p>
              </div>
            ) : (
              filteredMolecules.map(([key, molecule]) => (
                <button
                  key={key}
                  onClick={() => {
                    handleMoleculeSelect(key);
                    // Close mobile menu when molecule is selected
                    if (isMobile) {
                      setIsMenuOpen(false);
                    }
                  }}
                  className={`w-full text-left p-3 sm:p-4 rounded-lg border transition-all duration-200 ${
                    selectedMolecule === key
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900 text-sm sm:text-base">{molecule.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">{molecule.formula}</p>
                      <p className="text-xs text-gray-400 mt-2 line-clamp-2 hidden sm:block">{molecule.description}</p>
                    </div>
                    {selectedMolecule === key && (
                      <div className="text-blue-500 ml-2">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
      
      {/* 3D Viewer */}
      <div className="flex-1 relative bg-gradient-to-br from-gray-50 to-slate-100">
        <div ref={mountRef} className="w-full h-full" />
        
        {/* Loading State */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
            <div className="text-center">
              <div className="animate-spin text-5xl mb-4">⚛️</div>
              <p className="text-lg font-medium text-gray-700">Loading molecule...</p>
            </div>
          </div>
        )}
        
        {/* Error State */}
        {error && (
          <div className="absolute top-4 left-4 right-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
        
        {/* Empty State */}
        {!moleculeData && !loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center max-w-md mx-auto px-4">
              <div className="text-6xl mb-6">⚛️</div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Welcome to Molecule Studio</h2>
              <p className="text-gray-600 mb-6">
                Explore the fascinating world of molecular structures in interactive 3D. 
                Select a molecule from the library to begin your journey.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <span>🖱️</span>
                  <span>Drag to rotate</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>🔍</span>
                  <span>Scroll to zoom</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>📱</span>
                  <span>Touch support</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>🎨</span>
                  <span>Multiple view modes</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        {moleculeData && (
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto bg-white/90 backdrop-blur-md rounded-lg p-3 sm:p-4 shadow-lg">
            <div className="text-xs sm:text-sm text-gray-600 space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-base">🖱️</span>
                <span>Drag to rotate</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-base">🔍</span>
                <span>Scroll to zoom</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-base">📱</span>
                <span>Touch gestures supported</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info Panel */}
      {showInfo && moleculeData && (
        <div className={`${
          isMobile ? 'fixed inset-0 z-30 bg-white' : 'w-80 bg-white border-l border-gray-200'
        } overflow-y-auto`}>
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Molecule Info</h2>
              <button
                onClick={() => setShowInfo(false)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{moleculeData.name}</h3>
                <p className="text-base sm:text-lg text-blue-600 font-mono">{moleculeData.formula}</p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Description</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{moleculeData.description}</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Properties</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Molar Mass:</span>
                      <span className="font-medium">{moleculeData.molarMass}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Boiling Point:</span>
                      <span className="font-medium">{moleculeData.boilingPoint}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Melting Point:</span>
                      <span className="font-medium">{moleculeData.meltingPoint}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Structure</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Atoms:</span>
                      <span className="font-medium">{moleculeData.atoms.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bonds:</span>
                      <span className="font-medium">{moleculeData.bonds.length}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Elements</h4>
                  <div className="space-y-2">
                    {Object.entries(moleculeData.elements).map(([symbol, element]) => (
                      <div key={symbol} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-4 h-4 rounded-full border border-gray-300"
                            style={{ backgroundColor: element.color }}
                          ></div>
                          <span className="text-sm font-medium">{element.name}</span>
                        </div>
                        <span className="text-xs text-gray-500 font-mono">{symbol}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);
};
export default MoleculeStudio;
