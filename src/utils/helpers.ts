export function assertIsMesh(object: unknown): asserts object is THREE.Mesh {
  if ((object as any).type !== 'Mesh') {
    throw new Error('Provided object is not of Mesh type')
  }
}
