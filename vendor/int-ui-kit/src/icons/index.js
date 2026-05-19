// Vite/Storybook build: re-export from the pre-generated static registry.
// The original webpack require.context version is incompatible with Vite.
// See src/lib/iconRegistry.js for the auto-generated static import list.
export { default, iconNames, getIcon } from '../lib/iconRegistry.js';
