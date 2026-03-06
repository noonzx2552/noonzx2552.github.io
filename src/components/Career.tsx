import "./styles/Career.css";

const Career = () => {
  return (
    <div className="career-section section-container">
      <div className="career-container">
        <h2>
          My journey <span>in</span>
          <br /> Tech
        </h2>
        <div className="career-info">
          <div className="career-timeline">
            <div className="career-dot"></div>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Fullstack <br />Developer</h4>
              </div>
              <h3>2020</h3>
            </div>
            <p>
              Started building web applications with both frontend and backend
              technologies, focusing on practical projects and problem solving.
            </p>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Graphic <br />Designer</h4>
              </div>
              <h3>2024</h3>
            </div>
            <p>
              Expanded into visual design, creating posters, digital assets,
              and UI concepts with a stronger focus on layout and branding.
            </p>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>CTF Competitor</h4>
              </div>
              <h3>2025</h3>
            </div>
            <p>
              Began solving CTF challenges in web, reverse, crypto, and pwn to
              strengthen offensive security skills and analytical thinking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Career;
