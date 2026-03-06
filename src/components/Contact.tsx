import { MdArrowOutward, MdCopyright } from "react-icons/md";
import "./styles/Contact.css";

const Contact = () => {
  return (
    <div className="contact-section section-container" id="contact">
      <div className="contact-container">
        <h3>Contact</h3>
        <div className="contact-flex">
          <div className="contact-box">
            <h4>Email</h4>
            <p>
              <a href="mailto:thammasorn.chen@gmail.com" data-cursor="disable">
                thammasorn.chen@gmail.com
              </a>
            </p>
            <h4>Location</h4>
            <p>
              <a data-cursor="disable">
                Rayong, Thailand
              </a>
            </p>
          </div>
          <div className="contact-box">
            <h4>Social</h4>
            <a
              href="https://www.facebook.com/thammasorn.chen"
              target="_blank"
              data-cursor="disable"
              className="contact-social"
            >
              Facebook <MdArrowOutward />
            </a>
            <a
              href="https://www.instagram.com/dontknowuser_alpha"
              target="_blank"
              data-cursor="disable"
              className="contact-social"
            >
              Instagram <MdArrowOutward />
            </a>
            <a
              href="https://discord.com/channels/@me/698520080979591258"
              target="_blank"
              data-cursor="disable"
              className="contact-social"
            >
              Discord <MdArrowOutward />
            </a>
            <a
              href="https://github.com/noonzx2552"
              target="_blank"
              data-cursor="disable"
              className="contact-social"
            >
              Github <MdArrowOutward />
            </a>
          </div>
          <div className="contact-box">
            <h2>
              Designed and Developed <br /> by <span>Non Thammasorn</span>
            </h2>
            <h5>
              <MdCopyright /> 2026
            </h5>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
