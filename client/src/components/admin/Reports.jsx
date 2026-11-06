import React, { useState } from 'react';
import {
  FileText,
  Download,
  Filter,
  Calendar,
  Fuel,
  Car,
  Receipt,
  DollarSign,
  Package,
  Users,
} from 'lucide-react';
import { exportToPdf, exportToExcel } from '../common/ExportUtils';

export const Reports = ({ trips = [], expenses = [], users = [], packages = [] }) => {
  const [reportType, setReportType] = useState('trip'); // 'trip' | 'driver' | 'fuel' | 'toll' | 'salary' | 'package'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const drivers = users.filter((u) => u.role === 'driver');

  // Filtered trips
  const filteredTrips = trips.filter((t) => {
    const sDate = startDate ? new Date(t.startDate) >= new Date(startDate) : true;
    const eDate = endDate ? new Date(t.endDate) <= new Date(endDate + 'T23:59:59') : true;
    const dMatch = selectedDriver === 'all' || t.driverId === selectedDriver;
    const stMatch = selectedStatus === 'all' || t.status === selectedStatus;
    return sDate && eDate && dMatch && stMatch;
  });

  // Filtered expenses
  const filteredExpenses = expenses.filter((e) => {
    const dMatch = selectedDriver === 'all' || e.driverId === selectedDriver;
    const sDate = startDate ? new Date(e.date) >= new Date(startDate) : true;
    const eDate = endDate ? new Date(e.date) <= new Date(endDate + 'T23:59:59') : true;
    return dMatch && sDate && eDate;
  });

  // Prepare Report Data
  let title = 'Trip Report';
  let headers = [];
  let tableData = [];

  if (reportType === 'trip') {
    title = 'Fleet Trips & Deployment Audit Report';
    headers = ['Trip ID', 'Trip Name', 'Route', 'Start Date', 'Assigned Driver', 'Status', 'Salary (₹)'];
    tableData = filteredTrips.map((t) => [
      t.id,
      t.name,
      t.route,
      t.startDate?.slice(0, 10),
      t.driverName || 'Unassigned',
      t.status,
      `₹${(t.salary || 0).toLocaleString()}`,
    ]);
  } else if (reportType === 'driver') {
    title = 'Driver Fleet Performance & Earnings Report';
    headers = ['Driver Name', 'License Number', 'Availability', 'Wallet Balance', 'Total Earnings', 'Expenses'];
    tableData = drivers.map((d) => [
      d.name,
      d.licenseNumber || 'AP-03-2019-0045892',
      d.availability || 'Available',
      `₹${(d.walletBalance || 0).toLocaleString()}`,
      `₹${(d.totalEarnings || 0).toLocaleString()}`,
      `₹${(d.totalExpenses || 0).toLocaleString()}`,
    ]);
  } else if (reportType === 'fuel') {
    title = 'Fuel Expense & Consumption Audit Report';
    headers = ['Expense ID', 'Trip ID', 'Driver', 'Fuel Filled (L)', 'Odometer (km)', 'Amount (₹)', 'Status'];
    const fuelExps = filteredExpenses.filter((e) => e.category === 'Fuel');
    tableData = fuelExps.map((e) => [
      e.id,
      e.tripId,
      e.driverName || 'Driver',
      e.fuelFilled ? `${e.fuelFilled} L` : 'N/A',
      e.odometerReading ? `${e.odometerReading} km` : 'N/A',
      `₹${e.amount?.toLocaleString()}`,
      e.status,
    ]);
  } else if (reportType === 'toll') {
    title = 'FASTag & Toll Plaza Expense Report';
    headers = ['Expense ID', 'Trip ID', 'Driver', 'Toll Plaza / Details', 'Amount (₹)', 'Status', 'Remarks'];
    const tollExps = filteredExpenses.filter((e) => e.category === 'Toll Gate');
    tableData = tollExps.map((e) => [
      e.id,
      e.tripId,
      e.driverName || 'Driver',
      e.notes || 'Highway FASTag entry',
      `₹${e.amount?.toLocaleString()}`,
      e.status,
      e.adminRemarks || 'Verified',
    ]);
  } else if (reportType === 'salary') {
    title = 'Driver Salary Settlement & Payout Report';
    headers = ['Trip ID', 'Route', 'Driver Name', 'Salary Status', 'Trip Salary (₹)', 'Settlement Date'];
    tableData = filteredTrips.map((t) => [
      t.id,
      t.route,
      t.driverName || 'Driver',
      t.salaryStatus || 'Pending',
      `₹${(t.salary || 0).toLocaleString()}`,
      t.closedAt ? new Date(t.closedAt).toLocaleDateString() : 'Pending Closing',
    ]);
  } else if (reportType === 'package') {
    title = 'Pilgrimage Packages Catalog Report';
    headers = ['Package ID', 'Package Name', 'Duration', 'Vehicle Type', 'Route', 'Starting Price (₹)'];
    tableData = packages.map((p) => [
      p.id,
      p.name,
      p.duration,
      p.vehicleType,
      p.route,
      `₹${p.price?.toLocaleString()}`,
    ]);
  }

  const handleExportPdf = () => {
    exportToPdf({
      title,
      subtitle: `${reportType.toUpperCase()} Summary (Total Records: ${tableData.length})`,
      headers,
      data: tableData,
      filename: `Tirupati_Balaji_${reportType}_Report.pdf`,
    });
  };

  const handleExportExcel = () => {
    exportToExcel({
      title,
      headers,
      data: tableData,
      filename: `Tirupati_Balaji_${reportType}_Report.xlsx`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-extrabold text-2xl text-slate-900 tracking-tight">
            Fleet Audit & Financial Reports
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Export comprehensive trip summaries, driver payrolls, FASTag toll, and fuel analytics
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPdf}
            className="px-4 py-2 bg-purple-900 hover:bg-purple-950 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Report Types Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto bg-white p-2 rounded-2xl border border-slate-200 shadow-xs no-scrollbar">
        {[
          { id: 'trip', label: 'Trip Report', icon: FileText },
          { id: 'driver', label: 'Driver Report', icon: Users },
          { id: 'fuel', label: 'Fuel Expense', icon: Fuel },
          { id: 'toll', label: 'Toll Report', icon: Car },
          { id: 'salary', label: 'Salary & Payout', icon: DollarSign },
          { id: 'package', label: 'Package Report', icon: Package },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setReportType(item.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                reportType === item.id
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs text-xs">
        <div>
          <label className="block text-slate-500 mb-1 font-semibold">From Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
          />
        </div>

        <div>
          <label className="block text-slate-500 mb-1 font-semibold">To Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
          />
        </div>

        <div>
          <label className="block text-slate-500 mb-1 font-semibold">Filter Driver</label>
          <select
            value={selectedDriver}
            onChange={(e) => setSelectedDriver(e.target.value)}
            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
          >
            <option value="all">All Drivers</option>
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-slate-500 mb-1 font-semibold">Trip Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Completed">Completed</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Report Preview Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-sm text-slate-900">{title}</span>
            <span className="text-[11px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-semibold">
              {tableData.length} Records
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            Previewing on-screen • Use export buttons above for formal reports
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 text-slate-600 border-b border-slate-200 uppercase font-semibold text-[10px]">
              <tr>
                {headers.map((h, i) => (
                  <th key={i} className="px-4 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tableData.slice(0, 15).map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-4 py-3 text-slate-700">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
              {tableData.length === 0 && (
                <tr>
                  <td colSpan={headers.length} className="text-center py-8 text-slate-400">
                    No data matching the specified filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

