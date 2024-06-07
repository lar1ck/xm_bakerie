import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface SalesReport {
  product_name: string;
  total_quantity_sold: number;
  total_sales: number;
}

interface InventoryReport {
  product_name: string;
  available_quantity: number;
  last_updated: string;
}

const Reports: React.FC = () => {
  const [salesReports, setSalesReports] = useState<SalesReport[]>([]);
  const [inventoryReports, setInventoryReports] = useState<InventoryReport[]>([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('No token found, please log in.');
          return;
        }

        const salesResponse = await axios.get('http://localhost:3000/reports/sales', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSalesReports(salesResponse.data);

        const inventoryResponse = await axios.get('http://localhost:3000/reports/inventory', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setInventoryReports(inventoryResponse.data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response && error.response.status === 404) {
            alert('Reports not found.');
          } else if (error.response && error.response.status === 401) {
            alert('Unauthorized: Please log in again.');
          } else {
            alert('Error fetching reports');
          }
        } else {
          alert('An unknown error occurred');
        }
      }
    };

    fetchReports();
  }, []);

  const downloadPDF = async () => {
    const input = document.getElementById('report-content');
    if (!input) return;

    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();

    pdf.addImage(imgData, 'PNG', 10, 10, 190, 0);
    pdf.save('report.pdf');
  };

  return (
    <div className="container mx-auto p-4">
      <div id="report-content">
        <h2 className="text-2xl font-bold mb-4">Sales Reports</h2>
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product Name</th>
                <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Quantity Sold</th>
                <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Sales</th>
              </tr>
            </thead>
            <tbody>
              {salesReports.map(report => (
                <tr key={report.product_name}>
                  <td className="py-2 px-4 border-b border-gray-200">{report.product_name}</td>
                  <td className="py-2 px-4 border-b border-gray-200">{report.total_quantity_sold}</td>
                  <td className="py-2 px-4 border-b border-gray-200">${report.total_sales}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="text-2xl font-bold mb-4">Inventory Reports</h2>
        <div className="bg-white shadow-md rounded-lg p-6">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product Name</th>
                <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Available Quantity</th>
                <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {inventoryReports.map(report => (
                <tr key={report.product_name}>
                  <td className="py-2 px-4 border-b border-gray-200">{report.product_name}</td>
                  <td className="py-2 px-4 border-b border-gray-200">{report.available_quantity}</td>
                  <td className="py-2 px-4 border-b border-gray-200">{report.last_updated === 'Never' ? 'Never' : new Date(report.last_updated).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <button
        onClick={downloadPDF}
        className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300 mt-4"
      >
        Download Report 
      </button>
    </div>
  );
};

export default Reports;
