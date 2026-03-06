import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HoverLinks from "./HoverLinks";
import { gsap } from "gsap";
import "./styles/Navbar.css";

gsap.registerPlugin(ScrollTrigger);

type SmootherController = {
  paused: (state: boolean) => void;
  scrollTop: (value: number) => void;
  scrollTo: (selector: string) => void;
};

export let smoother: SmootherController = {
  paused: (state: boolean) => {
    document.body.style.overflowY = state ? "hidden" : "auto";
  },
  scrollTop: (value: number) => {
    window.scrollTo({ top: value, behavior: "auto" });
  },
  scrollTo: (selector: string) => {
    const section = document.querySelector<HTMLElement>(selector);
    section?.scrollIntoView({ behavior: "smooth", block: "start" });
  },
};

const Navbar = () => {
  useEffect(() => {
    smoother.scrollTop(0);
    smoother.paused(true);

    const links = document.querySelectorAll(".header ul a");
    const clickHandlers: Array<{
      element: HTMLAnchorElement;
      handler: (e: Event) => void;
    }> = [];

    links.forEach((elem) => {
      const element = elem as HTMLAnchorElement;
      const handler = (e: Event) => {
        if (window.innerWidth > 1024) {
          e.preventDefault();
          const target = e.currentTarget as HTMLAnchorElement;
          const section = target.getAttribute("data-href");
          if (section) smoother.scrollTo(section);
        }
      };
      element.addEventListener("click", handler);
      clickHandlers.push({ element, handler });
    });

    const resizeHandler = () => ScrollTrigger.refresh();
    window.addEventListener("resize", resizeHandler);

    return () => {
      window.removeEventListener("resize", resizeHandler);
      clickHandlers.forEach(({ element, handler }) => {
        element.removeEventListener("click", handler);
      });
    };
  }, []);
  return (
    <>
      <div className="header">
        <a href="/#" className="navbar-title" data-cursor="disable">
          U$3R
        </a>
        <ul>
          <li>
            <a data-href="#about" href="#about">
              <HoverLinks text="ABOUT" />
            </a>
          </li>
          <li>
            <a data-href="#work" href="#work">
              <HoverLinks text="WORK" />
            </a>
          </li>
          <li>
            <a data-href="#contact" href="#contact">
              <HoverLinks text="CONTACT" />
            </a>
          </li>
        </ul>
      </div>

      <div className="landing-circle1"></div>
      <div className="landing-circle2"></div>
      <div className="nav-fade"></div>
    </>
  );
};

export default Navbar;
