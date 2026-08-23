/**
 * Responsive image helpers for Cloudinary-hosted assets.
 *
 * Product/category/brand imagery lives on Cloudinary, but until now every
 * <img> downloaded the stored original regardless of display size. These
 * helpers insert Cloudinary URL transformations and build `srcSet`/`sizes`
 * so the browser fetches the smallest adequate variant (format auto-negotiated
 * via f_auto, quality auto via q_auto).
 *
 * Non-Cloudinary URLs (local `/uploads/...`, placeholders) are passed through
 * untouched — callers always get a usable `src`.
 */

const UPLOAD_MARKER = "/image/upload/";

/** True when the URL points at a Cloudinary `image/upload` delivery. */
export function isCloudinaryUrl(url: string): boolean {
  return url.includes(UPLOAD_MARKER);
}

/**
 * Return the Cloudinary URL for `url` constrained to `width` CSS pixels.
 * Transformations are inserted directly after the `/image/upload/` segment —
 * Cloudinary requires them to precede the optional version prefix
 * (`/upload/{transforms}/{v123}/{public_id}`), otherwise the transform string
 * becomes part of the public id and delivery 404s.
 *
 * `c_limit` never upscales beyond the original; `f_auto`/`q_auto` let
 * Cloudinary pick format and quality per client.
 */
export function cloudinaryWidthUrl(url: string, width: number): string {
  const markerIndex = url.indexOf(UPLOAD_MARKER);
  if (markerIndex === -1) return url;

  const insertAt = markerIndex + UPLOAD_MARKER.length;
  const transformation = `f_auto,q_auto,c_limit,w_${width}`;

  return `${url.slice(0, insertAt)}${transformation}/${url.slice(insertAt)}`;
}

export interface ResponsiveImageProps {
  src: string;
  srcSet?: string;
  sizes?: string;
}

/**
 * Build ready-to-spread `<img>` props for a product image.
 *
 * - Cloudinary URLs get a mid-width `src` fallback plus a full `srcSet`
 *   candidate ladder and the caller's `sizes` hint.
 * - Any other URL is returned as a plain `src` (no srcset), preserving
 *   existing behavior for local uploads and placeholder assets.
 */
export function responsiveImageProps(
  url: string | null | undefined,
  widths: number[],
  sizes: string
): ResponsiveImageProps {
  if (!url) return { src: "/placeholder.png" };
  if (!isCloudinaryUrl(url)) return { src: url };

  const middleWidth = widths[Math.floor(widths.length / 2)];
  return {
    src: cloudinaryWidthUrl(url, middleWidth),
    srcSet: widths
      .map((w) => `${cloudinaryWidthUrl(url, w)} ${w}w`)
      .join(", "),
    sizes,
  };
}
