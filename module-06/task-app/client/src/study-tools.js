function luminance(hex) {
  if (typeof hex !== 'string' || !/^#[0-9a-f]{6}$/i.test(hex)) throw new Error('Use a six-digit hex color, such as #174ca1.');
  const linear = [1,3,5].map(i => parseInt(hex.slice(i,i+2),16)/255)
    .map(v => v <= 0.04045 ? v/12.92 : ((v+0.055)/1.055)**2.4);
  return linear[0]*0.2126 + linear[1]*0.7152 + linear[2]*0.0722;
}
export function contrastRatio(foreground, background) {
  const a=luminance(foreground), b=luminance(background);
  return (Math.max(a,b)+0.05)/(Math.min(a,b)+0.05);
}
export function allowedResourceUrl(raw) {
  if (typeof raw !== 'string') return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:' || url.username || url.password) return null;
    return url.href;
  } catch { return null; }
}
