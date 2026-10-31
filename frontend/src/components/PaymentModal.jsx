import React, { useState } from 'react';

const PaymentModal = ({ isOpen, onClose, totalAmount, currency, onPaymentSuccess }) => {
    const [activeTab, setActiveTab] = useState('upi'); // 'upi' | 'card' | 'netbanking'
    const [upiId, setUpiId] = useState('');
    const [cardDetails, setCardDetails] = useState({
        number: '',
        name: '',
        expiry: '',
        cvv: '',
    });
    const [selectedBank, setSelectedBank] = useState('HDFC Bank');
    const [processing, setProcessing] = useState(false);
    const [processStep, setProcessStep] = useState('');

    if (!isOpen) return null;

    const handleCardChange = (e) => {
        const { name, value } = e.target;
        if (name === 'number') {
            const formatted = value.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})/g, '$1 ').trim();
            setCardDetails((prev) => ({ ...prev, number: formatted }));
        } else if (name === 'expiry') {
            let formatted = value.replace(/\D/g, '').slice(0, 4);
            if (formatted.length >= 2) formatted = `${formatted.slice(0, 2)}/${formatted.slice(2)}`;
            setCardDetails((prev) => ({ ...prev, expiry: formatted }));
        } else if (name === 'cvv') {
            setCardDetails((prev) => ({ ...prev, cvv: value.replace(/\D/g, '').slice(0, 3) }));
        } else {
            setCardDetails((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handlePay = () => {
        setProcessing(true);
        setProcessStep('Connecting to Secure Payment Gateway...');

        setTimeout(() => {
            setProcessStep('Verifying 256-Bit SSL Encryption...');
        }, 800);

        setTimeout(() => {
            setProcessStep('Authorizing payment with bank...');
        }, 1600);

        setTimeout(() => {
            setProcessStep('Payment Approved! Finalizing order...');
        }, 2400);

        setTimeout(() => {
            setProcessing(false);
            const txnId = `TXN_HVT_${Date.now()}_${Math.floor(Math.random() * 9000 + 1000)}`;
            const methodLabel = activeTab === 'upi' ? `Online UPI (${upiId || 'GPay'})` : activeTab === 'card' ? 'Credit/Debit Card' : `NetBanking (${selectedBank})`;
            onPaymentSuccess({
                paymentMethod: methodLabel,
                transactionId: txnId,
            });
        }, 3000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100">
                {/* Header */}
                <div className="p-6 bg-gradient-to-r from-emerald-600 to-teal-700 text-white relative">
                    <button
                        onClick={onClose}
                        disabled={processing}
                        className="absolute top-5 right-5 text-white/80 hover:text-white text-lg font-bold w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition cursor-pointer disabled:opacity-30"
                    >
                        ✕
                    </button>
                    <div className="flex items-center gap-2 mb-1 text-emerald-200 text-xs font-bold uppercase tracking-wider">
                        <span>🔒 256-Bit SSL Encrypted Checkout</span>
                    </div>
                    <h3 className="text-xl font-black tracking-tight">Harvesto Payment Gateway</h3>
                    <div className="mt-3 flex items-baseline justify-between pt-3 border-t border-white/15">
                        <span className="text-xs text-white/80">Total Payable Amount:</span>
                        <span className="text-2xl font-black text-amber-300">{currency}{totalAmount}</span>
                    </div>
                </div>

                {/* Processing Overlay */}
                {processing ? (
                    <div className="p-10 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-16 h-16 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin flex items-center justify-center" />
                        <div>
                            <h4 className="font-extrabold text-slate-800 text-base">{processStep}</h4>
                            <p className="text-xs text-slate-400 mt-1">Please do not refresh or close this window.</p>
                        </div>
                    </div>
                ) : (
                    <div className="p-6 space-y-5">
                        {/* Tab Selector */}
                        <div className="flex rounded-xl bg-slate-100 p-1 gap-1">
                            <button
                                onClick={() => setActiveTab('upi')}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                                    activeTab === 'upi' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                📱 UPI
                            </button>
                            <button
                                onClick={() => setActiveTab('card')}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                                    activeTab === 'card' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                💳 Card
                            </button>
                            <button
                                onClick={() => setActiveTab('netbanking')}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                                    activeTab === 'netbanking' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                🏦 NetBanking
                            </button>
                        </div>

                        {/* UPI View */}
                        {activeTab === 'upi' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-4 gap-2">
                                    {['Google Pay', 'PhonePe', 'Paytm', 'BHIM'].map((app) => (
                                        <button
                                            key={app}
                                            type="button"
                                            onClick={() => setUpiId(`${app.toLowerCase().replace(/\s/g, '')}@okaxis`)}
                                            className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition text-center text-[11px] font-bold text-slate-700 cursor-pointer"
                                        >
                                            {app}
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Or Enter Virtual Payment Address (VPA)</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. mobile@upi or username@okhdfcbank"
                                        value={upiId}
                                        onChange={(e) => setUpiId(e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-emerald-500 focus:bg-white transition"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Card View */}
                        {activeTab === 'card' && (
                            <div className="space-y-3">
                                {/* Visual Card Graphic */}
                                <div className="rounded-2xl p-4 bg-gradient-to-tr from-slate-900 via-slate-800 to-emerald-900 text-white shadow-md relative overflow-hidden">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-300">Harvesto FastPay</span>
                                        <span className="text-lg">💳</span>
                                    </div>
                                    <p className="font-mono text-sm tracking-widest mb-3">
                                        {cardDetails.number || '•••• •••• •••• ••••'}
                                    </p>
                                    <div className="flex justify-between text-[10px] uppercase text-slate-300">
                                        <span>{cardDetails.name || 'Cardholder Name'}</span>
                                        <span>{cardDetails.expiry || 'MM/YY'}</span>
                                    </div>
                                </div>

                                <div className="space-y-2 text-xs">
                                    <input
                                        type="text"
                                        name="number"
                                        placeholder="Card Number (16 digits)"
                                        value={cardDetails.number}
                                        onChange={handleCardChange}
                                        maxLength={19}
                                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500"
                                    />
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Cardholder Name"
                                        value={cardDetails.name}
                                        onChange={handleCardChange}
                                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500"
                                    />
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="text"
                                            name="expiry"
                                            placeholder="MM/YY"
                                            value={cardDetails.expiry}
                                            onChange={handleCardChange}
                                            maxLength={5}
                                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 text-center"
                                        />
                                        <input
                                            type="password"
                                            name="cvv"
                                            placeholder="CVV"
                                            value={cardDetails.cvv}
                                            onChange={handleCardChange}
                                            maxLength={3}
                                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 text-center"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* NetBanking View */}
                        {activeTab === 'netbanking' && (
                            <div className="space-y-3">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Choose Bank</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra', 'Punjab National Bank'].map((bank) => (
                                        <button
                                            key={bank}
                                            type="button"
                                            onClick={() => setSelectedBank(bank)}
                                            className={`p-2.5 rounded-xl border text-xs font-bold text-left transition cursor-pointer ${
                                                selectedBank === bank ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-slate-200 hover:bg-slate-50'
                                            }`}
                                        >
                                            {bank}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Action CTA */}
                        <button
                            type="button"
                            onClick={handlePay}
                            className="w-full py-3.5 bg-primary hover:bg-primary-dull text-white font-extrabold rounded-full transition shadow-lg shadow-emerald-600/20 text-sm cursor-pointer active:scale-95 flex items-center justify-center gap-2 mt-2"
                        >
                            <span>Pay {currency}{totalAmount} Now</span>
                            <span>→</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentModal;
