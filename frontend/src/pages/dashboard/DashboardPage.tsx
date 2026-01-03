// ===========================================
// Dashboard Page - Main Overview
// ===========================================
// 
// WHY THIS FILE?
// Displays key metrics and quick access to all modules.
// Uses MUI Cards for stat display.

import { Card, CardContent, Typography, Box, Paper, Button } from '@mui/material';
import {
  Article as ArticleIcon,
  People as PeopleIcon,
  Handshake as HandshakeIcon,
  ShoppingCart as ShoppingCartIcon,
  TrendingUp as TrendingUpIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

// ===========================================
// Stat Card Component
// ===========================================
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  change?: string;
}

function StatCard({ title, value, icon, color, change }: StatCardProps) {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography color="text.secondary" variant="body2" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div" fontWeight="bold">
              {value}
            </Typography>
            {change && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
                <Typography variant="body2" color="success.main">
                  {change}
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: `${color}20`,
              color: color,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

// ===========================================
// Dashboard Page Component
// ===========================================
function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  
  return (
    <Box>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome back, {user?.firstName}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your platform today.
        </Typography>
      </Box>
      
      {/* Stats Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        <StatCard
          title="Total Posts"
          value={24}
          icon={<ArticleIcon />}
          color="#1976d2"
          change="+12% this month"
        />
        <StatCard
          title="Contacts"
          value={156}
          icon={<PeopleIcon />}
          color="#9c27b0"
          change="+8% this month"
        />
        <StatCard
          title="Active Deals"
          value={12}
          icon={<HandshakeIcon />}
          color="#ed6c02"
          change="+5% this month"
        />
        <StatCard
          title="Orders"
          value={89}
          icon={<ShoppingCartIcon />}
          color="#2e7d32"
          change="+15% this month"
        />
      </Box>
      
      {/* Quick Actions */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Recent Activity
          </Typography>
          <Box sx={{ color: 'text.secondary' }}>
            <Typography variant="body2" sx={{ py: 1 }}>
              • New contact added: John Doe
            </Typography>
            <Typography variant="body2" sx={{ py: 1 }}>
              • Post published: "Getting Started Guide"
            </Typography>
            <Typography variant="body2" sx={{ py: 1 }}>
              • Deal closed: $5,000 - Acme Corp
            </Typography>
            <Typography variant="body2" sx={{ py: 1 }}>
              • New order received: #ORD-001
            </Typography>
          </Box>
        </Paper>
        
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => navigate('/cms/posts/new')}
              sx={{ justifyContent: 'flex-start' }}
            >
              Create New Post
            </Button>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => navigate('/crm/contacts')}
              sx={{ justifyContent: 'flex-start' }}
            >
              Add New Contact
            </Button>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => navigate('/erp/orders')}
              sx={{ justifyContent: 'flex-start' }}
            >
              Create Sales Order
            </Button>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => navigate('/erp/products')}
              sx={{ justifyContent: 'flex-start' }}
            >
              View Products
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

export default DashboardPage;
