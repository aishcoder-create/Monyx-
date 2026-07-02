import fs from 'fs';

const cssToAdd = `
/* ─── NEW TRANSACTIONS PAGE STYLES ───────────────── */
.txn-page-new {
  padding: 40px;
  background: #FAFAFA;
  min-height: 100%;
}

.txn-header-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 24px;
}

.txn-title-new {
  font-size: 28px;
  font-weight: 800;
  color: #111827;
  margin: 0 0 4px 0;
  letter-spacing: -0.02em;
}

.txn-subtitle-new {
  font-size: 15px;
  color: #4B5563;
  margin: 0;
}

.txn-export-btn {
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: background 0.2s;
}
.txn-export-btn:hover { background: #F3F4F6; }

.txn-filter-bar {
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.txn-filter-group-container {
  display: flex;
  align-items: flex-start;
  gap: 32px;
}

.txn-filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.txn-filter-label {
  font-size: 11px;
  font-weight: 700;
  color: #6B7280;
}

.txn-filter-select {
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  padding: 8px 32px 8px 12px;
  font-size: 13px;
  font-weight: 500;
  color: #111827;
  appearance: none;
  background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E');
  background-repeat: no-repeat;
  background-position: right 10px center;
  min-width: 160px;
}

.txn-type-toggle {
  display: flex;
  background: #F3F4F6;
  border-radius: 6px;
  padding: 4px;
  gap: 4px;
}

.txn-type-btn {
  padding: 4px 12px;
  font-size: 11px;
  font-weight: 700;
  color: #4B5563;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
}
.txn-type-btn.active {
  background: #FFFFFF;
  color: #111827;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.txn-clear-all {
  font-size: 12px;
  font-weight: 600;
  color: #4B5563;
  cursor: pointer;
  background: none;
  border: none;
  padding: 8px;
}
.txn-clear-all:hover { color: #111827; }

.txn-table-card {
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 32px;
}

.txn-table-new {
  width: 100%;
  border-collapse: collapse;
}

.txn-table-new th {
  text-align: left;
  padding: 16px 24px;
  font-size: 12px;
  font-weight: 600;
  color: #6B7280;
  border-bottom: 1px solid #E5E7EB;
}

.txn-table-new td {
  padding: 20px 24px;
  border-bottom: 1px solid #F3F4F6;
  vertical-align: middle;
}

.txn-table-new tr:last-child td {
  border-bottom: none;
}

.txn-date-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.txn-date-main {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
}
.txn-date-time {
  font-size: 11px;
  color: #9CA3AF;
  font-weight: 500;
}

.txn-merchant-cell {
  display: flex;
  align-items: center;
  gap: 16px;
}
.txn-merchant-icon-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #F3F4F6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4B5563;
}
.txn-merchant-icon-circle.income { background: #ECFDF5; color: #059669; }
.txn-merchant-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.txn-merchant-name {
  font-size: 15px;
  font-weight: 700;
  color: #111827;
}
.txn-merchant-sub {
  font-size: 11px;
  font-weight: 700;
  color: #6B7280;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: 4px;
}

.txn-cat-pill {
  background: #F3F4F6;
  color: #4B5563;
  font-size: 10px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 100px;
  letter-spacing: 0.05em;
  display: inline-block;
  text-transform: uppercase;
}
.txn-cat-pill.income {
  background: #ECFDF5;
  color: #059669;
}

.txn-account-info {
  display: flex;
  flex-direction: column;
}
.txn-account-name {
  font-size: 13px;
  color: #4B5563;
}
.txn-account-num {
  font-size: 11px;
  color: #9CA3AF;
}

.txn-amt-pos {
  font-size: 16px;
  font-weight: 700;
  color: #059669;
}
.txn-amt-neg {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

.txn-pagination {
  padding: 16px 24px;
  background: #F9FAFB;
  border-top: 1px solid #E5E7EB;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.txn-pag-text {
  font-size: 13px;
  color: #6B7280;
}
.txn-pag-text strong {
  color: #111827;
  font-weight: 600;
}
.txn-pag-controls {
  display: flex;
  gap: 8px;
}
.txn-pag-btn {
  width: 32px;
  height: 32px;
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  color: #4B5563;
  cursor: pointer;
}
.txn-pag-btn.active {
  background: #111827;
  color: #FFFFFF;
  border-color: #111827;
}

.txn-footer-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 24px;
}
.txn-footer-card {
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
}
.txn-footer-card.dark {
  background: #000000;
  border: none;
  color: #FFFFFF;
}
.txn-footer-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.txn-footer-icon.green { background: #ECFDF5; color: #059669; }
.txn-footer-icon.red { background: #FEF2F2; color: #DC2626; }
.txn-footer-icon.dark { background: #1F2937; color: #FFFFFF; }
.txn-footer-label {
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 4px;
}
.txn-footer-card:not(.dark) .txn-footer-label { color: #111827; }
.txn-footer-card.dark .txn-footer-label { color: #9CA3AF; }
.txn-footer-val {
  font-size: 22px;
  font-weight: 700;
}
`;

fs.appendFileSync('./client/src/index.css', cssToAdd);
console.log('CSS appended to index.css');
