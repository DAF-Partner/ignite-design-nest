// Professional User Management Page for B2B Debt Collection Platform
// Complete user administration with role management and access controls

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  Users as UsersIcon,
  UserPlus,
  Edit,
  Trash2,
  Shield,
  Mail,
  Phone,
  Calendar,
  Search,
  Filter,
  MoreHorizontal,
  Key,
  Lock,
  Unlock,
  UserCheck,
  UserX,
  Building
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';

import { useAuth } from '@/components/auth/AuthProvider';
import { mockUsers } from '@/lib/mockData';
import type { User, UserRole } from '@/types';

const roleConfig = {
  CLIENT: {
    label: 'Client',
    description: 'Access to own cases and invoices',
    color: 'blue'
  },
  AGENT: {
    label: 'Agent',
    description: 'Manage assigned cases',
    color: 'green'
  },
  ADMIN: {
    label: 'Administrator',
    description: 'Full system access',
    color: 'red'
  },
  DPO: {
    label: 'Data Protection Officer',
    description: 'GDPR compliance management',
    color: 'purple'
  }
};

interface UserFormData {
  name: string;
  email: string;
  role: UserRole;
  clientId?: string;
  isActive: boolean;
}

export default function Users() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    role: 'CLIENT',
    clientId: '',
    isActive: true
  });
  
  // Filters
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Load users data
  useEffect(() => {
    // Add isActive property to mock users for demonstration
    const usersWithStatus = mockUsers.map(user => ({
      ...user,
      isActive: Math.random() > 0.1 // 90% active users
    }));
    setUsers(usersWithStatus);
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...users];

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      filtered = filtered.filter(user => user.isActive === isActive);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      );
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setFilteredUsers(filtered);
  }, [users, roleFilter, statusFilter, searchQuery]);

  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsEditing(false);
    setFormData({
      name: '',
      email: '',
      role: 'CLIENT',
      clientId: '',
      isActive: true
    });
    setShowUserDialog(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditing(true);
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        clientId: user.clientId || '',
        isActive: user.isActive || true
      });
    setShowUserDialog(true);
  };

  const handleSaveUser = async () => {
    if (!formData.name || !formData.email) {
      toast({
        title: 'Invalid Input',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }

    const userData = {
      ...formData,
      id: selectedUser?.id || `user_${Date.now()}`,
      createdAt: selectedUser?.createdAt || new Date().toISOString(),
      lastLoginAt: selectedUser?.lastLoginAt,
      ...(formData.role !== 'CLIENT' && { clientId: undefined })
    };

    if (isEditing) {
      setUsers(users.map(user => 
        user.id === selectedUser?.id 
          ? { ...user, ...userData }
          : user
      ));
      
      toast({
        title: 'User Updated',
        description: `${userData.name} has been updated successfully.`
      });
    } else {
      setUsers([userData as User, ...users]);
      
      toast({
        title: 'User Created',
        description: `${userData.name} has been created successfully.`
      });
    }

    setShowUserDialog(false);
  };

  const handleDeleteUser = async () => {
    if (selectedUser) {
      if (selectedUser.id === currentUser?.id) {
        toast({
          title: 'Cannot Delete',
          description: 'You cannot delete your own account.',
          variant: 'destructive'
        });
        return;
      }

      setUsers(users.filter(user => user.id !== selectedUser.id));
      setShowDeleteConfirm(false);
      
      toast({
        title: 'User Deleted',
        description: `${selectedUser.name} has been permanently deleted.`
      });
    }
  };

  const handleToggleUserStatus = (user: User) => {
    const newStatus = !user.isActive;
    setUsers(users.map(u => 
      u.id === user.id 
        ? { ...u, isActive: newStatus }
        : u
    ));
    
    toast({
      title: `User ${newStatus ? 'Activated' : 'Deactivated'}`,
      description: `${user.name} has been ${newStatus ? 'activated' : 'deactivated'}.`
    });
  };

  const handleResetPassword = (user: User) => {
    toast({
      title: 'Password Reset',
      description: `Password reset email sent to ${user.email}.`
    });
  };

  // Calculate statistics
  const stats = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    clients: users.filter(u => u.role === 'CLIENT').length,
    agents: users.filter(u => u.role === 'AGENT').length,
    admins: users.filter(u => u.role === 'ADMIN').length
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage system users, roles, and permissions
          </p>
        </div>
        
        <Button onClick={handleCreateUser}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <UsersIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <UserCheck className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Building className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Clients</p>
                <p className="text-2xl font-bold">{stats.clients}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <UserCheck className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Agents</p>
                <p className="text-2xl font-bold">{stats.agents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <Shield className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Admins</p>
                <p className="text-2xl font-bold">{stats.admins}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg">
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="CLIENT">Client</SelectItem>
                  <SelectItem value="AGENT">Agent</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="DPO">DPO</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No users found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <UsersIcon className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          {user.clientId && (
                            <p className="text-xs text-muted-foreground">Client ID: {user.clientId}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={`
                          ${user.role === 'CLIENT' ? 'border-blue-500 text-blue-500' : ''}
                          ${user.role === 'AGENT' ? 'border-green-500 text-green-500' : ''}
                          ${user.role === 'ADMIN' ? 'border-red-500 text-red-500' : ''}
                          ${user.role === 'DPO' ? 'border-purple-500 text-purple-500' : ''}
                        `}
                      >
                        {roleConfig[user.role].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        <span className="text-sm">
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.lastLoginAt ? (
                        <span className="text-sm">
                          {format(new Date(user.lastLoginAt), 'MMM dd, yyyy')}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Never</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-background border shadow-lg">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEditUser(user)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleResetPassword(user)}>
                            <Key className="h-4 w-4 mr-2" />
                            Reset Password
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleToggleUserStatus(user)}>
                            {user.isActive ? (
                              <>
                                <Lock className="h-4 w-4 mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <Unlock className="h-4 w-4 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          {user.id !== currentUser?.id && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowDeleteConfirm(true);
                                }}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete User
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* User Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit User' : 'Create New User'}
            </DialogTitle>
            <DialogDescription>
              {isEditing ? 'Update user information and role.' : 'Add a new user to the system.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
            
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CLIENT">Client</SelectItem>
                  <SelectItem value="AGENT">Agent</SelectItem>
                  <SelectItem value="ADMIN">Administrator</SelectItem>
                  <SelectItem value="DPO">Data Protection Officer</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {roleConfig[formData.role].description}
              </p>
            </div>
            
            {formData.role === 'CLIENT' && (
              <div>
                <Label htmlFor="clientId">Client ID (Optional)</Label>
                <Input
                  id="clientId"
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  placeholder="Enter client identifier"
                />
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="active">Active User</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowUserDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveUser}>
              {isEditing ? 'Update User' : 'Create User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete {selectedUser?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteUser}
            >
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}