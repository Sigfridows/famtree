declare module "*.png" {
  const content: import("next/image").StaticImageData | string;
  export default content;
}

declare module "*.jpg" {
  const content: import("next/image").StaticImageData | string;
  export default content;
}

declare module "*.jpeg" {
  const content: import("next/image").StaticImageData | string;
  export default content;
}

declare module "*.svg" {
  const content: import("next/image").StaticImageData | string;
  export default content;
}