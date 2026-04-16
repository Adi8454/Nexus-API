import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { projectApi, adminApi } from '@/src/lib/api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Power, Trash2, Edit3, Briefcase, BarChart3, Users } from 'lucide-react';

interface DashboardProps {
  user: any;
  onLogout: () => void;
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [projects, setProjects] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [formData, setFormData] = useState({ title: '', description: '', status: 'pending' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const projectsData = await projectApi.getAll();
      setProjects(projectsData);
      
      if (user.role === 'admin') {
        const statsData = await adminApi.getStats();
        setStats(statsData);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProject) {
        await projectApi.update(editingProject.id, formData);
        toast.success('Project updated');
      } else {
        await projectApi.create(formData);
        toast.success('Project created');
      }
      setIsDialogOpen(false);
      setEditingProject(null);
      setFormData({ title: '', description: '', status: 'pending' });
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await projectApi.delete(id);
      toast.success('Project deleted');
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const openEditDialog = (project: any) => {
    setEditingProject(project);
    setFormData({ title: project.title, description: project.description, status: project.status });
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      {/* Header */}
      <header className="border-b bg-white border-zinc-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md bg-white/80">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-black rounded flex items-center justify-center text-white font-bold">N</div>
          <h2 className="text-xl font-bold tracking-tight">Nexus API</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end mr-2">
            <span className="text-sm font-medium">{user.email}</span>
            <Badge variant={user.role === 'admin' ? "destructive" : "secondary"} className="text-[10px] h-4 uppercase">{user.role}</Badge>
          </div>
          <Button variant="ghost" size="icon" onClick={onLogout} className="text-zinc-500 hover:text-red-600">
            <Power className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full space-y-8">
        {/* Admin Stats */}
        {user.role === 'admin' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-zinc-200">
              <CardContent className="pt-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Total Users</p>
                  <h3 className="text-3xl font-bold mt-1">{stats.totalUsers}</h3>
                </div>
                <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-500">
                  <Users className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-zinc-200">
              <CardContent className="pt-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Globally Tracked Projects</p>
                  <h3 className="text-3xl font-bold mt-1">{stats.totalProjects}</h3>
                </div>
                <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-500">
                  <BarChart3 className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Projects Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <p className="text-zinc-500">Manage and track your development lifecycles.</p>
          </div>
          <Button onClick={() => { setEditingProject(null); setFormData({ title: '', description: '', status: 'pending' }); setIsDialogOpen(true); }} className="bg-black hover:bg-zinc-800 flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Project
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-20">
            <div className="w-8 h-8 border-4 border-zinc-200 border-t-black rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {projects.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center p-20 border-2 border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
                  <Briefcase className="w-12 h-12 text-zinc-300 mb-4" />
                  <p className="text-zinc-500 font-medium italic serif">No projects found. Create your first one!</p>
                </div>
              ) : (
                projects.map((project) => (
                  <motion.div
                    key={project.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <Card className="h-full border-zinc-200 hover:border-zinc-300 transition-colors cursor-default group overflow-hidden">
                      <div className={`h-1 w-full ${
                        project.status === 'completed' ? 'bg-green-500' : 
                        project.status === 'in-progress' ? 'bg-blue-500' : 'bg-zinc-300'
                      }`} />
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <Badge variant="outline" className="text-[10px] font-mono text-zinc-400">ID #{project.id}</Badge>
                          <Badge 
                            variant="secondary" 
                            className={`text-[10px] uppercase ${
                              project.status === 'completed' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 
                              project.status === 'in-progress' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                            }`}
                          >
                            {project.status}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl group-hover:text-black transition-colors">{project.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-zinc-600 line-clamp-3 min-h-[3rem] font-sans leading-relaxed">{project.description || 'No description provided.'}</p>
                      </CardContent>
                      <CardFooter className="pt-4 border-t border-zinc-50 flex justify-between items-center">
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {new Date(project.created_at).toLocaleDateString()}
                        </span>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(project)} className="w-8 h-8 rounded-full hover:bg-zinc-100">
                            <Edit3 className="w-4 h-4 text-zinc-500" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(project.id)} className="w-8 h-8 rounded-full hover:bg-red-50 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Project Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingProject ? 'Edit Project' : 'Add New Project'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateOrUpdate} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                value={formData.title} 
                onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                placeholder="Database Migration API" 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea 
                id="description"
                className="flex min-h-[80px] w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.description} 
                onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                placeholder="High-level description of the project..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="flex h-10 w-full items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-black hover:bg-zinc-800">
                {editingProject ? 'Save Changes' : 'Create Project'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
