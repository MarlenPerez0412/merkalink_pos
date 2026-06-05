const safeDecodeURIComponent = (value = '') => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const decodeBase64Url = (value = '') => {
  try {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
    const decoded = atob(padded);
    return decoded.startsWith('http://') || decoded.startsWith('https://') ? decoded : null;
  } catch {
    return null;
  }
};

const decodeBase64UrlChunk = (value = '') => {
  try {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
    return atob(padded);
  } catch {
    return '';
  }
};

export const getExternalImageUrlCandidate = (imagenUrl = '') => {
  const valor = String(imagenUrl || '').trim();
  if (!/^https?:\/\//i.test(valor)) return null;

  try {
    const url = new URL(valor);
    const queryKeys = ['imgurl', 'mediaurl', 'image_url', 'url'];

    for (const key of queryKeys) {
      const candidate = url.searchParams.get(key);
      if (candidate && /^https?:\/\//i.test(safeDecodeURIComponent(candidate))) {
        return safeDecodeURIComponent(candidate);
      }
    }

    if (url.hostname.includes('imgs.search.brave.com')) {
      const parts = url.pathname.split('/').filter(Boolean);
      const encodedStartIndex = parts.findIndex((part) => part.startsWith('g:'));

      if (encodedStartIndex >= 0) {
        const encodedParts = parts.slice(encodedStartIndex + 1);
        const decodedByChunks = encodedParts.map(decodeBase64UrlChunk).join('');

        if (/^https?:\/\//i.test(decodedByChunks)) {
          return decodedByChunks;
        }

        for (let length = encodedParts.length; length > 0; length -= 1) {
          const decoded = decodeBase64Url(encodedParts.slice(0, length).join('/'));
          if (decoded && decoded.length > 20) return decoded;
        }
      }

      for (const part of parts) {
        const decoded = decodeBase64Url(part);
        if (decoded && decoded.length > 20) return decoded;
      }
    }
  } catch {
    return null;
  }

  return null;
};

export const getImageSrc = (imagenUrl = '') => {
  const valor = String(imagenUrl || '').trim();

  if (!valor) return null;
  if (/^https?:\/\//i.test(valor)) return getExternalImageUrlCandidate(valor) || valor;

  const ruta = valor.replaceAll('\\', '/');
  if (ruta.startsWith('/images/')) return ruta;
  if (ruta.startsWith('images/')) return `/${ruta}`;
  if (/^\/?public\/images\//i.test(ruta)) return ruta.replace(/^\/?public\/images\//i, '/images/');

  return ruta.startsWith('/') ? ruta : `/${ruta}`;
};
