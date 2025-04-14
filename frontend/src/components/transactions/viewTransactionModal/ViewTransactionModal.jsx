import { useState } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import {
  Dialog,
  Box,
  Divider,
  Fade,
  Snackbar,
  Alert,
  Grid,
  DialogContent
} from "@mui/material";
import { useTheme } from "../../../context/ThemeContext";

// Import sub-components
import TransactionHeader from "./TransactionHeader";
import TransactionInfo from "./TransactionInfo";
import TransactionNotes from "./TransactionNotes";
import TransactionSignature from "./TransactionSignature";
import ActionButtons from "./ActionButtons";
import EmailReceiptDialog from "./EmailReceiptDialog";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import GenerateReceiptPDF from "../../receipt/GenerateReceipt";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const ViewTransactionModal = ({ isOpen, onClose, transaction, onTransactionUpdated }) => {
  const { mode, primaryColor } = useTheme();
  
  // Theme-based colors
  const dialogBgColor = mode === 'dark' 
    ? 'linear-gradient(to bottom, #1E293B, #0F172A)' 
    : 'linear-gradient(to bottom, #FFFFFF, #F8FAFC)';
  const textPrimaryColor = mode === 'dark' ? "white" : "#1E293B";
  const dividerColor = mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  const scrollbarThumbColor = mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)';
  const scrollbarTrackColor = mode === 'dark' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.05)';
  const accentColor = primaryColor || (mode === 'dark' ? '#FACC15' : '#3B82F6');
  const shadowColor = mode === 'dark' 
    ? '0 10px 30px rgba(0,0,0,0.4)' 
    : '0 10px 30px rgba(0,0,0,0.1)';
  
  // States
  const [editMode, setEditMode] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSendingReceipt, setIsSendingReceipt] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editedTransaction, setEditedTransaction] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSendReceiptConfirm, setShowSendReceiptConfirm] = useState(false);
  const [receiptEmail, setReceiptEmail] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  // Check if the user has admin privileges
  const [userRole] = useState(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      return user?.role || 'user';
    } catch {
      return 'user';
    }
  });
  
  const canEdit = userRole === 'admin' || (transaction?.createdBy?._id === JSON.parse(localStorage.getItem('user'))?._id);

  // Handle local PDF generation
  const handleGeneratePDF = () => {
    GenerateReceiptPDF(transaction);
  };

  // Handle printing
  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      setSnackbar({
        open: true,
        message: "Please allow popups to print receipts",
        severity: "warning"
      });
      return;
    }

    // Basic styles for the print view
    const printStyles = `
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          color: #000;
          background: #fff;
        }
        .receipt {
          max-width: 800px;
          margin: 0 auto;
          border: 1px solid #ddd;
          padding: 20px;
          border-radius: 8px;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #eee;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        .row {
          display: flex;
          margin-bottom: 10px;
        }
        .label {
          font-weight: bold;
          width: 150px;
        }
        h1 {
          color: #333;
        }
        @media print {
          .no-print {
            display: none;
          }
          body {
            margin: 0;
            padding: 0;
          }
        }
      </style>
    `;

    // Format date
    const formattedDate = transaction.createdAt 
      ? new Date(transaction.createdAt).toLocaleString() 
      : "N/A";

    // Create the receipt HTML
    const receiptHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${transaction.reference}</title>
          ${printStyles}
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <h1>Transaction Receipt</h1>
              <p>Reference: ${transaction.reference}</p>
            </div>
            
            <div class="row">
              <div class="label">Customer:</div>
              <div>${transaction.customerName}</div>
            </div>
            
            <div class="row">
              <div class="label">Email:</div>
              <div>${transaction.customerEmail || "Not provided"}</div>
            </div>
            
            <div class="row">
              <div class="label">Type:</div>
              <div>${transaction.type}</div>
            </div>
            
            <div class="row">
              <div class="label">Amount:</div>
              <div>${transaction.currency} ${transaction.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            </div>
            
            ${transaction.exchangeRate ? `
              <div class="row">
                <div class="label">Exchange Rate:</div>
                <div>${transaction.exchangeRate}</div>
              </div>
              
              <div class="row">
                <div class="label">Amount (TTD):</div>
                <div>TTD ${transaction.amountTTD.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
              </div>
            ` : ''}
            
            <div class="row">
              <div class="label">Date:</div>
              <div>${formattedDate}</div>
            </div>
            
            ${transaction.notes ? `
              <div class="row" style="flex-direction: column;">
                <div class="label">Notes:</div>
                <div style="margin-top: 5px; white-space: pre-line;">${transaction.notes}</div>
              </div>
            ` : ''}
            
            ${transaction.customerSignature ? `
              <div class="row" style="flex-direction: column;">
                <div class="label">Signature:</div>
                <div style="margin-top: 5px;">
                  <img src="${transaction.customerSignature}" style="max-height: 100px;" />
                </div>
              </div>
            ` : ''}
            
            <div style="margin-top: 30px; text-align: center; color: #888;">
              <p>Thank you for your business!</p>
            </div>
          </div>
          
          <div class="no-print" style="text-align: center; margin-top: 20px;">
            <button onclick="window.print();" style="padding: 10px 20px; background: #3B82F6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;">
              Print Receipt
            </button>
          </div>
        </body>
      </html>
    `;

    // Write the HTML to the new window and trigger print
    printWindow.document.open();
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    
    // Give the browser a moment to load the content before printing
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 250);
  };

  // Open the send receipt confirmation dialog
  const handleSendReceiptClick = () => {
    setReceiptEmail(transaction?.customerEmail || "");
    setShowSendReceiptConfirm(true);
  };

  // Send receipt email via API
  const handleConfirmSendReceipt = async () => {
    setIsSendingReceipt(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Not authenticated");
      }

      const { data } = await axios.post(
        `${BASE_URL}/email/send-transaction-receipt/${transaction._id}`,
        { email: receiptEmail },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSnackbar({
        open: true,
        message: "Receipt sent successfully",
        severity: "success"
      });
      
      setShowSendReceiptConfirm(false);
    } catch (error) {
      console.error("Error sending receipt:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Failed to send receipt",
        severity: "error"
      });
    } finally {
      setIsSendingReceipt(false);
    }
  };

  // Handle entering edit mode
  const handleEditClick = () => {
    setEditedTransaction({
      notes: transaction?.notes || "",
      customerEmail: transaction?.customerEmail || ""
    });
    setEditMode(true);
  };

  // Handle field change in edit mode
  const handleFieldChange = (field, value) => {
    setEditedTransaction(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Save edited transaction
  const handleSaveClick = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Not authenticated");
      }

      const { data } = await axios.put(
        `${BASE_URL}/transactions/${transaction._id}`,
        editedTransaction,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSnackbar({
        open: true,
        message: "Transaction updated successfully",
        severity: "success"
      });
      
      setEditMode(false);
      
      // Call the callback to refresh the transaction list
      if (onTransactionUpdated) {
        onTransactionUpdated();
      }
      
    } catch (error) {
      console.error("Error updating transaction:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Error updating transaction",
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setEditMode(false);
  };

  // Show delete confirmation
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  // Delete the transaction
  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Not authenticated");
      }

      await axios.delete(`${BASE_URL}/transactions/${transaction._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSnackbar({
        open: true,
        message: "Transaction deleted successfully",
        severity: "success"
      });
      
      // Call the callback to refresh the transaction list
      if (onTransactionUpdated) {
        onTransactionUpdated();
      }
      
      // Close delete confirm dialog and modal
      setShowDeleteConfirm(false);
      setTimeout(() => onClose(), 1000);
      
    } catch (error) {
      console.error("Error deleting transaction:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Error deleting transaction",
        severity: "error"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Close snackbar
  const handleCloseSnackbar = (_, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (!transaction) return null;

  // Theme object to pass to child components
  const themeProps = {
    mode,
    primaryColor,
    accentColor,
    textPrimaryColor,
    dialogBgColor,
    shadowColor,
    dividerColor,
    scrollbarThumbColor,
    scrollbarTrackColor
  };

  return (
    <>
      <Dialog 
        open={isOpen} 
        onClose={onClose}
        fullWidth 
        maxWidth="md"
        scroll="paper"
        PaperProps={{
          sx: {
            borderRadius: 2,
            backgroundImage: dialogBgColor,
            boxShadow: shadowColor
          }
        }}
      >
        <Fade in={isOpen} timeout={400}>
          <Box>
            {/* Dialog Header */}
            <TransactionHeader 
              transaction={transaction} 
              onClose={onClose} 
              themeProps={themeProps} 
            />

            <Divider sx={{ borderColor: dividerColor }} />

            {/* Content Section */}
            <DialogContent 
              sx={{ 
                padding: { xs: 2, sm: 3 }, 
                color: textPrimaryColor,
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: scrollbarThumbColor,
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: scrollbarTrackColor,
                }
              }}
            >
              <Grid container spacing={3}>
                {/* Left Column - Transaction Info */}
                <Grid item xs={12} md={6}>
                  <TransactionInfo 
                    transaction={transaction} 
                    editMode={editMode}
                    editedTransaction={editedTransaction}
                    handleFieldChange={handleFieldChange}
                    themeProps={themeProps} 
                  />
                </Grid>
                
                {/* Right Column - Notes & Signature */}
                <Grid item xs={12} md={6}>
                  {/* Notes Section */}
                  <TransactionNotes 
                    transaction={transaction}
                    editMode={editMode}
                    editedTransaction={editedTransaction}
                    handleFieldChange={handleFieldChange}
                    themeProps={themeProps}
                  />
                  
                  {/* Customer Signature Section */}
                  {transaction.customerSignature && (
                    <TransactionSignature 
                      signatureUrl={transaction.customerSignature} 
                      themeProps={themeProps} 
                    />
                  )}
                </Grid>
              </Grid>
            </DialogContent>

            <Divider sx={{ borderColor: dividerColor }} />

            {/* Footer Buttons */}
            <ActionButtons 
              editMode={editMode}
              canEdit={canEdit}
              loading={loading}
              isDeleting={isDeleting}
              handleEditClick={handleEditClick} 
              handleDeleteClick={handleDeleteClick}
              handleCancelEdit={handleCancelEdit}
              handleSaveClick={handleSaveClick}
              handleGeneratePDF={handleGeneratePDF}
              handlePrint={handlePrint}
              handleSendReceiptClick={handleSendReceiptClick}
              onClose={onClose}
              themeProps={themeProps}
            />
          </Box>
        </Fade>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={showDeleteConfirm}
        title="Delete Transaction"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        loading={isDeleting}
        themeProps={themeProps}
      />
      
      {/* Send Receipt Confirmation Dialog */}
      <EmailReceiptDialog
        open={showSendReceiptConfirm}
        transaction={transaction}
        email={receiptEmail}
        setEmail={setReceiptEmail}
        onSend={handleConfirmSendReceipt}
        onCancel={() => setShowSendReceiptConfirm(false)}
        loading={isSendingReceipt}
        themeProps={themeProps}
      />
      
      {/* Notification Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

ViewTransactionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  transaction: PropTypes.object,
  onTransactionUpdated: PropTypes.func
};

export default ViewTransactionModal;