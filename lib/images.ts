export function getImageUrl(
  image?: string | null
) {

  if (!image) {
    return "/placeholder-product.png";
  }

  if (
    image.startsWith("http")
  ) {
    return image;
  }

  return `${process.env.NEXT_PUBLIC_STORAGE_URL}${image}`;

}