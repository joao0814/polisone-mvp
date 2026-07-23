const PHOTO_IDS = [12, 18, 23, 28, 32, 37, 41, 47, 52, 58, 63, 69];

export function getAvatarPhoto(name) {
  const source = String(name || "Pessoa");
  let hash = 0;

  for (let index = 0; index < source.length; index += 1) {
    hash = (hash * 31 + source.charCodeAt(index)) >>> 0;
  }

  const photoId = PHOTO_IDS[hash % PHOTO_IDS.length];
  return `https://i.pravatar.cc/120?img=${photoId}`;
}
