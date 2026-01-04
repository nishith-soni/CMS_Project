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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip as MuiChip,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, EventNote as ActivityIcon, Edit as EditIcon } from '@mui/icons-material';
import { dealsService, activitiesService } from '../../services/crmService';
import type { Deal, Activity } from '../../services/crmService';

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
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [activityForm, setActivityForm] = useState({
    type: 'NOTE' as Activity['type'],
    title: '',
    description: '',
    dueDate: '',
  });
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  const { data: deals, isLoading, error } = useQuery({
    queryKey: ['deals'],
    queryFn: dealsService.getAll,
  });

  const { data: dealActivitiesData, refetch: refetchDealActivities } = useQuery({
    queryKey: ['deal-activities', selectedDeal?.id],
    queryFn: () => activitiesService.getAll({ dealId: selectedDeal!.id, pageSize: 20 }),
    enabled: !!selectedDeal,
  });

  const dealActivities: Activity[] = dealActivitiesData?.data || [];

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

  const createActivityMutation = useMutation({
    mutationFn: (data: {
      type: Activity['type'];
      title: string;
      description?: string;
      dueDate?: string;
      dealId: string;
    }) => activitiesService.create(data),
    onSuccess: () => {
      refetchDealActivities();
      queryClient.invalidateQueries({ queryKey: ['crm-task-summary'] });
      setActivityForm({ type: 'NOTE', title: '', description: '', dueDate: '' });
    },
  });

  const updateActivityMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Activity> }) =>
      activitiesService.update(id, data),
    onSuccess: () => {
      refetchDealActivities();
      queryClient.invalidateQueries({ queryKey: ['crm-task-summary'] });
      setEditingActivity(null);
      setActivityForm({ type: 'NOTE', title: '', description: '', dueDate: '' });
    },
  });

  const deleteActivityMutation = useMutation({
    mutationFn: (id: string) => activitiesService.delete(id),
    onSuccess: (_data, id) => {
      refetchDealActivities();
      queryClient.invalidateQueries({ queryKey: ['crm-task-summary'] });
      if (editingActivity && editingActivity.id === id) {
        setEditingActivity(null);
        setActivityForm({ type: 'NOTE', title: '', description: '', dueDate: '' });
      }
    },
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

  const openActivityDialog = (deal: Deal) => {
    setSelectedDeal(deal);
    setActivityDialogOpen(true);
  };

  const closeActivityDialog = () => {
    setActivityDialogOpen(false);
    setSelectedDeal(null);
    setActivityForm({ type: 'NOTE', title: '', description: '', dueDate: '' });
    setEditingActivity(null);
  };

  const handleSubmitActivity = () => {
    if (!selectedDeal || !activityForm.title) return;

    const baseData = {
      type: activityForm.type,
      title: activityForm.title,
      description: activityForm.description || undefined,
      dueDate: activityForm.dueDate || undefined,
    };

    if (editingActivity) {
      updateActivityMutation.mutate({
        id: editingActivity.id,
        data: baseData,
      });
    } else {
      createActivityMutation.mutate({
        ...baseData,
        dealId: selectedDeal.id,
      });
    }
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
                      <Box>
                        <IconButton size="small" onClick={() => openActivityDialog(deal)}>
                          <ActivityIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => deleteMutation.mutate(deal.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
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

      {/* Deal Activities Dialog */}
      <Dialog open={activityDialogOpen} onClose={closeActivityDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedDeal ? `Activities for ${selectedDeal.title}` : 'Deal Activities'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {/* New activity form */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  label="Type"
                  value={activityForm.type}
                  onChange={(e) => setActivityForm({ ...activityForm, type: e.target.value as Activity['type'] })}
                >
                  <MenuItem value="NOTE">Note</MenuItem>
                  <MenuItem value="CALL">Call</MenuItem>
                  <MenuItem value="EMAIL">Email</MenuItem>
                  <MenuItem value="MEETING">Meeting</MenuItem>
                  <MenuItem value="TASK">Task</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Title"
                fullWidth
                value={activityForm.title}
                onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
              />
              <TextField
                label="Description"
                fullWidth
                multiline
                minRows={2}
                value={activityForm.description}
                onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
              />
              <TextField
                label="Due Date (optional)"
                type="date"
                InputLabelProps={{ shrink: true }}
                fullWidth
                value={activityForm.dueDate}
                onChange={(e) => setActivityForm({ ...activityForm, dueDate: e.target.value })}
              />
            </Box>

            <Button
              variant="contained"
              onClick={handleSubmitActivity}
              disabled={createActivityMutation.isPending || updateActivityMutation.isPending}
            >
              {editingActivity ? 'Update Activity' : 'Add Activity'}
            </Button>
            {editingActivity && (
              <Button
                onClick={() => {
                  setEditingActivity(null);
                  setActivityForm({ type: 'NOTE', title: '', description: '', dueDate: '' });
                }}
              >
                Cancel Edit
              </Button>
            )}

            {/* Existing activities */}
            {dealActivities.length === 0 ? (
              <Typography color="text.secondary" sx={{ mt: 2 }}>
                No activities yet for this deal.
              </Typography>
            ) : (
              <List sx={{ mt: 2 }}>
                {dealActivities.map((activity) => (
                  <ListItem key={activity.id} alignItems="flex-start">
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <MuiChip label={activity.type} size="small" />
                          <Typography variant="subtitle2">{activity.title}</Typography>
                        </Box>
                      }
                      secondary={
                        <>
                          {activity.description && (
                            <Typography variant="body2" color="text.secondary">
                              {activity.description}
                            </Typography>
                          )}
                          <Typography variant="caption" color="text.secondary">
                            {activity.dueDate
                              ? `Due: ${new Date(activity.dueDate).toLocaleDateString()}`
                              : `Created: ${new Date(activity.createdAt).toLocaleDateString()}`}
                          </Typography>
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      {activity.type === 'TASK' && (
                        <MuiChip
                          label={activity.completed ? 'Done' : 'Mark done'}
                          color={activity.completed ? 'success' : 'default'}
                          size="small"
                          onClick={() =>
                            updateActivityMutation.mutate({
                              id: activity.id,
                              data: { completed: !activity.completed },
                            })
                          }
                        />
                      )}
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => deleteActivityMutation.mutate(activity.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setEditingActivity(activity);
                          setActivityForm({
                            type: activity.type,
                            title: activity.title,
                            description: activity.description || '',
                            dueDate: activity.dueDate
                              ? new Date(activity.dueDate).toISOString().slice(0, 10)
                              : '',
                          });
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeActivityDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default DealsPage;
