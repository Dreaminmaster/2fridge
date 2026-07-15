import * as THREE from 'three';

export const palette = {
  mint: '#83ad8f', mintDark: '#5d846d', cream: '#f6ead0', inner: '#f3e7cd', white: '#fff9e9', metal: '#d4c8ad', floor: '#b76b35', floorLine: '#8f4e29', wall: '#efcf98', green: '#5f8b4d', pot: '#a95b32', dark: '#634c40',
};

export function toon(color, options = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.82, metalness: 0, flatShading: true, ...options });
}

export function createMaterials() {
  return {
    mint: toon(palette.mint), mintDark: toon(palette.mintDark), cream: toon(palette.cream), inner: toon(palette.inner), white: toon(palette.white), metal: toon(palette.metal), dark: toon(palette.dark),
  };
}
