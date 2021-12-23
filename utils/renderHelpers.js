export const resizeRenderToDisplaySize = (renderer, camera, composers=[]) => {
   const canvas = renderer.domElement;
   const width = canvas.clientWidth;
    const height = canvas.clientHeight;

   camera.aspect = width / height;
   camera.updateProjectionMatrix();

   const needResize = canvas.width !== width || canvas.height !== height;
   if (needResize) {
      renderer.setSize(width, height, false);
   }

   for (composer in composers) {
      composer.setSize(canvas.width, canvas.height)
   }
   }