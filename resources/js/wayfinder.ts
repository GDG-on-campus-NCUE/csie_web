// Re-export the generated Wayfinder module.
// Some environments import '../wayfinder' (the file path), while the generator
// produces a directory `wayfinder/index.ts`. To avoid shadowing and provide
// symbols like `applyUrlDefaults`, re-export explicitly from the index file.
export * from './wayfinder/index';
