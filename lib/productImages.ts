import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { firebaseApp } from '@/lib/firebase';

const storage = getStorage(firebaseApp);
const MAX_BYTES = 5 * 1024 * 1024;

function extensionFor(contentType: string) {
  if (contentType.includes('png')) return 'png';
  if (contentType.includes('webp')) return 'webp';
  if (contentType.includes('gif')) return 'gif';
  return 'jpg';
}

/** Upload a picked photo and return a public download URL stored on the product. */
export async function uploadProductImage(productId: string, uri: string, contentType = 'image/jpeg') {
  const response = await fetch(uri);
  const blob = await response.blob();
  if (blob.size > MAX_BYTES) {
    throw new Error('Image must be under 5 MB');
  }
  const type = blob.type?.startsWith('image/') ? blob.type : contentType;
  const safeId = productId.replace(/[^a-zA-Z0-9_-]/g, '') || 'draft';
  const path = `products/${safeId}/${Date.now()}.${extensionFor(type)}`;
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, blob, { contentType: type });
  return getDownloadURL(fileRef);
}
