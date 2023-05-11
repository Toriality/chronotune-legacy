const sections = document.querySelectorAll(".section");
sections.forEach((section) => {
  const title = section.querySelector(".title");
  const content = section.querySelector(".content");
  section.addEventListener("mouseenter", () => {
    section.style.overflowY = "scroll";
    title.style.opacity = "0";
    content.style.opacity = "1";
  });
  section.addEventListener("mouseleave", () => {
    section.style.overflowY = "hidden";
    title.style.opacity = "1";
    content.style.opacity = "0";
    section.scrollTo(0, 0);
  });
});
