// ===========================================
// Orders Page - ERP Sales Orders Management
// ===========================================

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Button,
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
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  CheckCircle as ConfirmIcon,
  Delete as DeleteIcon,
  AddShoppingCart as AddItemIcon,
} from '@mui/icons-material';
import { ordersService, customersService, productsService, type Product, type Customer } from '../../services/erpService';

const statusConfig: Record<string, { label: string; color: 'default' | 'warning' | 'info' | 'primary' | 'success' | 'error' }> = {
  DRAFT: { label: 'Draft', color: 'default' },
  CONFIRMED: { label: 'Confirmed', color: 'warning' },
  PROCESSING: { label: 'Processing', color: 'info' },
  SHIPPED: { label: 'Shipped', color: 'primary' },
  DELIVERED: { label: 'Delivered', color: 'success' },
  CANCELLED: { label: 'Cancelled', color: 'error' },
};

interface OrderItemInput {
  product: Product;
  quantity: number;
}

function OrdersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  
  // New Order Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItemInput[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [orderNotes, setOrderNotes] = useState('');

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['orders'],
    queryFn: ordersService.getAll,
    // Auto-refresh every 2 seconds to catch status updates from background processing
    refetchInterval: 2000,
  });

  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: customersService.getAll,
  });

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: productsService.getAll,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: any }) => ordersService.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  });

  const confirmOrderMutation = useMutation({
    mutationFn: (id: string) => ordersService.confirmOrder(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setSnackbar({
        open: true,
        message: data.message || 'Order confirmed and queued for processing!',
        severity: 'success',
      });
    },
    onError: (error: any) => {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to confirm order',
        severity: 'error',
      });
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: (data: { customerId: string; items: { productId: string; quantity: number }[]; notes?: string }) =>
      ordersService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setSnackbar({
        open: true,
        message: 'Order created successfully!',
        severity: 'success',
      });
      handleCloseDialog();
    },
    onError: (error: any) => {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to create order',
        severity: 'error',
      });
    },
  });

  const handleOpenDialog = () => {
    setDialogOpen(true);
    setSelectedCustomer(null);
    setOrderItems([]);
    setSelectedProduct(null);
    setQuantity(1);
    setOrderNotes('');
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleAddItem = () => {
    if (selectedProduct && quantity > 0) {
      const existingIndex = orderItems.findIndex(item => item.product.id === selectedProduct.id);
      if (existingIndex >= 0) {
        const updated = [...orderItems];
        updated[existingIndex].quantity += quantity;
        setOrderItems(updated);
      } else {
        setOrderItems([...orderItems, { product: selectedProduct, quantity }]);
      }
      setSelectedProduct(null);
      setQuantity(1);
    }
  };

  const handleRemoveItem = (productId: string) => {
    setOrderItems(orderItems.filter(item => item.product.id !== productId));
  };

  const handleCreateOrder = () => {
    if (!selectedCustomer || orderItems.length === 0) return;

    createOrderMutation.mutate({
      customerId: selectedCustomer.id,
      items: orderItems.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
      notes: orderNotes || undefined,
    });
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);
  };

  const filteredOrders = orders?.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      order.customer?.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">Failed to load orders</Alert>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">Sales Orders</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenDialog}>
          New Order
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
          <Box sx={{ flex: { xs: '1 1 auto', md: '2 1 0' } }}>
            <TextField
              fullWidth
              placeholder="Search orders..."
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
                <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                <MenuItem value="PROCESSING">Processing</MenuItem>
                <MenuItem value="SHIPPED">Shipped</MenuItem>
                <MenuItem value="DELIVERED">Delivered</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order #</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="text.secondary" sx={{ py: 2 }}>No orders found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => {
                const status = statusConfig[order.status] || { label: order.status, color: 'default' as const };
                return (
                  <TableRow key={order.id} hover>
                    <TableCell>
                      <Typography fontWeight="medium">{order.orderNumber}</Typography>
                    </TableCell>
                    <TableCell>{order.customer?.name || '-'}</TableCell>
                    <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>${Number(order.total).toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip label={status.label} color={status.color} size="small" />
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                        {order.status === 'DRAFT' && (
                          <Tooltip title="Confirm Order">
                            <IconButton
                              color="success"
                              onClick={() => confirmOrderMutation.mutate(order.id)}
                              disabled={confirmOrderMutation.isPending}
                            >
                              <ConfirmIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        {(order.status === 'CONFIRMED' || order.status === 'PROCESSING') && (
                          <Tooltip title="Processing...">
                            <CircularProgress size={20} />
                          </Tooltip>
                        )}
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                          <Select
                            value={order.status}
                            onChange={(e) => {
                              const newStatus = e.target.value as any;
                              // If moving from DRAFT to CONFIRMED via dropdown, use the confirm flow
                              if (order.status === 'DRAFT' && newStatus === 'CONFIRMED') {
                                confirmOrderMutation.mutate(order.id);
                              } else {
                                updateStatusMutation.mutate({ id: order.id, status: newStatus });
                              }
                            }}
                            size="small"
                            disabled={order.status === 'CONFIRMED'}
                          >
                            <MenuItem value="DRAFT">Draft</MenuItem>
                            <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                            <MenuItem value="PROCESSING">Processing</MenuItem>
                            <MenuItem value="SHIPPED">Shipped</MenuItem>
                            <MenuItem value="DELIVERED">Delivered</MenuItem>
                            <MenuItem value="CANCELLED">Cancelled</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* New Order Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Create New Order</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {/* Customer Selection */}
            <Autocomplete
              options={customers || []}
              getOptionLabel={(option) => `${option.name} (${option.email || 'No email'})`}
              value={selectedCustomer}
              onChange={(_, value) => setSelectedCustomer(value)}
              renderInput={(params) => (
                <TextField {...params} label="Select Customer" required fullWidth />
              )}
              sx={{ mb: 3 }}
            />

            <Divider sx={{ my: 2 }} />

            {/* Add Product */}
            <Typography variant="subtitle1" gutterBottom>Add Products</Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 6 }}>
                <Autocomplete
                  options={products || []}
                  getOptionLabel={(option) => `${option.name} - $${Number(option.price).toFixed(2)} (Stock: ${option.stockQuantity})`}
                  value={selectedProduct}
                  onChange={(_, value) => setSelectedProduct(value)}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Product" fullWidth />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <TextField
                  label="Quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  inputProps={{ min: 1 }}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <Button
                  variant="outlined"
                  startIcon={<AddItemIcon />}
                  onClick={handleAddItem}
                  disabled={!selectedProduct}
                  fullWidth
                >
                  Add
                </Button>
              </Grid>
            </Grid>

            {/* Order Items List */}
            {orderItems.length > 0 && (
              <Paper variant="outlined" sx={{ mt: 3 }}>
                <List>
                  {orderItems.map((item, index) => (
                    <ListItem key={item.product.id} divider={index < orderItems.length - 1}>
                      <ListItemText
                        primary={item.product.name}
                        secondary={`$${Number(item.product.price).toFixed(2)} × ${item.quantity} = $${(Number(item.product.price) * item.quantity).toFixed(2)}`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton edge="end" onClick={() => handleRemoveItem(item.product.id)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
                <Box sx={{ p: 2, bgcolor: 'grey.100', display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle1" fontWeight="bold">Total:</Typography>
                  <Typography variant="subtitle1" fontWeight="bold">${calculateTotal().toFixed(2)}</Typography>
                </Box>
              </Paper>
            )}

            {/* Notes */}
            <TextField
              label="Order Notes (optional)"
              multiline
              rows={2}
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              fullWidth
              sx={{ mt: 3 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateOrder}
            disabled={!selectedCustomer || orderItems.length === 0 || createOrderMutation.isPending}
          >
            {createOrderMutation.isPending ? 'Creating...' : 'Create Order'}
          </Button>
        </DialogActions>
      </Dialog>
      
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

export default OrdersPage;
