import React from 'react';
import Certificate from '../../components/Certificate';

const CertificatePreview = () => {
  return (
    <div className="page dashboard-page">
      <div className="page-header">
        <div>
          <h2>Certificate Preview</h2>
          <p>Preview of the generated certificate</p>
        </div>
      </div>
      
      <div className="content-area" style={{ display: 'flex', justifyContent: 'center', background: '#e8ecf1', padding: '40px' }}>
        <Certificate name="SAMPLE DONOR" date="30 September 2026" />
      </div>
    </div>
  );
};

export default CertificatePreview;
