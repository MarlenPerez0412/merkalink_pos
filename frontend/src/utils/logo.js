export const LOGO_EMPRESA_URL = '/images/logo-empresa.png';
export const LOGO_DEFAULT_URL = '/images/logo-default.png';

export const getLogoEmpresaSrc = (version = Date.now()) => `${LOGO_EMPRESA_URL}?t=${version}`;

export const cargarImagenDataUrl = async (src) =>
  new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0);
      resolve({
        dataUrl: canvas.toDataURL('image/png'),
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
    };
    image.onerror = () => resolve(null);
    image.src = src;
  });

export const cargarLogoEmpresaPdf = async (version) => {
  const logo = await cargarImagenDataUrl(getLogoEmpresaSrc(version));
  if (logo) return logo;
  return cargarImagenDataUrl(`${LOGO_DEFAULT_URL}?t=${version || Date.now()}`);
};

export const fitImageToBox = (imageWidth, imageHeight, boxX, boxY, boxWidth, boxHeight) => {
  if (!imageWidth || !imageHeight) {
    return { x: boxX, y: boxY, width: boxWidth, height: boxHeight };
  }

  const ratio = Math.min(boxWidth / imageWidth, boxHeight / imageHeight);
  const width = imageWidth * ratio;
  const height = imageHeight * ratio;

  return {
    x: boxX + (boxWidth - width) / 2,
    y: boxY + (boxHeight - height) / 2,
    width,
    height,
  };
};
