import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Package, MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface Bombona {
  id: string;
  name: string;
  qr_code: string;
  capacity: number;
  material: string;
  type: string;
  status: string;
  color: string | null;
  location_address: string | null;
  current_product: string | null;
  total_cycles: number;
}

const Bombonas = () => {
  const [bombonas, setBombonas] = useState<Bombona[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [newBombona, setNewBombona] = useState({
    name: '',
    qr_code: '',
    capacity: 50,
    material: 'PEAD',
    type: 'bombona',
    color: '',
    status: 'available'
  });

  useEffect(() => {
    fetchBombonas();
  }, []);

  const fetchBombonas = async () => {
    try {
      const { data, error } = await supabase
        .from('bombonas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBombonas(data || []);
    } catch (error: any) {
      toast.error('Erro ao carregar bombonas');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBombona = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('bombonas')
        .insert([{
          ...newBombona,
          owner_id: user.id
        }]);

      if (error) throw error;

      toast.success('Bombona cadastrada com sucesso!');
      setIsDialogOpen(false);
      setNewBombona({
        name: '',
        qr_code: '',
        capacity: 50,
        material: 'PEAD',
        type: 'bombona',
        color: '',
        status: 'available'
      });
      fetchBombonas();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao cadastrar bombona');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      available: 'bg-success text-success-foreground',
      in_use: 'bg-primary text-primary-foreground',
      maintenance: 'bg-destructive text-destructive-foreground',
      washing: 'bg-accent text-accent-foreground'
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      available: 'Disponível',
      in_use: 'Em Uso',
      maintenance: 'Manutenção',
      washing: 'Lavagem'
    };
    return labels[status] || status;
  };

  const filteredBombonas = bombonas.filter(b =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.qr_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Gestão de Bombonas</h1>
            <p className="text-muted-foreground">Cadastre e gerencie suas bombonas</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Nova Bombona
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Cadastrar Nova Bombona</DialogTitle>
                <DialogDescription>Preencha os dados da nova bombona</DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleCreateBombona} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome/Identificação</Label>
                  <Input
                    id="name"
                    value={newBombona.name}
                    onChange={(e) => setNewBombona({...newBombona, name: e.target.value})}
                    placeholder="Ex: Bombona 001"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="qr_code">Código QR</Label>
                  <Input
                    id="qr_code"
                    value={newBombona.qr_code}
                    onChange={(e) => setNewBombona({...newBombona, qr_code: e.target.value})}
                    placeholder="Ex: QR-2024-001"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacidade (L)</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={newBombona.capacity}
                    onChange={(e) => setNewBombona({...newBombona, capacity: parseInt(e.target.value)})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="material">Material</Label>
                  <Select 
                    value={newBombona.material} 
                    onValueChange={(value) => setNewBombona({...newBombona, material: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PEAD">PEAD</SelectItem>
                      <SelectItem value="PP">PP</SelectItem>
                      <SelectItem value="PVC">PVC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color">Cor</Label>
                  <Input
                    id="color"
                    value={newBombona.color}
                    onChange={(e) => setNewBombona({...newBombona, color: e.target.value})}
                    placeholder="Ex: Azul"
                  />
                </div>

                <Button type="submit" className="w-full">
                  Cadastrar Bombona
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou código QR..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        ) : filteredBombonas.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'Nenhuma bombona encontrada' : 'Nenhuma bombona cadastrada'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBombonas.map((bombona) => (
              <Card key={bombona.id} className="hover:shadow-card-eco transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{bombona.name}</CardTitle>
                    <Badge className={getStatusColor(bombona.status)}>
                      {getStatusLabel(bombona.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">QR:</span>
                    <span className="font-mono">{bombona.qr_code}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Capacidade:</span>
                      <p className="font-semibold">{bombona.capacity}L</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Material:</span>
                      <p className="font-semibold">{bombona.material}</p>
                    </div>
                  </div>

                  {bombona.location_address && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <span className="text-muted-foreground">{bombona.location_address}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t">
                    <span className="text-xs text-muted-foreground">
                      Ciclos: {bombona.total_cycles || 0}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Bombonas;
