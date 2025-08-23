import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';

const MoleculeStudio = () => {
  const [selectedMolecule, setSelectedMolecule] = useState('');
  const [moleculeData, setMoleculeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [autoRotate, setAutoRotate] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [viewMode, setViewMode] = useState('ball-stick');
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const frameId = useRef(null);
  const controlsRef = useRef({ mouseDown: false, mouseX: 0, mouseY: 0 });

  // Comprehensive molecule database
        const molecules = {
    water: {
      name: "Water", formula: "H₂O", category: "Simple",
      description: "Essential for life, water is a polar molecule with unique hydrogen bonding properties.",
      properties: { molarMass: "18.02 g/mol", boiling: "100°C", melting: "0°C" },
      elements: {
        H: { radius: 0.31, color: "#FFFFFF", name: "Hydrogen" },
        O: { radius: 0.66, color: "#FF0D0D", name: "Oxygen" }
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
      name: "Methane", formula: "CH₄", category: "Hydrocarbon",
      description: "The simplest hydrocarbon and main component of natural gas with tetrahedral geometry.",
      properties: { molarMass: "16.04 g/mol", boiling: "-162°C", melting: "-182°C" },
      elements: {
        C: { radius: 0.70, color: "#909090", name: "Carbon" },
        H: { radius: 0.31, color: "#FFFFFF", name: "Hydrogen" }
      },
      atoms: [
        { id: "C-1", element: "C", position: [0.0, 0.0, 0.0] },
        { id: "H-1", element: "H", position: [1.089, 0.0, 0.0] },
        { id: "H-2", element: "H", position: [-0.363, 1.027, 0.0] },
        { id: "H-3", element: "H", position: [-0.363, -0.514, 0.889] },
        { id: "H-4", element: "H", position: [-0.363, -0.514, -0.889] }
      ],
      bonds: [
        { atom1: "C-1", atom2: "H-1", type: "single" },
        { atom1: "C-1", atom2: "H-2", type: "single" },
        { atom1: "C-1", atom2: "H-3", type: "single" },
        { atom1: "C-1", atom2: "H-4", type: "single" }
      ]
    },
    ammonia: {
      name: "Ammonia", formula: "NH₃", category: "Simple",
      description: "A pyramidal molecule essential for fertilizer production with a lone pair on nitrogen.",
      properties: { molarMass: "17.03 g/mol", boiling: "-33°C", melting: "-78°C" },
      elements: {
        N: { radius: 0.65, color: "#3050F8", name: "Nitrogen" },
        H: { radius: 0.31, color: "#FFFFFF", name: "Hydrogen" }
      },
      atoms: [
        { id: "N-1", element: "N", position: [0.0, 0.0, 0.0] },
        { id: "H-1", element: "H", position: [0.0, 1.012, 0.0] },
        { id: "H-2", element: "H", position: [0.876, -0.506, 0.0] },
        { id: "H-3", element: "H", position: [-0.876, -0.506, 0.0] }
      ],
      bonds: [
        { atom1: "N-1", atom2: "H-1", type: "single" },
        { atom1: "N-1", atom2: "H-2", type: "single" },
        { atom1: "N-1", atom2: "H-3", type: "single" }
      ]
    },
    co2: {
      name: "Carbon Dioxide", formula: "CO₂", category: "Simple",
      description: "A linear molecule crucial for photosynthesis and climate science with double bonds.",
      properties: { molarMass: "44.01 g/mol", boiling: "-78°C", melting: "-78°C" },
      elements: {
        C: { radius: 0.70, color: "#909090", name: "Carbon" },
        O: { radius: 0.66, color: "#FF0D0D", name: "Oxygen" }
      },
      atoms: [
        { id: "C-1", element: "C", position: [0.0, 0.0, 0.0] },
        { id: "O-1", element: "O", position: [1.162, 0.0, 0.0] },
        { id: "O-2", element: "O", position: [-1.162, 0.0, 0.0] }
      ],
      bonds: [
        { atom1: "C-1", atom2: "O-1", type: "double" },
        { atom1: "C-1", atom2: "O-2", type: "double" }
      ]
    },
    ethylene: {
      name: "Ethylene", formula: "C₂H₄", category: "Hydrocarbon",
      description: "The simplest alkene with a C=C double bond, important in industry and plant biology.",
      properties: { molarMass: "28.05 g/mol", boiling: "-104°C", melting: "-169°C" },
      elements: {
        C: { radius: 0.70, color: "#909090", name: "Carbon" },
        H: { radius: 0.31, color: "#FFFFFF", name: "Hydrogen" }
      },
      atoms: [
        { id: "C-1", element: "C", position: [0.667, 0.0, 0.0] },
        { id: "C-2", element: "C", position: [-0.667, 0.0, 0.0] },
        { id: "H-1", element: "H", position: [1.234, 0.924, 0.0] },
        { id: "H-2", element: "H", position: [1.234, -0.924, 0.0] },
        { id: "H-3", element: "H", position: [-1.234, 0.924, 0.0] },
        { id: "H-4", element: "H", position: [-1.234, -0.924, 0.0] }
      ],
      bonds: [
        { atom1: "C-1", atom2: "C-2", type: "double" },
        { atom1: "C-1", atom2: "H-1", type: "single" },
        { atom1: "C-1", atom2: "H-2", type: "single" },
        { atom1: "C-2", atom2: "H-3", type: "single" },
        { atom1: "C-2", atom2: "H-4", type: "single" }
      ]
    },
    benzene: {
      name: "Benzene", formula: "C₆H₆", category: "Aromatic",
      description: "The archetypal aromatic compound with delocalized π electrons in a hexagonal ring.",
      properties: { molarMass: "78.11 g/mol", boiling: "80°C", melting: "5°C" },
      elements: {
        C: { radius: 0.70, color: "#909090", name: "Carbon" },
        H: { radius: 0.31, color: "#FFFFFF", name: "Hydrogen" }
      },
      atoms: [
        { id: "C-1", element: "C", position: [1.207, 0.696, 0.0] },
        { id: "C-2", element: "C", position: [1.207, -0.696, 0.0] },
        { id: "C-3", element: "C", position: [0.0, -1.392, 0.0] },
        { id: "C-4", element: "C", position: [-1.207, -0.696, 0.0] },
        { id: "C-5", element: "C", position: [-1.207, 0.696, 0.0] },
        { id: "C-6", element: "C", position: [0.0, 1.392, 0.0] },
        { id: "H-1", element: "H", position: [2.146, 1.238, 0.0] },
        { id: "H-2", element: "H", position: [2.146, -1.238, 0.0] },
        { id: "H-3", element: "H", position: [0.0, -2.476, 0.0] },
        { id: "H-4", element: "H", position: [-2.146, -1.238, 0.0] },
        { id: "H-5", element: "H", position: [-2.146, 1.238, 0.0] },
        { id: "H-6", element: "H", position: [0.0, 2.476, 0.0] }
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
  ethanol: {
    name: "Ethanol", formula: "C₂H₆O", category: "Alcohol",
    description: "A common alcohol used in beverages and as a solvent, featuring a hydroxyl group.",
    properties: { molarMass: "46.08 g/mol", boiling: "78°C", melting: "-114°C" },
    elements: {
      C: { radius: 0.70, color: "#909090", name: "Carbon" },
      H: { radius: 0.31, color: "#FFFFFF", name: "Hydrogen" },
      O: { radius: 0.66, color: "#FF0D0D", name: "Oxygen" }
    },
    atoms: [
      { id: "C-1", element: "C", position: [0.0, 0.0, 0.0] },
      { id: "C-2", element: "C", position: [1.54, 0.0, 0.0] },
      { id: "O-1", element: "O", position: [2.08, 1.21, 0.0] },
      { id: "H-1", element: "H", position: [-0.54, 0.90, 0.0] },
      { id: "H-2", element: "H", position: [-0.54, -0.90, 0.0] },
      { id: "H-3", element: "H", position: [1.54, -0.90, 0.0] },
      { id: "H-4", element: "H", position: [1.54, 0.90, 0.0] },
      { id: "H-5", element: "H", position: [2.63, 1.21, 0.90] }
    ],
    bonds: [
      { atom1: "C-1", atom2: "C-2", type: "single" },
      { atom1: "C-2", atom2: "O-1", type: "single" },
      { atom1: "C-1", atom2: "H-1", type: "single" },
      { atom1: "C-1", atom2: "H-2", type: "single" },
      { atom1: "C-2", atom2: "H-3", type: "single" },
      { atom1: "C-2", atom2: "H-4", type: "single" },
      { atom1: "O-1", atom2: "H-5", type: "single" }
    ]
  },
  hydrogenPeroxide: {
    name: "Hydrogen Peroxide", formula: "H₂O₂", category: "Peroxide",
    description: "A reactive oxygen compound often used as a disinfectant, with a bent molecular geometry.",
    properties: { molarMass: "34.01 g/mol", boiling: "150.2°C", melting: "-0.43°C" },
    elements: {
      H: { radius: 0.31, color: "#FFFFFF", name: "Hydrogen" },
      O: { radius: 0.66, color: "#FF0D0D", name: "Oxygen" }
    },
    atoms: [
      { id: "O-1", element: "O", position: [0.0, 0.0, 0.0] },
      { id: "O-2", element: "O", position: [1.47, 0.0, 0.0] },
      { id: "H-1", element: "H", position: [-0.48, 0.92, 0.0] },
      { id: "H-2", element: "H", position: [1.95, 0.92, 0.0] }
    ],
    bonds: [
      { atom1: "O-1", atom2: "O-2", type: "single" },
      { atom1: "O-1", atom2: "H-1", type: "single" },
      { atom1: "O-2", atom2: "H-2", type: "single" }
    ]
  },
  formaldehyde: {
    name: "Formaldehyde", formula: "CH₂O", category: "Aldehyde",
    description: "A simple aldehyde with a planar structure, commonly used as a preservative.",
    properties: { molarMass: "30.03 g/mol", boiling: "-19°C", melting: "-80°C" },
    elements: {
      C: { radius: 0.70, color: "#909090", name: "Carbon" },
      H: { radius: 0.31, color: "#FFFFFF", name: "Hydrogen" },
      O: { radius: 0.66, color: "#FF0D0D", name: "Oxygen" }
    },
    atoms: [
      { id: "C-1", element: "C", position: [0.0, 0.0, 0.0] },
      { id: "O-1", element: "O", position: [1.21, 0.0, 0.0] },
      { id: "H-1", element: "H", position: [-0.54, 0.90, 0.0] },
      { id: "H-2", element: "H", position: [-0.54, -0.90, 0.0] }
    ],
    bonds: [
      { atom1: "C-1", atom2: "O-1", type: "double" },
      { atom1: "C-1", atom2: "H-1", type: "single" },
      { atom1: "C-1", atom2: "H-2", type: "single" }
    ]
  },
  nitricOxide: {
    name: "Nitric Oxide", formula: "NO", category: "Simple",
    description: "A diatomic molecule with an odd electron, acts as a signaling molecule in biology.",
    properties: { molarMass: "30.01 g/mol", boiling: "-152°C", melting: "-163°C" },
    elements: {
      N: { radius: 0.65, color: "#3050F8", name: "Nitrogen" },
      O: { radius: 0.66, color: "#FF0D0D", name: "Oxygen" }
    },
    atoms: [
      { id: "N-1", element: "N", position: [0.0, 0.0, 0.0] },
      { id: "O-1", element: "O", position: [1.15, 0.0, 0.0] }
    ],
    bonds: [
      { atom1: "N-1", atom2: "O-1", type: "double" }
    ]
  }
  };

  
  const filteredMolecules = Object.entries(molecules).filter(([key, mol]) =>
    mol.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mol.formula.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mol.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const initScene = useCallback(() => {
    if (!mountRef.current) return;

    // Clean up existing scene
    if (rendererRef.current && mountRef.current.contains(rendererRef.current.domElement)) {
      mountRef.current.removeChild(rendererRef.current.domElement);
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);
    
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 8);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Lighting
    scene.add(new THREE.AmbientLight(0x404040, 0.4));
    const light = new THREE.DirectionalLight(0xffffff, 0.8);
    light.position.set(10, 10, 5);
    light.castShadow = true;
    scene.add(light);
    
    mountRef.current.appendChild(renderer.domElement);
    
    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;
    
    // Controls
    const handleStart = (x, y) => {
      controlsRef.current.mouseDown = true;
      controlsRef.current.mouseX = x;
      controlsRef.current.mouseY = y;
      setAutoRotate(false);
    };

    const handleEnd = () => {
      controlsRef.current.mouseDown = false;
    };

    const handleMove = (x, y) => {
      if (!controlsRef.current.mouseDown || !scene) return;
      
      const deltaX = x - controlsRef.current.mouseX;
      const deltaY = y - controlsRef.current.mouseY;
      
      scene.rotation.y += deltaX * 0.01;
      scene.rotation.x += deltaY * 0.01;
      
      controlsRef.current.mouseX = x;
      controlsRef.current.mouseY = y;
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
    
    // Zoom
    renderer.domElement.addEventListener('wheel', (e) => {
      e.preventDefault();
      camera.position.z += e.deltaY * 0.01;
      camera.position.z = Math.max(2, Math.min(50, camera.position.z));
    });
    
    // Animation loop
    const animate = () => {
      frameId.current = requestAnimationFrame(animate);
      
      if (autoRotate && scene) {
        scene.rotation.y += 0.005;
      }
      
      renderer.render(scene, camera);
    };
    animate();
  }, [autoRotate]);

  const clearScene = () => {
    if (!sceneRef.current) return;
    
    const objects = [];
    sceneRef.current.traverse((child) => {
      if (child.isMesh && child.userData.isMolecule) {
        objects.push(child);
      }
    });
    
    objects.forEach((obj) => {
      sceneRef.current.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
    });
  };

  const renderMolecule = useCallback((data) => {
    if (!sceneRef.current) return;
    
    clearScene();
    
    const atomMap = new Map();
    
    // Create atoms
    data.atoms.forEach((atom) => {
      const element = data.elements[atom.element];
      if (!element) return;
      
      const [x, y, z] = atom.position;
      
      let geometry, material;
      
      switch (viewMode) {
        case 'space-fill':
          geometry = new THREE.SphereGeometry(element.radius * 1.5, 20, 20);
          material = new THREE.MeshPhongMaterial({ color: element.color });
          break;
        case 'wireframe':
          geometry = new THREE.SphereGeometry(element.radius * 0.4, 12, 12);
          material = new THREE.MeshBasicMaterial({ 
            color: element.color, 
            wireframe: true,
            transparent: true,
            opacity: 0.8
          });
          break;
        default: // ball-stick
          geometry = new THREE.SphereGeometry(element.radius, 16, 16);
          material = new THREE.MeshPhongMaterial({ color: element.color });
      }
      
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(x, y, z);
      sphere.castShadow = true;
      sphere.receiveShadow = true;
      sphere.userData = { isMolecule: true };
      
      sceneRef.current.add(sphere);
      atomMap.set(atom.id, atom);
    });
    
    // Create bonds (skip for wireframe)
    if (viewMode !== 'wireframe') {
      data.bonds.forEach((bond) => {
        const atom1 = atomMap.get(bond.atom1);
        const atom2 = atomMap.get(bond.atom2);
        
        if (!atom1 || !atom2) return;
        
        const start = new THREE.Vector3(...atom1.position);
        const end = new THREE.Vector3(...atom2.position);
        const distance = start.distanceTo(end);
        
        const bondRadius = viewMode === 'space-fill' ? 0.1 : 0.05;
        
        if (bond.type === 'single') {
          const geometry = new THREE.CylinderGeometry(bondRadius, bondRadius, distance, 8);
          const material = new THREE.MeshPhongMaterial({ color: 0x666666 });
          const cylinder = new THREE.Mesh(geometry, material);
          
          cylinder.position.copy(start).add(end).divideScalar(2);
          cylinder.lookAt(end);
          cylinder.rotateX(Math.PI / 2);
          cylinder.userData = { isMolecule: true };
          cylinder.castShadow = true;
          sceneRef.current.add(cylinder);
          
        } else if (bond.type === 'double') {
          const direction = new THREE.Vector3().subVectors(end, start);
          let perpendicular = new THREE.Vector3(0, 1, 0).cross(direction).normalize();
          if (perpendicular.length() === 0) {
            perpendicular = new THREE.Vector3(1, 0, 0).cross(direction).normalize();
          }
          perpendicular.multiplyScalar(0.15);
          
          const midpoint = new THREE.Vector3().addVectors(start, end).divideScalar(2);
          
          for (let i = 0; i < 2; i++) {
            const geometry = new THREE.CylinderGeometry(bondRadius * 0.8, bondRadius * 0.8, distance, 8);
            const material = new THREE.MeshPhongMaterial({ color: 0x666666 });
            const cylinder = new THREE.Mesh(geometry, material);
            
            cylinder.position.copy(midpoint).add(perpendicular.clone().multiplyScalar(i === 0 ? 1 : -1));
            cylinder.lookAt(end);
            cylinder.rotateX(Math.PI / 2);
            cylinder.userData = { isMolecule: true };
            cylinder.castShadow = true;
            sceneRef.current.add(cylinder);
          }
        }
      });
    }
    
    // Center and fit
    const box = new THREE.Box3().setFromObject(sceneRef.current);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    sceneRef.current.position.sub(center);
    
    const maxDim = Math.max(size.x, size.y, size.z);
    const distance = maxDim * 2.5;
    
    cameraRef.current.position.set(0, 0, Math.max(distance, 5));
    cameraRef.current.lookAt(0, 0, 0);
    
    // Reset rotation
    sceneRef.current.rotation.set(0, 0, 0);
    setAutoRotate(true);
  }, [viewMode]);

  const loadMolecule = (key) => {
    setLoading(true);
    setError('');
    
    setTimeout(() => {
      const mol = molecules[key];
      if (mol) {
        setMoleculeData(mol);
        renderMolecule(mol);
      } else {
        setError('Molecule not found');
      }
      setLoading(false);
    }, 300);
  };

  const selectMolecule = (key) => {
    setSelectedMolecule(key);
    loadMolecule(key);
    setSidebarOpen(false);
  };

  const changeViewMode = (mode) => {
    setViewMode(mode);
    if (moleculeData) {
      renderMolecule(moleculeData);
    }
  };

  // Initialize
  useEffect(() => {
    initScene();
    
    return () => {
      if (frameId.current) {
        cancelAnimationFrame(frameId.current);
      }
    };
  }, [initScene]);

  // Handle resize
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

  // Load initial molecule
  useEffect(() => {
    if (!selectedMolecule) {
      selectMolecule('water');
    }
  }, []);

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 fixed lg:relative z-50 lg:z-0 w-80 h-full bg-white shadow-xl lg:shadow-none transition-transform duration-300 ease-in-out overflow-y-auto`}>
        
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="text-2xl">⚛️</div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Molecule Studio</h1>
                <p className="text-xs text-gray-600">3D Molecular Viewer</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md text-gray-500 hover:text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search molecules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 pl-9 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* View Mode */}
        {moleculeData && (
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <label className="block text-sm font-semibold text-gray-700 mb-2">View Mode</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'ball-stick', label: 'Ball & Stick', icon: '⚫' },
                { key: 'space-fill', label: 'Space Fill', icon: '🔵' },
                { key: 'wireframe', label: 'Wireframe', icon: '📐' }
              ].map((mode) => (
                <button
                  key={mode.key}
                  onClick={() => changeViewMode(mode.key)}
                  className={`px-2 py-3 text-xs font-medium rounded-lg transition-all ${
                    viewMode === mode.key
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-lg mb-1">{mode.icon}</div>
                    <div>{mode.label}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Molecule List */}
        <div className="p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Available Molecules</h2>
          <div className="space-y-2">
            {filteredMolecules.map(([key, mol]) => (
              <button
                key={key}
                onClick={() => selectMolecule(key)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedMolecule === key
                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">{mol.name}</h3>
                    <p className="text-xs text-blue-600 font-mono mt-1">{mol.formula}</p>
                    <span className="inline-block px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full mt-2">
                      {mol.category}
                    </span>
                  </div>
                  {selectedMolecule === key && (
                    <div className="text-blue-500">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            {moleculeData && (
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{moleculeData.name}</h1>
                <p className="text-sm text-gray-600">{moleculeData.formula} • {moleculeData.atoms.length} atoms • {moleculeData.bonds.length} bonds</p>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {moleculeData && (
              <>
                <button
                  onClick={() => setShowInfo(!showInfo)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    showInfo 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  📊 Info
                </button>
                <button
                  onClick={() => setAutoRotate(!autoRotate)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    autoRotate 
                      ? 'bg-green-100 text-green-700' 
                      : 'text-gray-600 hover:text-green-600 hover:bg-gray-50'
                  }`}
                >
                  {autoRotate ? '⏸️' : '▶️'} Rotate
                </button>
              </>
            )}
          </div>
        </div>

        {/* 3D Viewer */}
        <div className="flex-1 relative bg-gradient-to-br from-gray-50 to-slate-100">
          <div ref={mountRef} className="w-full h-full" />
          
          {/* Loading */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
              <div className="text-center">
                <div className="animate-spin text-5xl mb-4">⚛️</div>
                <p className="text-lg font-medium text-gray-700">Loading molecule...</p>
              </div>
            </div>
          )}
          
          {/* Error */}
          {error && (
            <div className="absolute top-4 left-4 right-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <div className="flex items-center space-x-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            </div>
          )}
          
          {/* Empty State */}
          {!moleculeData && !loading && (
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="text-center max-w-md">
                <div className="text-6xl mb-6 animate-bounce">⚛️</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Welcome to Molecule Studio
                </h2>
                <p className="text-gray-600 mb-6">
                  Explore molecular structures in interactive 3D. Select a molecule from the sidebar to begin.
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                  <div className="flex flex-col items-center space-y-2 p-3 bg-white rounded-lg shadow-sm">
                    <span className="text-2xl">🖱️</span>
                    <span>Drag to rotate</span>
                  </div>
                  <div className="flex flex-col items-center space-y-2 p-3 bg-white rounded-lg shadow-sm">
                    <span className="text-2xl">🔍</span>
                    <span>Scroll to zoom</span>
                  </div>
                  <div className="flex flex-col items-center space-y-2 p-3 bg-white rounded-lg shadow-sm">
                    <span className="text-2xl">📱</span>
                    <span>Touch support</span>
                  </div>
                  <div className="flex flex-col items-center space-y-2 p-3 bg-white rounded-lg shadow-sm">
                    <span className="text-2xl">🎨</span>
                    <span>View modes</span>
                  </div>
                </div>
              </div>
            </div>
          )}

         {/* Controls */}
          {moleculeData && (
            <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
              <div className="text-xs text-gray-600 space-y-1">
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
                  <span>Touch gestures</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Info Panel */}
        {showInfo && moleculeData && (
          <div className="absolute inset-y-0 right-0 w-80 bg-white shadow-xl border-l border-gray-200 overflow-y-auto z-30">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Molecule Info</h2>
                <button
                  onClick={() => setShowInfo(false)}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900">{moleculeData.name}</h3>
                  <p className="text-xl text-blue-600 font-mono mb-2">{moleculeData.formula}</p>
                  <span className="inline-block px-3 py-1 text-sm font-medium bg-purple-100 text-purple-700 rounded-full">
                    {moleculeData.category}
                  </span>
                </div>

                {/* Description */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Description</h4>
                  <p className="text-gray-700 text-sm leading-relaxed">{moleculeData.description}</p>
                </div>

                {/* Properties */}
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Properties</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Molar Mass:</span>
                      <span className="font-medium">{moleculeData.properties.molarMass}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Boiling Point:</span>
                      <span className="font-medium">{moleculeData.properties.boiling}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Melting Point:</span>
                      <span className="font-medium">{moleculeData.properties.melting}</span>
                    </div>
                  </div>
                </div>

                {/* Structure */}
                <div className="bg-orange-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Structure</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{moleculeData.atoms.length}</div>
                      <div className="text-xs text-gray-600">Atoms</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{moleculeData.bonds.length}</div>
                      <div className="text-xs text-gray-600">Bonds</div>
                    </div>
                  </div>
                </div>

                {/* Elements */}
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Elements</h4>
                  <div className="space-y-3">
                    {Object.entries(moleculeData.elements).map(([symbol, element]) => (
                      <div key={symbol} className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                            style={{ backgroundColor: element.color }}
                          ></div>
                          <div>
                            <div className="font-medium text-gray-900 text-sm">{element.name}</div>
                            <div className="text-xs text-gray-500">Symbol: {symbol}</div>
                          </div>
                        </div>
                        <div className="text-sm font-mono text-gray-600">
                          {moleculeData.atoms.filter(atom => atom.element === symbol).length}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Current View */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Current View</h4>
                  <div className="text-center">
                    <div className="text-lg mb-2">
                      {viewMode === 'ball-stick' && '⚫ Ball & Stick Model'}
                      {viewMode === 'space-fill' && '🔵 Space-Filling Model'}
                      {viewMode === 'wireframe' && '📐 Wireframe Model'}
                    </div>
                    <p className="text-xs text-gray-600">
                      {viewMode === 'ball-stick' && 'Shows atoms as spheres connected by cylinders representing bonds'}
                      {viewMode === 'space-fill' && 'Displays atoms at their van der Waals radii showing molecular surface'}
                      {viewMode === 'wireframe' && 'Simple skeletal representation showing basic atomic framework'}
                    </p>
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
