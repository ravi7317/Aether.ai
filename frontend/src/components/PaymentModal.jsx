import React, { useState } from 'react';
import { X, Check, Copy, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from '../config';
import './PaymentModal.css';

const PaymentModal = ({ isOpen, onClose, plan, onPaymentSuccess }) => {
  const [step, setStep] = useState('checkout'); // checkout, verifying
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const upiId = "7317707192@ybl"; // YOUR UPI ID
  const upiUrl = `upi://pay?pa=7317707192@ybl&pn=AetherAI&am=${plan.price.replace('₹', '')}&cu=INR&tn=Aether AI Subscription`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiUrl)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = async () => {
    setStep('verifying');
    // Simulate payment verification
    setTimeout(async () => {
      try {
        const response = await fetch(`${API_URL}/api/user/upgrade`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ plan: plan.name.toLowerCase().replace('aether ', '') })
        });
        if (response.ok) {
          onPaymentSuccess();
        }
      } catch (err) {
        console.error("Upgrade failed:", err);
      }
    }, 3000);
  };

  return (
    <div className="payment-modal-overlay">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="payment-modal"
      >
        <button className="payment-close" onClick={onClose}><X size={20} /></button>

        {step === 'checkout' ? (
          <div className="payment-checkout">
            <div className="payment-header">
              <div className="payment-icon-box">
                {plan.name === 'Aether Pro' ? <Zap size={24} color="#a855f7" /> : <ShieldCheck size={24} color="#3b82f6" />}
              </div>
              <div>
                <h2 className="payment-title">Upgrade to {plan.name}</h2>
                <p className="payment-subtitle">Complete your payment via UPI</p>
              </div>
            </div>

            <div className="payment-qr-container">
              <img src={qrUrl} alt="UPI QR Code" className="payment-qr" />
              <div className="payment-amount-badge">
                {plan.price} <span className="period">/ month</span>
              </div>
            </div>

            <div className="payment-details">
              <div className="detail-row">
                <span className="detail-label">UPI ID</span>
                <div className="detail-value-box" onClick={handleCopy}>
                  <span className="detail-value">{upiId}</span>
                  {copied ? <Check size={14} color="#4ade80" /> : <Copy size={14} />}
                </div>
              </div>
            </div>

            <div className="payment-instructions">
              <p>1. Scan the QR code with any UPI App (GPay, PhonePe, Paytm)</p>
              <p>2. Complete the payment of {plan.price}</p>
              <p>3. Click "I have paid" to activate your plan</p>
            </div>

            <button className="payment-verify-btn" onClick={handleVerify}>
              I have paid <ArrowRight size={18} />
            </button>
          </div>
        ) : (
          <div className="payment-verifying">
            <div className="verifying-loader">
              <div className="loader-ring"></div>
              <ShieldCheck size={48} color="var(--primary)" className="loader-icon" />
            </div>
            <h2 className="verifying-title">Verifying Payment</h2>
            <p className="verifying-desc">
              We are confirming your transaction with the bank. <br />
              Please do not close this window.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PaymentModal;
