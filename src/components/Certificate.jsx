import React from 'react';
import './Certificate.css';
import logo from '../assets/envision_logo.webp';

const Certificate = ({ name, date }) => {
  return (
    <div className="certificate-wrapper">
      <div className="certificate-container" id="certificate-print-area">
        <div className="certificate-border-outer">
          <div className="certificate-border-inner">
            
            {/* Background decorative elements */}
            <div className="corner-decor bottom-left"></div>
            <div className="corner-decor bottom-right"></div>

            <div className="certificate-content">
              <img src={logo} alt="EnVision Foundation" className="certificate-logo" />
              
              <h1 className="certificate-title">CERTIFICATE</h1>
              
              <div className="certificate-subtitle-wrapper">
                <span className="line"></span>
                <span className="certificate-of">OF</span>
                <span className="line"></span>
              </div>
              
              <h2 className="certificate-appreciation">APPRECIATION</h2>

              <p className="certificate-presented">This certificate is proudly presented to</p>
              
              <h3 className="certificate-name">{name || 'PIYUSH'}</h3>
              
              <div className="diamond-separator"></div>

              <p className="certificate-body">
                In profound recognition of your outstanding contribution and unwavering 
                commitment to the <strong>EnVision Foundation</strong>. Your generosity and selfless dedication 
                play a pivotal role in our mission of <em>"Learning Beyond Books"</em>, enabling us to 
                educate, empower, and nurture the hidden creativity of underprivileged children. 
                We deeply value your invaluable support in driving meaningful change.
              </p>

              <div className="certificate-date-wrapper">
                <div className="date-line"><span>Awarded on</span></div>
                <p className="certificate-date">{date || '30 September 2026'}</p>
              </div>

              <div className="certificate-signatures">
                <div className="signature-block">
                  <div className="signature-line"></div>
                  <p className="signature-title">President</p>
                  <p className="signature-org">EnVision Foundation</p>
                </div>
                <div className="signature-block">
                  <div className="signature-line"></div>
                  <p className="signature-title">Authorized Signatory</p>
                  <p className="signature-org">EnVision Foundation</p>
                </div>
              </div>

              <div className="certificate-quote-container">
                <div className="certificate-quote">
                  <p>"The best way to find yourself is to lose yourself<br/>in the service of others."</p>
                  <p className="quote-author">— Mahatma Gandhi</p>
                </div>
              </div>

            </div>
          </div>
        </div>
        <div className="certificate-footer">
          Designed and developed by <strong>Piyush Assudani</strong>, Founder Assudani Developer &nbsp;|&nbsp; Contact: 9413879444
        </div>
      </div>
    </div>
  );
};

export default Certificate;
