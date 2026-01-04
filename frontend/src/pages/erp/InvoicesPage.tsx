// ===========================================
// Invoices Page - ERP Invoice Management
// ===========================================

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Grid,
  Snackbar,
} from '@mui/material';
import {
  Search as SearchIcon,
  Send as SendIcon,
  CheckCircle as PaidIcon,
  AttachMoney as MoneyIcon,
  Receipt as InvoiceIcon,
  Warning as OverdueIcon,
} from '@mui/icons-material';
import { invoicesService } from '../../services/erpService';

const statusConfig: Record<string, { label: string; color: 'default' | 'warning' | 'info' | 'success' | 'error' }> = {
  DRAFT: { label: 'Draft', color: 'default' },
  SENT: { label: 'Sent', color: 'info' },
  PAID: { label: 'Paid', color: 'success' },
  OVERDUE: { label: 'Overdue', color: 'error' },
  CANCELLED: { label: 'Cancelled', color: 'warning' },
};

function InvoicesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const { data: invoices, isLoading, error } = useQuery({
    queryKey: ['invoices'],
    queryFn: invoicesService.getAll,
  });

  const { data: stats } = useQuery({
    queryKey: ['invoices-stats'],
    queryFn: invoicesService.getStats,
  });

  const sendInvoiceMutation = useMutation({
    mutationFn: (id: string) => invoicesService.sendInvoice(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setSnackbar({ open: true, message: data.message, severity: 'success' });
    },
    onError: (error: any) => {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to send invoice',
        severity: 'error',
      });
    },
  });

  const markPaidMutation = useMutation({
    mutationFn: (id: string) => invoicesService.updateStatus(id, 'PAID'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoices-stats'] });
      setSnackbar({ open: true, message: 'Invoice marked as paid', severity: 'success' });
    },
  });

  const filteredInvoices = invoices?.filter(invoice => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      invoice.customer?.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">Failed to load invoices</Alert>;
  }

  return (
    <Box>
      <Typography variant="h5" component="h1" sx={{ mb: 3 }}>
        Invoices
      </Typography>

      {/* Stats Cards */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 6, md: 3 }}>
            <Card>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <InvoiceIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">{stats.total}</Typography>
                  <Typography color="text.secondary" variant="body2">Total Invoices</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Card>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <PaidIcon color="success" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">{stats.paid}</Typography>
                  <Typography color="text.secondary" variant="body2">Paid</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Card>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <OverdueIcon color="error" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">{stats.overdue}</Typography>
                  <Typography color="text.secondary" variant="body2">Overdue</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Card>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <MoneyIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">${stats.totalRevenue.toLocaleString()}</Typography>
                  <Typography color="text.secondary" variant="body2">Revenue</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
          <Box sx={{ flex: { xs: '1 1 auto', md: '2 1 0' } }}>
            <TextField
              fullWidth
              placeholder="Search invoices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
              }}
            />
          </Box>
          <Box sx={{ flex: { xs: '1 1 auto', md: '1 1 0' } }}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="DRAFT">Draft</MenuItem>
                <MenuItem value="SENT">Sent</MenuItem>
                <MenuItem value="PAID">Paid</MenuItem>
                <MenuItem value="OVERDUE">Overdue</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Paper>

      {/* Invoices Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Invoice #</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Issue Date</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography color="text.secondary" sx={{ py: 2 }}>
                    No invoices found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredInvoices.map((invoice) => {
                const status = statusConfig[invoice.status] || { label: invoice.status, color: 'default' as const };
                const isOverdue = new Date(invoice.dueDate) < new Date() && invoice.status === 'SENT';
                
                return (
                  <TableRow key={invoice.id} hover>
                    <TableCell>
                      <Typography fontWeight="medium">{invoice.invoiceNumber}</Typography>
                    </TableCell>
                    <TableCell>{invoice.customer?.name || '-'}</TableCell>
                    <TableCell>{new Date(invoice.issueDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Typography color={isOverdue ? 'error' : 'inherit'}>
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>${Number(invoice.total).toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip label={status.label} color={status.color} size="small" />
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        {(invoice.status === 'DRAFT' || invoice.status === 'SENT') && (
                          <Tooltip title="Send Invoice">
                            <IconButton
                              color="primary"
                              onClick={() => sendInvoiceMutation.mutate(invoice.id)}
                              disabled={sendInvoiceMutation.isPending}
                            >
                              <SendIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        {(invoice.status === 'SENT' || invoice.status === 'OVERDUE') && (
                          <Tooltip title="Mark as Paid">
                            <IconButton
                              color="success"
                              onClick={() => markPaidMutation.mutate(invoice.id)}
                              disabled={markPaidMutation.isPending}
                            >
                              <PaidIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default InvoicesPage;
