import React from "react";
import { Card, CardContent, Button } from "@mui/material";
import jsPDF from "jspdf";

const Receipt = ({ transaction }) => {
  if (!transaction) return null;

  const { id, date, amount, description, type, status, customerName, customerEmail } = transaction;

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Transaction Receipt", 20, 20);

    doc.setFontSize(12);
    doc.text(`Transaction ID: ${id}`, 20, 40);
    doc.text(`Date: ${new Date(date).toLocaleString()}`, 20, 50);
    doc.text(`Customer Name: ${customerName}`, 20, 60);
    doc.text(`Customer Email: ${customerEmail}`, 20, 70);
    doc.text(`Amount: $${amount.toFixed(2)}`, 20, 80);
    doc.text(`Description: ${description}`, 20, 90);
    doc.text(`Type: ${type}`, 20, 100);
    doc.text(`Status: ${status}`, 20, 110);

    doc.save(`receipt_${id}.pdf`);
  };

  return (
    <Card className="max-w-md mx-auto shadow-lg p-4">
      <CardContent>
        <h2 className="text-xl font-bold mb-2">Transaction Receipt</h2>
        <p><strong>Transaction ID:</strong> {id}</p>
        <p><strong>Date:</strong> {new Date(date).toLocaleString()}</p>
        <p><strong>Customer Name:</strong> {customerName}</p>
        <p><strong>Customer Email:</strong> {customerEmail}</p>
        <p><strong>Amount:</strong> ${amount.toFixed(2)}</p>
        <p><strong>Description:</strong> {description}</p>
        <p><strong>Type:</strong> {type}</p>
        <p><strong>Status:</strong> {status}</p>
        <Button className="mt-4" onClick={generatePDF}>Download Receipt</Button>
      </CardContent>
    </Card>
  );
};

export {Receipt};