import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const exportToPdf = ({ title, subtitle, headers, data, filename = 'report.pdf' }) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4',
  });

  // Header Banner: Deep Purple
  doc.setFillColor(30, 16, 53);
  doc.rect(0, 0, doc.internal.pageSize.width, 65, 'F');

  // Title Text
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('TIRUPATI BALAJI TOURS & TRAVELS', 30, 32);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(251, 146, 60); // Orange
  doc.text('Fleet & Trip Management System | Official Audit Report', 30, 48);

  // Subtitle / Metadata
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 30, 95);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Generated on: ${new Date().toLocaleString()} | Scope: ${subtitle || 'All Records'}`,
    30,
    110
  );

  // Draw Table
  autoTable(doc, {
    startY: 125,
    head: [headers],
    body: data,
    theme: 'striped',
    headStyles: {
      fillColor: [30, 16, 53],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 30, right: 30 },
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Tirupati Balaji Tours & Travels • Page ${i} of ${pageCount} • Confidential`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 20,
      { align: 'center' }
    );
  }

  doc.save(filename);
};

export const exportToExcel = ({ title, headers, data, filename = 'report.xlsx' }) => {
  const wsData = [
    ['TIRUPATI BALAJI TOURS & TRAVELS - FLEET & TRIP MANAGEMENT'],
    [title],
    [`Generated: ${new Date().toLocaleString()}`],
    [], // empty line
    headers,
    ...data,
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Report');
  XLSX.writeFile(wb, filename);
};

