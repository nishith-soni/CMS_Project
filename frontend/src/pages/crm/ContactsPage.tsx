// ===========================================
// Contacts Page - CRM Contacts List
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
  IconButton,
  Avatar,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  EventNote as ActivityIcon,
} from '@mui/icons-material';
import { contactsService, activitiesService } from '../../services/crmService';
import type { Contact, Activity } from '../../services/crmService';

function ContactsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    jobTitle: '',
  });

  // Activities dialog state
  const [activitiesDialogOpen, setActivitiesDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [activityForm, setActivityForm] = useState({
    type: 'NOTE' as Activity['type'],
    title: '',
    description: '',
    dueDate: '',
  });
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  const { data: contacts, isLoading, error } = useQuery({
    queryKey: ['contacts'],
    queryFn: contactsService.getAll,
  });

  const { data: activitiesData, refetch: refetchActivities } = useQuery({
    queryKey: ['activities', selectedContact?.id],
    queryFn: () => activitiesService.getAll({ contactId: selectedContact!.id, pageSize: 20 }),
    enabled: !!selectedContact,
  });

  const activities: Activity[] = activitiesData?.data || [];

  const createMutation = useMutation({
    mutationFn: (data: Partial<Contact>) => contactsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      handleCloseDialog();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Contact> }) => contactsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      handleCloseDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => contactsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });

  const createActivityMutation = useMutation({
    mutationFn: (data: {
      type: Activity['type'];
      title: string;
      description?: string;
      dueDate?: string;
      contactId: string;
    }) => activitiesService.create(data),
    onSuccess: () => {
      refetchActivities();
      queryClient.invalidateQueries({ queryKey: ['crm-task-summary'] });
      setActivityForm({ type: 'NOTE', title: '', description: '', dueDate: '' });
    },
  });

  const updateActivityMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Activity> }) =>
      activitiesService.update(id, data),
    onSuccess: () => {
      refetchActivities();
      queryClient.invalidateQueries({ queryKey: ['crm-task-summary'] });
      setEditingActivity(null);
      setActivityForm({ type: 'NOTE', title: '', description: '', dueDate: '' });
    },
  });

  const deleteActivityMutation = useMutation({
    mutationFn: (id: string) => activitiesService.delete(id),
    onSuccess: (_data, id) => {
      refetchActivities();
      queryClient.invalidateQueries({ queryKey: ['crm-task-summary'] });
      if (editingActivity && editingActivity.id === id) {
        setEditingActivity(null);
        setActivityForm({ type: 'NOTE', title: '', description: '', dueDate: '' });
      }
    },
  });

  const handleOpenDialog = (contact?: Contact) => {
    if (contact) {
      setEditingContact(contact);
      setFormData({
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email || '',
        phone: contact.phone || '',
        company: contact.company || '',
        jobTitle: contact.jobTitle || '',
      });
    } else {
      setEditingContact(null);
      setFormData({ firstName: '', lastName: '', email: '', phone: '', company: '', jobTitle: '' });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingContact(null);
    setFormData({ firstName: '', lastName: '', email: '', phone: '', company: '', jobTitle: '' });
  };

  const openActivitiesDialog = (contact: Contact) => {
    setSelectedContact(contact);
    setActivitiesDialogOpen(true);
  };

  const closeActivitiesDialog = () => {
    setActivitiesDialogOpen(false);
    setSelectedContact(null);
    setActivityForm({ type: 'NOTE', title: '', description: '', dueDate: '' });
     setEditingActivity(null);
  };

  const handleSubmitActivity = () => {
    if (!selectedContact || !activityForm.title) return;

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
        contactId: selectedContact.id,
      });
    }
  };

  const handleSubmit = () => {
    if (editingContact) {
      updateMutation.mutate({ id: editingContact.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const filteredContacts = contacts?.filter(c =>
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.company?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error">Failed to load contacts</Alert>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">Contacts</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          New Contact
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search contacts..."
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
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Company</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredContacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography color="text.secondary" sx={{ py: 2 }}>No contacts found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredContacts.map((contact) => (
                <TableRow key={contact.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {contact.firstName[0]}{contact.lastName[0]}
                      </Avatar>
                      {contact.firstName} {contact.lastName}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {contact.email && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <EmailIcon fontSize="small" color="action" />
                        {contact.email}
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>
                    {contact.phone && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PhoneIcon fontSize="small" color="action" />
                        {contact.phone}
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>{contact.company}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openActivitiesDialog(contact)}>
                      <ActivityIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleOpenDialog(contact)}><EditIcon /></IconButton>
                    <IconButton size="small" color="error" onClick={() => deleteMutation.mutate(contact.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingContact ? 'Edit Contact' : 'New Contact'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField fullWidth label="First Name" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} required />
              <TextField fullWidth label="Last Name" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} required />
            </Box>
            <TextField fullWidth label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            <TextField fullWidth label="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            <TextField fullWidth label="Company" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} />
            <TextField fullWidth label="Job Title" value={formData.jobTitle} onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
            {editingContact ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Activities / Timeline Dialog */}
      <Dialog open={activitiesDialogOpen} onClose={closeActivitiesDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedContact ? `Activities for ${selectedContact.firstName} ${selectedContact.lastName}` : 'Activities'}
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
            {activities.length === 0 ? (
              <Typography color="text.secondary" sx={{ mt: 2 }}>
                No activities yet for this contact.
              </Typography>
            ) : (
              <List sx={{ mt: 2 }}>
                {activities.map((activity) => (
                  <ListItem key={activity.id} alignItems="flex-start">
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip label={activity.type} size="small" />
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
                        <Chip
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
          <Button onClick={closeActivitiesDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ContactsPage;
