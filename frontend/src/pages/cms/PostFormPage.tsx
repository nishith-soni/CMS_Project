// ===========================================
// Post Form Page - Create/Edit Post
// ===========================================

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { postsService } from '../../services/postsService';
import type { CreatePostData } from '../../services/postsService';

function PostFormPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams();
  const isEdit = Boolean(id);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    status: 'DRAFT' as 'DRAFT' | 'PUBLISHED',
    categoryId: '',
    metaTitle: '',
    metaDescription: '',
  });
  const [error, setError] = useState<string | null>(null);

  // Fetch post for editing
  const { data: post, isLoading: isLoadingPost } = useQuery({
    queryKey: ['post', id],
    queryFn: () => postsService.getById(id!),
    enabled: isEdit,
  });

  // Populate form when editing
  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title,
        content: post.content || '',
        excerpt: post.excerpt || '',
        status: post.status === 'ARCHIVED' ? 'DRAFT' : post.status,
        categoryId: post.category?.id || '',
        metaTitle: post.metaTitle || '',
        metaDescription: post.metaDescription || '',
      });
    }
  }, [post]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreatePostData) => postsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      navigate('/cms/posts');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to create post');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: CreatePostData) => postsService.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', id] });
      navigate('/cms/posts');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to update post');
    },
  });

  const isLoading = createMutation.isPending || updateMutation.isPending;
  
  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const data: CreatePostData = {
      title: formData.title,
      content: formData.content,
      excerpt: formData.excerpt || undefined,
      status: formData.status,
      metaTitle: formData.metaTitle || undefined,
      metaDescription: formData.metaDescription || undefined,
      categoryId: formData.categoryId || undefined,
    };

    if (isEdit) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  if (isEdit && isLoadingPost) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/cms/posts')}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h5" component="h1">
          {isEdit ? 'Edit Post' : 'New Post'}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          {/* Main Content */}
          <Box sx={{ flex: { xs: '1 1 auto', md: '2 1 0' } }}>
            <Paper sx={{ p: 3 }}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                sx={{ mb: 3 }}
              />
              
              <TextField
                fullWidth
                label="Content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                multiline
                rows={15}
                required
                sx={{ mb: 3 }}
              />
              
              <TextField
                fullWidth
                label="Excerpt"
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                multiline
                rows={3}
                helperText="Short summary of the post"
              />
            </Paper>
          </Box>
          
          {/* Sidebar */}
          <Box sx={{ flex: { xs: '1 1 auto', md: '1 1 0' } }}>
            {/* Status */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Publish
              </Typography>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  label="Status"
                  onChange={handleChange}
                >
                  <MenuItem value="DRAFT">Draft</MenuItem>
                  <MenuItem value="PUBLISHED">Published</MenuItem>
                </Select>
              </FormControl>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                startIcon={isLoading ? <CircularProgress size={20} /> : <SaveIcon />}
                disabled={isLoading}
              >
                {formData.status === 'PUBLISHED' ? 'Publish' : 'Save Draft'}
              </Button>
            </Paper>
            
            {/* SEO */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                SEO
              </Typography>
              <TextField
                fullWidth
                label="Meta Title"
                name="metaTitle"
                value={formData.metaTitle}
                onChange={handleChange}
                sx={{ mb: 2 }}
                helperText="Max 70 characters"
              />
              <TextField
                fullWidth
                label="Meta Description"
                name="metaDescription"
                value={formData.metaDescription}
                onChange={handleChange}
                multiline
                rows={3}
                helperText="Max 160 characters"
              />
            </Paper>
          </Box>
        </Box>
      </form>
    </Box>
  );
}

export default PostFormPage;
