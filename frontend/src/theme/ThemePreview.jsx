import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  TextField, 
  Chip, 
  Divider,
  Grid,
  useTheme
} from '@mui/material';

const ThemePreview = () => {
  const theme = useTheme();

  return (
    <Paper 
      sx={{ 
        p: 3, 
        mt: 2, 
        mb: 4, 
        border: `1px solid ${theme.palette.divider}`,
        maxWidth: 600
      }}
    >
      <Typography variant="h6" gutterBottom>
        Theme Preview
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Typography
        </Typography>
        <Typography variant="h3" gutterBottom>Heading 3</Typography>
        <Typography variant="h5" gutterBottom>Heading 5</Typography>
        <Typography variant="body1" gutterBottom>
          Body text - Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Secondary text with muted appearance.
        </Typography>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Colors
        </Typography>
        <Grid container spacing={1} sx={{ mb: 2 }}>
          <Grid item>
            <Box 
              sx={{ 
                width: 48, 
                height: 48, 
                bgcolor: 'primary.main',
                borderRadius: 1,
                boxShadow: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Typography variant="caption" color="primary.contrastText">
                Primary
              </Typography>
            </Box>
          </Grid>
          <Grid item>
            <Box 
              sx={{ 
                width: 48, 
                height: 48, 
                bgcolor: 'secondary.main',
                borderRadius: 1,
                boxShadow: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Typography variant="caption" color="secondary.contrastText">
                Secondary
              </Typography>
            </Box>
          </Grid>
          <Grid item>
            <Box 
              sx={{ 
                width: 48, 
                height: 48, 
                bgcolor: 'error.main',
                borderRadius: 1,
                boxShadow: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Typography variant="caption" color="error.contrastText">
                Error
              </Typography>
            </Box>
          </Grid>
          <Grid item>
            <Box 
              sx={{ 
                width: 48, 
                height: 48, 
                bgcolor: 'warning.main',
                borderRadius: 1,
                boxShadow: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Typography variant="caption" color="warning.contrastText">
                Warning
              </Typography>
            </Box>
          </Grid>
          <Grid item>
            <Box 
              sx={{ 
                width: 48, 
                height: 48, 
                bgcolor: 'success.main',
                borderRadius: 1,
                boxShadow: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Typography variant="caption" color="success.contrastText">
                Success
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Components
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <Button variant="contained">Primary Button</Button>
          <Button variant="outlined">Outlined Button</Button>
          <Button>Text Button</Button>
        </Box>
        
        <TextField 
          label="Text Field" 
          variant="outlined" 
          size="small" 
          sx={{ mb: 2, width: '100%', maxWidth: 300 }} 
        />
        
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Chip label="Default Chip" />
          <Chip label="Primary" color="primary" />
          <Chip label="Success" color="success" />
        </Box>
      </Box>
    </Paper>
  );
};

export default ThemePreview;