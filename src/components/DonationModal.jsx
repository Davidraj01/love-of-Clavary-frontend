import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Heart, ShieldCheck, CheckCircle, Printer, Mail, 
  Phone, User, Lock, X, Loader2, Sparkles, 
  QrCode, Landmark, CreditCard, Copy, Check, ExternalLink,
  ArrowRight, AlertCircle, Info, Smartphone
} from 'lucide-react';

const PRESET_AMOUNTS = [250, 500, 1000, 2500, 5000, 10000];

const CAUSES = [
  'General Ministry & Gospel Outreach',
  'Sunday Worship & Pastoral Care',
  'Community Relief & Poor Feeding',
  'Bible Study & Discipleship Material',
  'Youth & Children Ministry Support',
  'Church Building & Media Equipment',
];

const DEFAULT_UPI_ID = 'dr.s.davidraj-1@okicici';

export const DonationModal = ({ isOpen, onClose, defaultAmount = 500, defaultCause = '' }) => {
  const [activeTab, setActiveTab] = useState('upi'); // 'upi', 'bank', 'razorpay'
  const [amount, setAmount] = useState(defaultAmount);
  const [customAmount, setCustomAmount] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [cause, setCause] = useState(defaultCause || CAUSES[0]);
  
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [prayerNote, setPrayerNote] = useState('');
  const [referenceId, setReferenceId] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successReceipt, setSuccessReceipt] = useState(null);
  const [paymentConfig, setPaymentConfig] = useState(null);

  const [copiedField, setCopiedField] = useState('');

  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      api.getPaymentConfig()
        .then(cfg => setPaymentConfig(cfg))
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentAmount = isCustom ? parseFloat(customAmount) || 0 : amount;

  const handlePresetSelect = (val) => {
    setIsCustom(false);
    setAmount(val);
    setCustomAmount('');
  };

  const handleCustomChange = (e) => {
    setIsCustom(true);
    setCustomAmount(e.target.value);
  };

  const copyToClipboard = (text, fieldName) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(''), 2500);
    }
  };

  // UPI and Ministry details
  const upiId = paymentConfig?.upi_id || DEFAULT_UPI_ID;
  const ministryName = paymentConfig?.ministry_name || 'Compassionate Love of Calvary Ministries';
  const bankName = paymentConfig?.bank_name || 'Industrial Credit and Investment Corporation of India';
  const accountName = paymentConfig?.account_name || 'Compassionate Love of Calvary Ministries / Pastor David Raj';
  const accountNo = paymentConfig?.account_no || '039801507262';
  const ifscCode = paymentConfig?.ifsc_code || 'ICIC0000398';
  const branchName = paymentConfig?.branch || 'Chengalpattu';
  const ownerPhone = paymentConfig?.owner_phone || '+91 9994401291';
  const ownerEmail = paymentConfig?.owner_email || 'davidraj2107@gmail.com';


  // Construct optimized standard Indian NPCI UPI URI with live amount & payee name
  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(ministryName)}&am=${currentAmount > 0 ? currentAmount : ''}&cu=INR&tn=${encodeURIComponent(cause || 'Offering')}`;
  
  // High-reliability QR generator with High Error Correction (ECC=H)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&ecc=H&margin=10&data=${encodeURIComponent(upiUri)}`;

  // Handle Direct Submission (UPI Scanner / Bank Transfer)
  const handleDirectSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (currentAmount < 1) {
      setErrorMsg('Please enter a valid donation amount of at least ₹1.00');
      return;
    }
    if (!donorName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!donorEmail.trim() || !donorEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address to receive your official receipt.');
      return;
    }
    if (!referenceId.trim()) {
      setErrorMsg(activeTab === 'upi' 
        ? 'Please enter the 12-digit UPI UTR / Transaction ID from your payment app (GPay/PhonePe/Paytm).' 
        : 'Please enter the  Transfer UTR / Reference ID.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.submitDirectDonation({
        donor_name: donorName.trim(),
        donor_email: donorEmail.trim(),
        donor_phone: donorPhone.trim(),
        amount: currentAmount,
        purpose: cause,
        prayer_note: prayerNote.trim(),
        payment_method: activeTab === 'upi' ? 'UPI_QR' : 'BANK_TRANSFER',
        reference_id: referenceId.trim(),
      });

      if (res.success && res.receipt) {
        setSuccessReceipt(res.receipt);
      } else {
        setErrorMsg(res.message || 'Could not verify submission.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error submitting offering details. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Razorpay Gateway Flow
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpaySubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (currentAmount < 1) {
      setErrorMsg('Please enter a valid donation amount of at least ₹1.00');
      return;
    }
    if (!donorName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!donorEmail.trim() || !donorEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address to receive your official receipt.');
      return;
    }

    setLoading(true);

    try {
      const orderRes = await api.createRazorpayOrder({
        donor_name: donorName.trim(),
        donor_email: donorEmail.trim(),
        donor_phone: donorPhone.trim(),
        amount: currentAmount,
        purpose: cause,
        prayer_note: prayerNote.trim(),
      });

      if (!orderRes.success) {
        throw new Error(orderRes.message || 'Failed to initialize payment.');
      }

      await loadRazorpayScript();

      const keyId = orderRes.key_id;
      const isDemoKey = !keyId || keyId.startsWith('rzp_test_clmDemo');

      if (window.Razorpay && !isDemoKey) {
        const options = {
          key: keyId,
          amount: orderRes.amount,
          currency: orderRes.currency || 'INR',
          name: orderRes.ministry_name || ministryName,
          description: `Offering: ${cause}`,
          order_id: orderRes.order_id,
          image: 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&w=200&q=80',
          prefill: {
            name: donorName,
            email: donorEmail,
            contact: donorPhone,
          },
          notes: {
            purpose: cause,
            beneficiary: `Pastor David Raj (${ownerPhone})`,
          },
          theme: {
            color: '#0B192C',
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
            },
          },
          handler: async function (response) {
            try {
              const verifyRes = await api.verifyRazorpayPayment({
                razorpay_order_id: response.razorpay_order_id || orderRes.order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              if (verifyRes.success) {
                setSuccessReceipt(verifyRes.receipt);
              } else {
                setErrorMsg(verifyRes.message || 'Payment verification failed.');
              }
            } catch (err) {
              setErrorMsg(err.message || 'Error verifying payment.');
            } finally {
              setLoading(false);
            }
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          setErrorMsg(`Payment failed: ${response.error.description || 'Transaction declined.'}`);
          setLoading(false);
        });
        rzp.open();
      } else {
        // When demo key is configured in local test mode, simulate verification
        const mockPaymentId = `pay_sim_${Date.now()}`;
        const mockSignature = `sig_sim_${Math.random().toString(36).substring(2)}`;
        
        const verifyRes = await api.verifyRazorpayPayment({
          razorpay_order_id: orderRes.order_id,
          razorpay_payment_id: mockPaymentId,
          razorpay_signature: mockSignature,
        });

        if (verifyRes.success) {
          setSuccessReceipt(verifyRes.receipt);
        } else {
          setErrorMsg(verifyRes.message || 'Payment verification simulation failed.');
        }
        setLoading(false);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Could not connect to Razorpay. Please use the UPI Scanner or Bank Transfer option.');
      setLoading(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 3000, padding: '0.75rem' }}>
      <div className="donation-modal-content" style={{ maxWidth: successReceipt ? '700px' : '640px' }}>
        {/* Header Banner */}
        <div className="donation-modal-header">
          <button
            onClick={onClose}
            aria-label="Close Modal"
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              color: '#FFFFFF',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <X size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingRight: '2.5rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'rgba(212, 175, 55, 0.2)',
              color: 'var(--gold-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              flexShrink: 0
            }}>
              <Heart size={20} fill="currentColor" />
            </div>
            <div>
              <h3 style={{ margin: 0, color: '#FFFFFF', fontSize: '1.25rem', fontFamily: 'var(--font-heading)', lineHeight: 1.2 }}>
                {successReceipt ? 'Donation Receipt & Blessing' : 'Give & Support Calvary Ministries'}
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--gold-light)' }}>
                Compassionate Love of Calvary Ministries &bull; Pastor David Raj
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="donation-modal-body">
          {successReceipt ? (
            /* =============================================================
               RECEIPT VIEW (Printable & Downloadable)
               ============================================================= */
            <div id="clm-printable-receipt" style={{ color: '#1E293B' }}>
              <div style={{
                textAlign: 'center',
                background: 'linear-gradient(180deg, #F0FDF4 0%, #DCFCE7 100%)',
                border: '1px solid #86EFAC',
                borderRadius: '12px',
                padding: '1.25rem',
                marginBottom: '1.25rem'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: '#16A34A',
                  color: '#FFFFFF',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.4rem',
                  boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)'
                }}>
                  <CheckCircle size={28} />
                </div>
                <h4 style={{ margin: '0 0 0.25rem 0', color: '#166534', fontSize: '1.2rem' }}>
                  Offering Verified Successfully!
                </h4>
                <p style={{ margin: 0, color: '#15803D', fontSize: '0.85rem' }}>
                  An official receipt has been dispatched to <strong>{successReceipt.donor_email}</strong>.
                </p>
              </div>

              {/* Official Receipt Card */}
              <div style={{
                border: '2px dashed var(--gold-primary)',
                borderRadius: '12px',
                padding: '1.25rem',
                background: '#FAFAF9',
                marginBottom: '1.25rem',
                position: 'relative'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #E7E5E4', paddingBottom: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <h5 style={{ margin: 0, fontSize: '1rem', color: '#0B192C', fontFamily: 'var(--font-heading)' }}>
                      Compassionate Love of Calvary Ministries
                    </h5>
                    <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#78716C' }}>
                      Official Charitable Offering Receipt
                    </p>
                  </div>
                  <div>
                    <span style={{
                      display: 'inline-block',
                      background: 'rgba(212, 175, 55, 0.15)',
                      color: '#854D0E',
                      fontWeight: '700',
                      fontSize: '0.78rem',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '6px',
                      border: '1px solid rgba(212, 175, 55, 0.4)'
                    }}>
                      {successReceipt.receipt_no}
                    </span>
                  </div>
                </div>

                <div className="donation-receipt-grid" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
                  <div>
                    <span style={{ color: '#78716C', display: 'block', fontSize: '0.72rem' }}>Donor Name</span>
                    <strong style={{ color: '#0B192C', fontSize: '0.92rem' }}>{successReceipt.donor_name}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#78716C', display: 'block', fontSize: '0.72rem' }}>Date & Time</span>
                    <strong style={{ color: '#0B192C' }}>{successReceipt.date_str}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#78716C', display: 'block', fontSize: '0.72rem' }}>Donor Email & Phone</span>
                    <span style={{ color: '#0B192C', wordBreak: 'break-all' }}>{successReceipt.donor_email} {successReceipt.donor_phone ? `(${successReceipt.donor_phone})` : ''}</span>
                  </div>
                  <div>
                    <span style={{ color: '#78716C', display: 'block', fontSize: '0.72rem' }}>Transaction / UTR Reference</span>
                    <span style={{ fontFamily: 'monospace', color: '#0B192C', fontSize: '0.82rem', wordBreak: 'break-all' }}>{successReceipt.razorpay_payment_id}</span>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <span style={{ color: '#78716C', display: 'block', fontSize: '0.72rem' }}>Purpose of Offering</span>
                    <strong style={{ color: '#0B192C' }}>{successReceipt.purpose}</strong>
                  </div>
                </div>

                {successReceipt.prayer_note && (
                  <div style={{ background: '#FEF3C7', padding: '0.65rem 0.85rem', borderRadius: '8px', fontSize: '0.82rem', color: '#92400E', marginBottom: '1rem' }}>
                    <strong>Prayer Request:</strong> "{successReceipt.prayer_note}"
                  </div>
                )}

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#0B192C',
                  color: '#FFFFFF',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}>
                  <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.9)' }}>Total Offering Amount:</span>
                  <span style={{ fontSize: '1.35rem', fontWeight: 'bold', color: 'var(--gold-primary)' }}>
                    ₹{Number(successReceipt.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })} INR
                  </span>
                </div>

                {/* Beneficiary Details Notice */}
                <div style={{ marginTop: '0.75rem', paddingTop: '0.65rem', borderTop: '1px solid #E7E5E4', fontSize: '0.75rem', color: '#78716C', textAlign: 'center' }}>
                  Direct Beneficiary: <strong>Pastor David Raj</strong> (+91 8248373375 | davidraj2107@gmail.com)
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handlePrintReceipt}
                  className="btn btn-gold"
                  style={{ flex: 1, minWidth: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                >
                  <Printer size={16} /> Print / Save Receipt
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSuccessReceipt(null);
                    onClose();
                  }}
                  className="btn btn-outline"
                  style={{ flex: 1, minWidth: '100px' }}
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* =============================================================
               MULTI-TAB GIVING MODAL (UPI Scanner, Bank Details, Razorpay)
               ============================================================= */
            <div>
              {errorMsg && (
                <div style={{
                  background: '#FEF2F2',
                  border: '1px solid #FCA5A5',
                  color: '#991B1B',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  fontSize: '0.85rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <AlertCircle size={18} style={{ flexShrink: 0 }} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Payment Methods Tab Switcher */}
              <div className="donation-tabs-grid">
                <button
                  type="button"
                  onClick={() => setActiveTab('upi')}
                  className={`donation-tab-btn ${activeTab === 'upi' ? 'active' : ''}`}
                >
                  <QrCode size={16} /> UPI Scanner
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('bank')}
                  className={`donation-tab-btn ${activeTab === 'bank' ? 'active' : ''}`}
                >
                  <Landmark size={16} /> Bank Details
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('razorpay')}
                  className={`donation-tab-btn ${activeTab === 'razorpay' ? 'active' : ''}`}
                >
                  <CreditCard size={16} /> Razorpay Online
                </button>
              </div>

              {/* Amount Selection Block */}
              <div style={{ marginBottom: '1.25rem', background: '#F8FAFC', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#0F172A', marginBottom: '0.45rem' }}>
                  Select Offering Amount (INR ₹)
                </label>
                
                <div className="donation-amounts-grid">
                  {PRESET_AMOUNTS.map((amt) => {
                    const selected = !isCustom && amount === amt;
                    return (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => handlePresetSelect(amt)}
                        className={`donation-amount-btn ${selected ? 'selected' : ''}`}
                      >
                        ₹{amt >= 1000 ? `${amt / 1000}k` : amt}
                      </button>
                    );
                  })}
                </div>

                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#64748B', fontWeight: '700' }}>
                    ₹
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Or enter custom amount (e.g. 1500)"
                    value={customAmount}
                    onChange={handleCustomChange}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.85rem 0.55rem 2rem',
                      borderRadius: '6px',
                      border: isCustom ? '2px solid var(--gold-primary)' : '1px solid #CBD5E1',
                      background: isCustom ? '#FFFBEB' : '#FFFFFF',
                      fontSize: '0.88rem',
                      fontWeight: isCustom ? '600' : 'normal'
                    }}
                  />
                </div>
              </div>

              {/* TAB 1: UPI QR SCANNER */}
              {activeTab === 'upi' && (
                <div>
                  <div style={{
                    background: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    borderRadius: '12px',
                    padding: '1rem',
                    marginBottom: '1.25rem',
                    textAlign: 'center'
                  }}>
                    <div style={{ display: 'inline-block', background: '#FFFFFF', padding: '0.5rem', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', border: '1px solid #E2E8F0', marginBottom: '0.75rem' }}>
                      <img 
                        src={qrCodeUrl} 
                        alt="Scan UPI QR Code to Pay" 
                        style={{ width: '160px', height: '160px', display: 'block', maxWidth: '100%', height: 'auto' }}
                      />
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.8rem', color: '#166534', fontWeight: '600' }}>UPI ID:</span>
                      <code style={{ background: '#DCFCE7', padding: '0.2rem 0.5rem', borderRadius: '6px', color: '#14532D', fontWeight: '700', fontSize: '0.85rem', wordBreak: 'break-all' }}>
                        {upiId}
                      </code>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(upiId, 'upi')}
                        style={{
                          background: '#166534',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '0.25rem 0.55rem',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        {copiedField === 'upi' ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy</>}
                      </button>
                    </div>

                    <p style={{ margin: '0 0 0.4rem 0', fontSize: '0.78rem', color: '#166534' }}>
                      Scan using <strong>GPay</strong>, <strong>PhonePe</strong>, <strong>Paytm</strong>, or <strong>BHIM</strong>
                    </p>

                    <a
                      href={upiUri}
                      className="btn btn-sm btn-gold hide-desktop"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        fontSize: '0.8rem',
                        padding: '0.4rem 0.85rem',
                        marginTop: '0.2rem'
                      }}
                    >
                      <Smartphone size={14} /> Open in UPI App
                    </a>
                  </div>

                  {/* Submission Form after Scanning */}
                  <form onSubmit={handleDirectSubmit}>
                    <div style={{ background: '#F8FAFC', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #E2E8F0', marginBottom: '1.25rem' }}>
                      <h4 style={{ margin: '0 0 0.65rem 0', fontSize: '0.88rem', color: '#0F172A', fontWeight: '700' }}>
                        Step 2: Enter Transaction Details for Instant Receipt
                      </h4>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.65rem' }}>
                        <div>
                          <input
                            type="text"
                            required
                            placeholder="12-digit UPI UTR / Transaction ID (from GPay/PhonePe/Paytm) *"
                            value={referenceId}
                            onChange={(e) => setReferenceId(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '0.6rem 0.85rem',
                              borderRadius: '6px',
                              border: '1px solid #CBD5E1',
                              fontSize: '0.88rem',
                              fontFamily: 'monospace',
                              background: '#FFFFFF'
                            }}
                          />
                        </div>

                        <div className="donation-form-grid-2">
                          <input
                            type="text"
                            required
                            placeholder="Your Full Name *"
                            value={donorName}
                            onChange={(e) => setDonorName(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '0.6rem 0.85rem',
                              borderRadius: '6px',
                              border: '1px solid #CBD5E1',
                              fontSize: '0.88rem'
                            }}
                          />
                          <input
                            type="email"
                            required
                            placeholder="Your Email (for receipt) *"
                            value={donorEmail}
                            onChange={(e) => setDonorEmail(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '0.6rem 0.85rem',
                              borderRadius: '6px',
                              border: '1px solid #CBD5E1',
                              fontSize: '0.88rem'
                            }}
                          />
                        </div>

                        <div className="donation-form-grid-2">
                          <input
                            type="tel"
                            placeholder="Phone Number (+91 ...)"
                            value={donorPhone}
                            onChange={(e) => setDonorPhone(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '0.6rem 0.85rem',
                              borderRadius: '6px',
                              border: '1px solid #CBD5E1',
                              fontSize: '0.88rem'
                            }}
                          />
                          <select
                            value={cause}
                            onChange={(e) => setCause(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '0.6rem 0.85rem',
                              borderRadius: '6px',
                              border: '1px solid #CBD5E1',
                              fontSize: '0.85rem',
                              background: '#FFFFFF'
                            }}
                          >
                            {CAUSES.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <input
                            type="text"
                            placeholder="Optional prayer request for Pastor David Raj..."
                            value={prayerNote}
                            onChange={(e) => setPrayerNote(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '0.55rem 0.85rem',
                              borderRadius: '6px',
                              border: '1px solid #CBD5E1',
                              fontSize: '0.85rem'
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-gold"
                      style={{
                        width: '100%',
                        padding: '0.8rem 1.25rem',
                        fontSize: '0.95rem',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 4px 15px rgba(212, 175, 55, 0.4)'
                      }}
                    >
                      {loading ? (
                        <>
                          <Loader2 size={18} className="animate-spin" /> Verifying & Generating Receipt...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={18} /> Confirm Offering & Get Official Receipt (₹{currentAmount})
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 2: BANK ACCOUNT DETAILS */}
              {activeTab === 'bank' && (
                <div>
                  <div style={{
                    background: '#F8FAFC',
                    border: '1px solid #CBD5E1',
                    borderRadius: '12px',
                    padding: '1rem',
                    marginBottom: '1.25rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0B192C', fontWeight: '700', fontSize: '0.95rem', marginBottom: '0.75rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.4rem' }}>
                      <Landmark size={18} color="var(--gold-primary)" /> Official Ministry Bank Account
                    </div>

                    <div className="donation-bank-grid" style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                      <div>
                        <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem' }}>Bank Name</span>
                        <strong style={{ color: '#0F172A' }}>{bankName}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem' }}>Branch / Account Type</span>
                        <strong style={{ color: '#0F172A' }}>{branchName}</strong>
                      </div>
                      
                      <div style={{ background: '#FFFFFF', padding: '0.55rem 0.7rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span style={{ color: '#64748B', display: 'block', fontSize: '0.7rem' }}>Account Number</span>
                            <strong style={{ fontFamily: 'monospace', fontSize: '0.98rem', color: '#0B192C' }}>{accountNo}</strong>
                          </div>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(accountNo, 'acc')}
                            style={{
                              background: '#0B192C',
                              color: '#D4AF37',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '0.3rem 0.55rem',
                              fontSize: '0.72rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.2rem'
                            }}
                          >
                            {copiedField === 'acc' ? <Check size={12} /> : <Copy size={12} />}
                          </button>
                        </div>
                      </div>

                      <div style={{ background: '#FFFFFF', padding: '0.55rem 0.7rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span style={{ color: '#64748B', display: 'block', fontSize: '0.7rem' }}>IFSC Code</span>
                            <strong style={{ fontFamily: 'monospace', fontSize: '0.98rem', color: '#0B192C' }}>{ifscCode}</strong>
                          </div>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(ifscCode, 'ifsc')}
                            style={{
                              background: '#0B192C',
                              color: '#D4AF37',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '0.3rem 0.55rem',
                              fontSize: '0.72rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.2rem'
                            }}
                          >
                            {copiedField === 'ifsc' ? <Check size={12} /> : <Copy size={12} />}
                          </button>
                        </div>
                      </div>

                      <div style={{ gridColumn: '1 / -1' }}>
                        <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem' }}>Account Holder / Beneficiary</span>
                        <strong style={{ color: '#0B192C' }}>{accountName}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Submission Form for Bank Transfer */}
                  <form onSubmit={handleDirectSubmit}>
                    <div style={{ background: '#F8FAFC', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #E2E8F0', marginBottom: '1.25rem' }}>
                      <h4 style={{ margin: '0 0 0.65rem 0', fontSize: '0.88rem', color: '#0F172A', fontWeight: '700' }}>
                        Submit Bank Transfer Reference / UTR
                      </h4>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.65rem' }}>
                        <div>
                          <input
                            type="text"
                            required
                            placeholder="Bank Transfer UTR / Transaction Reference Number *"
                            value={referenceId}
                            onChange={(e) => setReferenceId(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '0.6rem 0.85rem',
                              borderRadius: '6px',
                              border: '1px solid #CBD5E1',
                              fontSize: '0.88rem',
                              fontFamily: 'monospace',
                              background: '#FFFFFF'
                            }}
                          />
                        </div>

                        <div className="donation-form-grid-2">
                          <input
                            type="text"
                            required
                            placeholder="Your Full Name *"
                            value={donorName}
                            onChange={(e) => setDonorName(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '0.6rem 0.85rem',
                              borderRadius: '6px',
                              border: '1px solid #CBD5E1',
                              fontSize: '0.88rem'
                            }}
                          />
                          <input
                            type="email"
                            required
                            placeholder="Your Email (for receipt) *"
                            value={donorEmail}
                            onChange={(e) => setDonorEmail(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '0.6rem 0.85rem',
                              borderRadius: '6px',
                              border: '1px solid #CBD5E1',
                              fontSize: '0.88rem'
                            }}
                          />
                        </div>

                        <div className="donation-form-grid-2">
                          <input
                            type="tel"
                            placeholder="Phone Number (+91 ...)"
                            value={donorPhone}
                            onChange={(e) => setDonorPhone(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '0.6rem 0.85rem',
                              borderRadius: '6px',
                              border: '1px solid #CBD5E1',
                              fontSize: '0.88rem'
                            }}
                          />
                          <select
                            value={cause}
                            onChange={(e) => setCause(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '0.6rem 0.85rem',
                              borderRadius: '6px',
                              border: '1px solid #CBD5E1',
                              fontSize: '0.85rem',
                              background: '#FFFFFF'
                            }}
                          >
                            {CAUSES.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <input
                            type="text"
                            placeholder="Optional prayer request for Pastor David Raj..."
                            value={prayerNote}
                            onChange={(e) => setPrayerNote(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '0.55rem 0.85rem',
                              borderRadius: '6px',
                              border: '1px solid #CBD5E1',
                              fontSize: '0.85rem'
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-gold"
                      style={{
                        width: '100%',
                        padding: '0.8rem 1.25rem',
                        fontSize: '0.95rem',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 4px 15px rgba(212, 175, 55, 0.4)'
                      }}
                    >
                      {loading ? (
                        <>
                          <Loader2 size={18} className="animate-spin" /> Verifying Bank Transfer...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={18} /> Submit Bank Transfer & Generate Receipt
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 3: RAZORPAY ONLINE GATEWAY */}
              {activeTab === 'razorpay' && (
                <form onSubmit={handleRazorpaySubmit}>
                  <div style={{ background: '#F8FAFC', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #E2E8F0', marginBottom: '1.25rem' }}>
                    <h4 style={{ margin: '0 0 0.65rem 0', fontSize: '0.88rem', color: '#0F172A', fontWeight: '700' }}>
                      Enter Your Details for Razorpay Checkout
                    </h4>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.65rem' }}>
                      <div>
                        <input
                          type="text"
                          required
                          placeholder="Your Full Name *"
                          value={donorName}
                          onChange={(e) => setDonorName(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.6rem 0.85rem',
                            borderRadius: '6px',
                            border: '1px solid #CBD5E1',
                            fontSize: '0.88rem'
                          }}
                        />
                      </div>

                      <div className="donation-form-grid-2">
                        <input
                          type="email"
                          required
                          placeholder="Email (e.g. name@gmail.com) *"
                          value={donorEmail}
                          onChange={(e) => setDonorEmail(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.6rem 0.85rem',
                            borderRadius: '6px',
                            border: '1px solid #CBD5E1',
                            fontSize: '0.88rem'
                          }}
                        />
                        <input
                          type="tel"
                          placeholder="Phone Number (+91 ...)"
                          value={donorPhone}
                          onChange={(e) => setDonorPhone(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.6rem 0.85rem',
                            borderRadius: '6px',
                            border: '1px solid #CBD5E1',
                            fontSize: '0.88rem'
                          }}
                        />
                      </div>

                      <div>
                        <select
                          value={cause}
                          onChange={(e) => setCause(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.6rem 0.85rem',
                            borderRadius: '6px',
                            border: '1px solid #CBD5E1',
                            fontSize: '0.85rem',
                            background: '#FFFFFF'
                          }}
                        >
                          {CAUSES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <textarea
                          rows="2"
                          placeholder="Optional prayer request for Pastor David Raj..."
                          value={prayerNote}
                          onChange={(e) => setPrayerNote(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.55rem 0.85rem',
                            borderRadius: '6px',
                            border: '1px solid #CBD5E1',
                            fontSize: '0.85rem',
                            resize: 'vertical'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Beneficiary & Security Trust Badges */}
                  <div style={{
                    background: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    borderRadius: '8px',
                    padding: '0.65rem 0.85rem',
                    marginBottom: '1.25rem',
                    fontSize: '0.78rem',
                    color: '#166534'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '700', marginBottom: '0.2rem' }}>
                      <ShieldCheck size={15} /> 256-Bit SSL Encrypted Razorpay Gateway
                    </div>
                    <div>
                      Direct Settlement Beneficiary: <strong>Pastor David Raj</strong> (+91 8248373375 | davidraj2107@gmail.com)
                    </div>
                  </div>

                  {/* Submit CTA */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-gold"
                    style={{
                      width: '100%',
                      padding: '0.8rem 1.25rem',
                      fontSize: '0.95rem',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      boxShadow: '0 4px 15px rgba(212, 175, 55, 0.4)'
                    }}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" /> Connecting Secure Razorpay...
                      </>
                    ) : (
                      <>
                        <Lock size={16} /> Proceed to Pay ₹{currentAmount ? currentAmount.toLocaleString('en-IN') : '0'} via Razorpay
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
