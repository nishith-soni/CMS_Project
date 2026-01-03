// ===========================================
// Deals Page - CRM Pipeline View
// ===========================================

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Button,
  Paper,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { dealsService } from '../../services/crmService';

const stages = [
  { id: 'PROSPECTING', name: 'Prospecting', color: '#90caf9' },
  { id: 'QUALIFICATION', name: 'Qualification', color: '#ce93d8' },
  { id: 'PROPOSAL', name: 'Proposal', color: '#ffcc80' },
  { id: 'NEGOTIATION', name: 'Negotiation', color: '#a5d6a7' },
  { id: 'CLOSED_WON', name: 'Closed Won', color: '#81c784' },
  { id: 'CLOSED_LOST', name: 'Closed Lost', color: '#ef9a9a' },
];

function DealsPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', value: '', stage: 'PROSPECTING' });

  const { data: deals, isLoading, error } = useQuery({
    queryKey: ['deals'],
    queryFn: dealsService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: dealsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      setDialogOpen(false);
      setFormData({ title: '', value: '', stage: 'PROSPECTING' });
    },
  });

  const updateStageMutation = useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: string }) => dealsService.update(id, { stage: stage as any }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['deals'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: dealsService.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['deals'] }),
  });

  const getDealsByStage = (stageId: string) => deals?.filter((deal) => deal.stage === stageId) || [];
  const getTotalByStage = (stageId: string) => getDealsByStage(stageId).reduce((sum, deal) => sum + deal.value, 0);

  const handleSave = () => {
    createMutation.mutate({
      title: formData.title,
      value: parseFloat(formData.value) || 0,
      stage: formData.stage as any,
    });
  };

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">Failed to load deals</Alert>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">Deals Pipeline</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
          New Deal
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
        {stages.map((stage) => (
          <Paper key={stage.id} sx={{ minWidth: 280, maxWidth: 280, p: 2, backgroundColor: 'grey.50' }}>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: stage.color }} />
                <Typography variant="subtitle1" fontWeight="bold">{stage.name}</Typography>
                <Chip label={getDealsByStage(stage.id).length} size="small" sx={{ ml: 'auto' }} />
              </Box>
              <Typography variant="body2" color="text.secondary">
                ${getTotalByStage(stage.id).toLocaleString()}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {getDealsByStage(stage.id).map((deal) => (
                <Card key={deal.id} sx={{ cursor: 'pointer', '&:hover': { boxShadow: 2 } }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <Typography variant="subtitle2" gutterBottom>{deal.title}</Typography>
                      <IconButton size="small" onClick={() => deleteMutation.mutate(deal.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    <Typography variant="body2" color="text.secondary">{deal.contact ? `${deal.contact.firstName} ${deal.contact.lastName}` : 'No contact'}</Typography>
                    <Typography variant="body2" fontWeight="bold" color="primary" sx={{ mt: 1 }}>
                      ${deal.value.toLocaleString()}
                    </Typography>
                    <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                      <Select
                        value={deal.stage}
                        onChange={(e) => updateStageMutation.mutate({ id: deal.id, stage: e.target.value })}
                        size="small"
                      >
                        {stages.map((s) => (
                          <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Paper>
        ))}
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Deal</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            sx={{ mt: 2, mb: 2 }}
          />
          <TextField
            fullWidth
            label="Value"
            type="number"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth>
            <InputLabel>Stage</InputLabel>
            <Select
              label="Stage"
              value={formData.stage}
              onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
            >
              {stages.map((s) => (
                <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default DealsPage;
