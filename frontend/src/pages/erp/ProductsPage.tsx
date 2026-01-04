// ===========================================
// Products Page - ERP Products Management
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
  IconButton,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Snackbar,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Search as SearchIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';
import { productsService } from '../../services/erpService';
import type { Product } from '../../services/erpService';

function ProductsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [stockProduct, setStockProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [stockAdjustment, setStockAdjustment] = useState({ quantity: '', operation: 'add' as 'add' | 'subtract' | 'set' });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    price: '',
    cost: '',
    stockQuantity: '',
    lowStockThreshold: '',
  });

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: productsService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Product>) => productsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setSnackbar({ open: true, message: 'Product created successfully!', severity: 'success' });
      handleCloseDialog();
    },
    onError: (error: any) => {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to create product', severity: 'error' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) => productsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setSnackbar({ open: true, message: 'Product updated successfully!', severity: 'success' });
      handleCloseDialog();
    },
    onError: (error: any) => {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to update product', severity: 'error' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setSnackbar({ open: true, message: 'Product deleted successfully!', severity: 'success' });
      setDeleteDialogOpen(false);
      setDeleteProduct(null);
    },
    onError: (error: any) => {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to delete product', severity: 'error' });
    },
  });

  const stockMutation = useMutation({
    mutationFn: ({ id, quantity, operation }: { id: string; quantity: number; operation: 'add' | 'subtract' | 'set' }) => 
      productsService.updateStock(id, quantity, operation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setSnackbar({ open: true, message: 'Stock updated successfully!', severity: 'success' });
      setStockDialogOpen(false);
      setStockProduct(null);
      setStockAdjustment({ quantity: '', operation: 'add' });
    },
    onError: (error: any) => {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to update stock', severity: 'error' });
    },
  });

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        sku: product.sku,
        description: product.description || '',
        price: product.price.toString(),
        cost: product.cost?.toString() || '',
        stockQuantity: product.stockQuantity.toString(),
        lowStockThreshold: product.lowStockThreshold.toString(),
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', sku: '', description: '', price: '', cost: '', stockQuantity: '0', lowStockThreshold: '10' });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = () => {
    const data = {
      name: formData.name,
      sku: formData.sku,
      description: formData.description || null,
      price: parseFloat(formData.price),
      cost: formData.cost ? parseFloat(formData.cost) : null,
      stockQuantity: parseInt(formData.stockQuantity),
      lowStockThreshold: parseInt(formData.lowStockThreshold),
    };
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getStockStatus = (stockQuantity: number, lowStockThreshold: number) => {
    if (stockQuantity === 0) return { label: 'Out of Stock', color: 'error' as const };
    if (stockQuantity <= lowStockThreshold) return { label: 'Low Stock', color: 'warning' as const };
    return { label: 'In Stock', color: 'success' as const };
  };

  const filteredProducts = products?.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  ) || [];

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">Failed to load products</Alert>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">Products</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          New Product
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
          }}
        />
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>SKU</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="text.secondary" sx={{ py: 2 }}>No products found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => {
                const status = getStockStatus(product.stockQuantity, product.lowStockThreshold);
                return (
                  <TableRow key={product.id} hover>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>${Number(product.price).toFixed(2)}</TableCell>
                    <TableCell>{product.stockQuantity}</TableCell>
                    <TableCell>
                      <Chip label={status.label} color={status.color} size="small" />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Adjust Stock">
                        <IconButton size="small" color="primary" onClick={() => { setStockProduct(product); setStockDialogOpen(true); }}>
                          <InventoryIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleOpenDialog(product)}><EditIcon /></IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => { setDeleteProduct(product); setDeleteDialogOpen(true); }}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingProduct ? 'Edit Product' : 'New Product'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField fullWidth label="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            <TextField fullWidth label="SKU" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} required />
            <TextField fullWidth label="Description" multiline rows={2} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField fullWidth label="Price ($)" type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
              <TextField fullWidth label="Cost ($)" type="number" value={formData.cost} onChange={(e) => setFormData({ ...formData, cost: e.target.value })} />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField fullWidth label="Stock Quantity" type="number" value={formData.stockQuantity} onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })} required />
              <TextField fullWidth label="Low Stock Threshold" type="number" value={formData.lowStockThreshold} onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })} />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
            {editingProduct ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Stock Adjustment Dialog */}
      <Dialog open={stockDialogOpen} onClose={() => setStockDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Adjust Stock - {stockProduct?.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Current Stock: <strong>{stockProduct?.stockQuantity}</strong>
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Operation</InputLabel>
              <Select
                label="Operation"
                value={stockAdjustment.operation}
                onChange={(e) => setStockAdjustment({ ...stockAdjustment, operation: e.target.value as 'add' | 'subtract' | 'set' })}
              >
                <MenuItem value="add">Add to Stock</MenuItem>
                <MenuItem value="subtract">Remove from Stock</MenuItem>
                <MenuItem value="set">Set Stock to</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Quantity"
              type="number"
              value={stockAdjustment.quantity}
              onChange={(e) => setStockAdjustment({ ...stockAdjustment, quantity: e.target.value })}
              inputProps={{ min: 0 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStockDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => stockProduct && stockMutation.mutate({
              id: stockProduct.id,
              quantity: parseInt(stockAdjustment.quantity),
              operation: stockAdjustment.operation,
            })}
            disabled={!stockAdjustment.quantity || stockMutation.isPending}
          >
            {stockMutation.isPending ? 'Updating...' : 'Update Stock'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Product?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{deleteProduct?.name}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => deleteProduct && deleteMutation.mutate(deleteProduct.id)}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for feedback */}
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

export default ProductsPage;
