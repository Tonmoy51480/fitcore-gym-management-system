import {
  DollarSign,
  Search,
  Plus,
  Receipt,
  Printer,
  TrendingUp,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { PaymentMethodBadge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import type {
  Member,
  Payment,
  PaymentCreatePayload,
} from '../types';

export const PaymentsPage: React.FC = () => {
  const { toast } = useToast();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [stats, setStats] = useState<{ totalRevenue: number; monthlyRevenue: number } | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Modals
  const [isRecordOpen, setIsRecordOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [formData, setFormData] = useState<PaymentCreatePayload>({
    memberId: 0,
    amount: 50,
    paymentMethod: 'Cash',
    notes: 'Membership fee',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [paymentsRes, membersRes, statsRes] = await Promise.all([
        api.payments.getAll({
          search,
          paymentMethod,
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
        }),
        api.members.getAll(),
        api.payments.getStats(),
      ]);
      setPayments(paymentsRes);
      setMembers(membersRes);
      setStats(statsRes);
      if (membersRes.length > 0 && formData.memberId === 0) {
        setFormData((prev) => ({ ...prev, memberId: membersRes[0].id }));
      }
    } catch (err: any) {
      toast(err.message || 'Failed to load payments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, paymentMethod, fromDate, toDate]);

  const handleRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amount <= 0) {
      toast('Payment amount must be greater than zero.', 'warning');
      return;
    }
    setActionLoading(true);
    try {
      const recorded = await api.payments.pay(formData);
      toast(`Payment of $${formData.amount} recorded!`, 'success');
      setIsRecordOpen(false);
      setFormData({
        memberId: members[0]?.id || 0,
        amount: 50,
        paymentMethod: 'Cash',
        notes: '',
      });
      loadData();
      // Show receipt right after recording
      setSelectedPayment(recorded);
      setIsReceiptOpen(true);
    } catch (err: any) {
      toast(err.message || 'Failed to record payment', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, color: 'var(--text-primary)' }}>Payment Management</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 2 }}>
            Record dues, review revenue logs, and issue official billing receipts.
          </p>
        </div>

        <button onClick={() => setIsRecordOpen(true)} className="btn btn-primary">
          <Plus size={16} />
          <span>Record Payment</span>
        </button>
      </div>

      {/* Revenue KPI Summary */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          <div className="glass-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>Total Revenue Collected</span>
              <div style={{ padding: 8, borderRadius: 8, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                <DollarSign size={18} />
              </div>
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, marginTop: 10, color: 'var(--text-primary)' }}>
              ${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className="glass-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>Current Month Revenue</span>
              <div style={{ padding: 8, borderRadius: 8, background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}>
                <TrendingUp size={18} />
              </div>
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, marginTop: 10, color: '#06b6d4' }}>
              ${stats.monthlyRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      )}

      {/* Filters bar */}
      <div className="glass-card" style={{ padding: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <input
            type="text"
            placeholder="Search by member name, txn ID, or notes..."
            className="form-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 36 }}
          />
          <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
        </div>

        <select
          className="form-select"
          style={{ width: 170 }}
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <option value="ALL">All Payment Methods</option>
          <option value="Cash">Cash</option>
          <option value="Card">Card</option>
          <option value="Mobile Banking">Mobile Banking</option>
          <option value="Bank Transfer">Bank Transfer</option>
        </select>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="date"
            className="form-input"
            style={{ width: 140 }}
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            title="From Date"
          />
          <span style={{ color: 'var(--text-muted)' }}>to</span>
          <input
            type="date"
            className="form-input"
            style={{ width: 140 }}
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            title="To Date"
          />
          {(fromDate || toDate) && (
            <button
              onClick={() => {
                setFromDate('');
                setToDate('');
              }}
              className="btn btn-secondary"
              style={{ padding: '8px 12px', fontSize: 12 }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Payments Table */}
      {loading ? (
        <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Loading payment transactions...
        </div>
      ) : payments.length === 0 ? (
        <EmptyState
          icon={<DollarSign size={28} />}
          title="No Transactions Found"
          description="There are no payment records matching your filter criteria. Record payments to see them logged here."
          actionText="Record Payment"
          onAction={() => setIsRecordOpen(true)}
        />
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Txn ID</th>
                <th>Member</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Payment Date</th>
                <th>Notes</th>
                <th style={{ textAlign: 'right' }}>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-secondary)', fontSize: 13 }}>
                    {p.transactionId}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.memberName}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.memberEmail}</div>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--accent-emerald)', fontSize: 15 }}>
                    ${p.amount.toFixed(2)}
                  </td>
                  <td>
                    <PaymentMethodBadge method={p.paymentMethod} />
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    {new Date(p.paymentDate).toLocaleString()}
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {p.notes || '-'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => {
                        setSelectedPayment(p);
                        setIsReceiptOpen(true);
                      }}
                      className="btn btn-secondary"
                      style={{ fontSize: 12, padding: '4px 10px' }}
                      title="View printable receipt"
                    >
                      <Receipt size={14} /> Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL 1: RECORD PAYMENT */}
      <Modal isOpen={isRecordOpen} onClose={() => setIsRecordOpen(false)} title="Record Membership Payment">
        <form onSubmit={handleRecordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Member *</label>
            <select
              className="form-select"
              required
              value={formData.memberId}
              onChange={(e) => setFormData({ ...formData, memberId: Number(e.target.value) })}
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.email})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Amount ($) *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                className="form-input"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Payment Method *</label>
              <select
                className="form-select"
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              >
                <option value="Cash">Cash</option>
                <option value="Card">Credit / Debit Card</option>
                <option value="Mobile Banking">Mobile Banking</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Custom Transaction / Reference ID</label>
            <input
              type="text"
              placeholder="Leave blank for automatic TXN-XXXXXX"
              className="form-input"
              value={formData.transactionId || ''}
              onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Payment Notes</label>
            <textarea
              rows={2}
              className="form-textarea"
              placeholder="e.g. Monthly dues, personal training bundle, registration..."
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
            <button type="button" onClick={() => setIsRecordOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={actionLoading}>
              {actionLoading ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: OFFICIAL PAYMENT RECEIPT */}
      <Modal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        title="Payment Receipt"
        maxWidth="520px"
      >
        {selectedPayment && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Printable Receipt Box */}
            <div
              id="printable-receipt"
              style={{
                padding: 24,
                borderRadius: 12,
                background: '#ffffff',
                color: '#0f172a',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              }}
            >
              {/* Receipt Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0f172a', paddingBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                    FITCORE CLUB
                  </h3>
                  <p style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                    Official Dues & Membership Receipt
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>RECEIPT</div>
                  <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'monospace' }}>
                    {selectedPayment.transactionId}
                  </div>
                </div>
              </div>

              {/* Receipt Details */}
              <div style={{ padding: '16px 0', borderBottom: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Member Name:</span>
                  <span style={{ fontWeight: 700 }}>{selectedPayment.memberName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Member Email:</span>
                  <span>{selectedPayment.memberEmail}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Payment Date:</span>
                  <span>{new Date(selectedPayment.paymentDate).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Payment Method:</span>
                  <span style={{ fontWeight: 600 }}>{selectedPayment.paymentMethod}</span>
                </div>
                {selectedPayment.notes && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Description:</span>
                    <span>{selectedPayment.notes}</span>
                  </div>
                )}
              </div>

              {/* Total Paid */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16 }}>
                <span style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase' }}>Amount Paid</span>
                <span style={{ fontSize: 26, fontWeight: 900, color: '#059669' }}>
                  ${selectedPayment.amount.toFixed(2)}
                </span>
              </div>

              {/* Receipt Footer */}
              <div style={{ textAlign: 'center', marginTop: 24, fontSize: 11, color: '#94a3b8' }}>
                Thank you for training with FITCORE! Keep pushing your limits.
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={() => window.print()}
                className="btn btn-primary"
                style={{ fontSize: 13 }}
              >
                <Printer size={16} /> Print Receipt
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
