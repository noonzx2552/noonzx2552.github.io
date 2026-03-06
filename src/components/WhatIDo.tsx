import { useMemo, useState } from "react";
import "./styles/WhatIDo.css";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const WhatIDo = () => {
  const isTouchDevice = useMemo(() => ScrollTrigger.isTouch > 0, []);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const getContentClassName = (index: number) => {
    const classes = ["what-content"];
    if (!isTouchDevice) classes.push("what-noTouch");
    if (activeIndex === index) classes.push("what-content-active");
    if (activeIndex !== null && activeIndex !== index) classes.push("what-sibling");
    return classes.join(" ");
  };

  const handleTouchToggle = (index: number) => {
    if (!isTouchDevice) return;
    setActiveIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="whatIDO">
      <div className="what-box">
        <h2 className="title">
          W<span className="hat-h2">HAT</span>
          <div>
            I<span className="do-h2"> DO</span>
          </div>
        </h2>
      </div>
      <div className="what-box">
        <div className="what-box-in">
          <div className="what-border2">
            <svg width="100%">
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="100%"
                stroke="white"
                strokeWidth="2"
                strokeDasharray="7,7"
              />
              <line
                x1="100%"
                y1="0"
                x2="100%"
                y2="100%"
                stroke="white"
                strokeWidth="2"
                strokeDasharray="7,7"
              />
            </svg>
          </div>
          <div
            className={getContentClassName(0)}
            onClick={() => handleTouchToggle(0)}
          >
            <div className="what-border1">
              <svg height="100%">
                <line
                  x1="0"
                  y1="0"
                  x2="100%"
                  y2="0"
                  stroke="white"
                  strokeWidth="2"
                  strokeDasharray="6,6"
                />
                <line
                  x1="0"
                  y1="100%"
                  x2="100%"
                  y2="100%"
                  stroke="white"
                  strokeWidth="2"
                  strokeDasharray="6,6"
                />
              </svg>
            </div>
            <div className="what-corner"></div>

            <div className="what-content-in">
              <h3>DEVELOP</h3>
              <h4>Description</h4>
              <p>
                I build practical full-stack applications, from UI/UX and
                frontend interactions to backend APIs, databases, and
                deployment-ready systems.
              </p>
              <h5>Skillset & tools</h5>
              <div className="what-content-flex">
                <div className="what-tags">Python</div>
                <div className="what-tags">C</div>
                <div className="what-tags">C++</div>
                <div className="what-tags">C#</div>
                <div className="what-tags">JS</div>
                <div className="what-tags">React</div>
                <div className="what-tags">Kotlin</div>
                <div className="what-tags">PHP</div>
                <div className="what-tags">MySql</div>
                <div className="what-tags">Unity</div>
                <div className="what-tags">Blender</div>
                <div className="what-tags">Figma</div>
                <div className="what-tags">Raspi</div>
              </div>
              <div className="what-arrow"></div>
            </div>
          </div>
          <div
            className={getContentClassName(1)}
            onClick={() => handleTouchToggle(1)}
          >
            <div className="what-border1">
              <svg height="100%">
                <line
                  x1="0"
                  y1="100%"
                  x2="100%"
                  y2="100%"
                  stroke="white"
                  strokeWidth="2"
                  strokeDasharray="6,6"
                />
              </svg>
            </div>
            <div className="what-corner"></div>
            <div className="what-content-in">
              <h3>CyberSecurity</h3>
              <h4>Description</h4>
              <p>
                I solve CTF challenges across web, crypto, reverse, and pwn
                categories to strengthen offensive security skills and
                real-world problem solving.
              </p>
              <h5>Skillset & tools</h5>
              <div className="what-content-flex">
                <div className="what-tags">Web Exploitation</div>
                <div className="what-tags">Reverse Engineering</div>
                <div className="what-tags">Pwn</div>
                <div className="what-tags">Cryptography</div>
                <div className="what-tags">Forensics</div>
                <div className="what-tags">Network Security</div>
              </div>
              <div className="what-arrow"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatIDo;
