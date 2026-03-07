import "./styles/Work.css";
import WorkImage from "./WorkImage";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect } from "react";

gsap.registerPlugin(ScrollTrigger);

const projects = [
  {
    id: "01",
    name: "Sprint to Survive",
    category: "Game For Education",
    tools: "C#, Unity",
    image: "/images/placeholder.webp",
    link: "https://github.com/noonzx2552/Sprint_to_Survive",
  },
  {
    id: "02",
    name: "PyVenturer",
    category: "Game For Education",
    tools: "C#, Python, HTML/CSS, JS, Chatgpt-api, Unity",
    image: "/images/placeholder.webp",
    link: "https://github.com/noonzx2552/PyVenture_ide",
  },
  {
    id: "03",
    name: "Sentinel AI",
    category: "Real-Time Scam Detection App",
    tools: "Kotlin, Groovy DSL (Gradle), XML, Python",
    image: "/images/placeholder.webp",
    link: "https://drive.google.com/drive/folders/1T07EJEiqdsswsau2UxPTpCWrAjx2QPll?usp=sharing",
  },
  {
    id: "04",
    name: "Folio Website",
    category: "Graphic Design",
    tools: "HTML, CSS, JavaScript, SCSS, jQuery, Bootstrap",
    image: "/images/myself02.png",
    link: "https://github.com/",
  },
  {
    id: "05",
    name: "Phising Detection",
    category: "Scam Detection",
    tools: "TyprScript, HTML, CSS, JavaScript",
    image: "/images/phishing-detection.png",
    link: "https://somebodyingali.github.io/somebodyingali/",
  },
  {
    id: "06",
    name: "24 solver",
    category: "math",
    tools: "HTML, CSS, JavaScript",
    image: "/images/24solve.png",
    link: "https://github.com/",
  },
];

const Work = () => {
  useEffect(() => {
    let translateX = 0;

    function setTranslateX() {
      const box = document.getElementsByClassName("work-box");
      const firstBox = box[0] as HTMLElement | undefined;
      const container = document.querySelector(".work-container");
      if (!firstBox || !container) return false;

      const rectLeft = container.getBoundingClientRect().left;
      const rect = firstBox.getBoundingClientRect();
      const parentWidth = firstBox.parentElement?.getBoundingClientRect().width;
      if (!parentWidth) return false;

      const padding = parseInt(window.getComputedStyle(firstBox).padding) / 2;
      translateX = rect.width * box.length - (rectLeft + parentWidth) + padding;
      return true;
    }

    if (!setTranslateX()) return;

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: ".work-section",
        start: "top top",
        end: `+=${translateX}`,
        scrub: true,
        pin: true,
        id: "work",
      },
    });

    timeline.to(".work-flex", {
      x: -translateX,
      ease: "none",
    });

    return () => {
      timeline.kill();
      ScrollTrigger.getById("work")?.kill();
    };
  }, []);

  return (
    <div className="work-section" id="work">
      <div className="work-container section-container">
        <h2>
          My <span>Project</span>
        </h2>
        <div className="work-flex">
          {projects.map((project) => (
            <div className="work-box" key={project.id}>
              <div className="work-info">
                <div className="work-title">
                  <h3>{project.id}</h3>

                  <div>
                    <h4>{project.name}</h4>
                    <p>{project.category}</p>
                  </div>
                </div>
                <h4>Tools and features</h4>
                <p>{project.tools}</p>
              </div>
              <WorkImage
                image={project.image}
                alt={project.name}
                link={project.link}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Work;
