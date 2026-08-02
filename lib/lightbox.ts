export function lockLightbox() {
  document.body.classList.add("lightbox-open");
  document.body.style.overflow = "hidden";
}

export function unlockLightbox() {
  document.body.classList.remove("lightbox-open");
  document.body.style.overflow = "";
}