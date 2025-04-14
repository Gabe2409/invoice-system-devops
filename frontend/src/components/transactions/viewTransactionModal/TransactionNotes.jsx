import PropTypes from "prop-types";
import { Box, Typography, TextField, Paper } from "@mui/material";
import NotesIcon from "@mui/icons-material/Notes";

const TransactionNotes = ({ transaction, editMode, editedTransaction, handleFieldChange, themeProps }) => {
  const { 
    mode, 
    accentColor, 
    textPrimaryColor, 
    paperBgColor = mode === 'dark' ? 'rgba(15, 23, 42, 0.4)' : 'rgba(241, 245, 249, 0.4)',
    borderColor = mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    inputBorderColor = mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.23)',
    notesBgColor = mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)',
    emptyNotesColor = mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'
  } = themeProps;

  return (
    <Paper 
      elevation={0}
      sx={{ 
        bgcolor: paperBgColor, 
        p: 2, 
        borderRadius: 2,
        border: `1px solid ${borderColor}`,
        mb: 2 
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <NotesIcon sx={{ color: accentColor }} />
        <Typography variant="h6" sx={{ color: accentColor }}>
          Notes
        </Typography>
      </Box>
      
      {editMode ? (
        <TextField
          fullWidth
          multiline
          rows={4}
          placeholder="Add transaction notes here..."
          variant="outlined"
          value={editedTransaction.notes}
          onChange={(e) => handleFieldChange("notes", e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: inputBorderColor },
              '&:hover fieldset': { borderColor: accentColor },
              '&.Mui-focused fieldset': { borderColor: accentColor }
            },
            textarea: { color: textPrimaryColor }
          }}
        />
      ) : (
        <Typography 
          variant="body1" 
          sx={{ 
            whiteSpace: 'pre-line',
            minHeight: '80px',
            bgcolor: notesBgColor,
            p: 2,
            borderRadius: 1,
            color: transaction.notes ? textPrimaryColor : emptyNotesColor
          }}
        >
          {transaction.notes || "No notes provided for this transaction"}
        </Typography>
      )}
    </Paper>
  );
};

TransactionNotes.propTypes = {
  transaction: PropTypes.object.isRequired,
  editMode: PropTypes.bool.isRequired,
  editedTransaction: PropTypes.object.isRequired,
  handleFieldChange: PropTypes.func.isRequired,
  themeProps: PropTypes.object.isRequired
};

export default TransactionNotes;