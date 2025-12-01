import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Package, MapPin, Download, Edit, Trash2, Send } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import QRCode from 'qrcode';
import { useNavigate } from 'react-router-dom';
import { Bombona, BombonaStatus } from '@/services/types';
import { bombonaService } from '@/services/bombonaService';
import DespachoForm from '@/components/DespachoForm';

const Bombonas = () => {
  const [bombonas, setBombonas] = useState<Bombona[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [selectedBombonaForDespacho, setSelectedBombonaForDespacho] = useState<Bombona | null>(null);
  const [isDespachoDialogOpen, setIsDespachoDialogOpen] = useState(false);
  const navigate = useNavigate();
  
  const [newBombona, setNewBombona] = useState({
    name: '',
    qr_code: '',
    capacity: 50,
    material: 'PEAD',
    type: 'bombona',
    color: '',
    status: 'available' as BombonaStatus
  });

  useEffect(() => {
    fetchBombonas();
  }, []);

  const fetchBombonas = async () => {
    try {
      const bombonasData = await bombonaService.fetchBombonas();
      setBombonas(bombonasData);
    } catch (error) {
      console.error('Erro ao carregar bombonas:', error);
      toast.error('Erro ao carregar bombonas');
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async (text: string) => {
    if (!text.trim()) {
      toast.error('Digite um código QR primeiro');
      return;
    }
    try {
      const url = await QRCode.toDataURL(text, {
        width: 300,
        margin: 2,
        color: {
          dark: '#22c55e',
          light: '#ffffff'
        }
      });
      setQrCodeUrl(url);
      toast.success('QR Code gerado!');
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      toast.error('Erro ao gerar QR Code');
    }
  };

  const downloadQRCode = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.download = `qrcode-${newBombona.qr_code}.png`;
      link.href = qrCodeUrl;
      link.click();
      toast.success('QR Code baixado!');
    }
  };

  const handleCreateBombona = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const bombona = await bombonaService.createBombona(newBombona);
      
      if (bombona) {
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
        setQrCodeUrl('');
        fetchBombonas();
      }
    } catch (error: unknown) {
      console.error('Erro ao cadastrar bombona:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Erro ao cadastrar bombona');
      }
    }
  };

  const updateBombonaStatus = async (bombonaId: string, newStatus: BombonaStatus) => {
    try {
      const updatedBombona = await bombonaService.updateBombonaStatus(bombonaId, newStatus);
      if (updatedBombona) {
        setBombonas(prev => prev.map(b => 
          b.id === bombonaId ? { ...b, status: newStatus } : b
        ));
        toast.success('Status atualizado com sucesso!');
      }
    } catch (error: unknown) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const handleDeleteBombona = async (bombonaId: string) => {
    try {
      const success = await bombonaService.deleteBombona(bombonaId);
      if (success) {
        fetchBombonas();
        toast.success('Bombona excluída com sucesso!');
      }
    } catch (error: unknown) {
      console.error('Erro ao excluir bombona:', error);
      toast.error('Erro ao excluir bombona');
    }
  };

  const handleDespachoClick = (bombona: Bombona) => {
    setSelectedBombonaForDespacho(bombona);
    setIsDespachoDialogOpen(true);
  };

  const handleDespachoCreated = async () => {
    setIsDespachoDialogOpen(false);
    setSelectedBombonaForDespacho(null);
    
    try {
      if (selectedBombonaForDespacho) {
        await bombonaService.updateBombonaStatus(selectedBombonaForDespacho.id, 'in_use');
      }
      
      fetchBombonas();
      toast.success('Despacho criado com sucesso! A bombona foi marcada como "Em Uso".');
    } catch (error) {
      console.error('Erro ao atualizar status da bombona:', error);
      toast.error('Despacho criado, mas houve um erro ao atualizar o status da bombona.');
    }
  };

  const getStatusColor = (status: BombonaStatus) => {
    const colors: Record<BombonaStatus, string> = {
      available: 'bg-green-100 text-green-800 border-green-200',
      in_use: 'bg-blue-100 text-blue-800 border-blue-200',
      maintenance: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      washing: 'bg-purple-100 text-purple-800 border-purple-200',
      lost: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusLabel = (status: BombonaStatus) => {
    const labels: Record<BombonaStatus, string> = {
      available: 'Disponível',
      in_use: 'Em Uso',
      maintenance: 'Manutenção',
      washing: 'Lavagem',
      lost: 'Extraviada'
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
                  <div className="flex gap-2">
                    <Input
                      id="qr_code"
                      value={newBombona.qr_code}
                      onChange={(e) => setNewBombona({...newBombona, qr_code: e.target.value})}
                      placeholder="Ex: QR-2024-001"
                      required
                    />
                    <Button 
                      type="button" 
                      onClick={() => generateQRCode(newBombona.qr_code)}
                      disabled={!newBombona.qr_code}
                    >
                      Gerar QR
                    </Button>
                  </div>
                  {qrCodeUrl && (
                    <div className="mt-4 p-4 border rounded-lg bg-muted/20">
                      <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48 mx-auto" />
                      <Button 
                        type="button" 
                        onClick={downloadQRCode}
                        className="w-full mt-2"
                        variant="outline"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Baixar QR Code
                      </Button>
                    </div>
                  )}
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
            <p className="text-muted-foreground">Carregando bombonas...</p>
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
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{bombona.name}</CardTitle>
                    <Badge variant="outline" className={getStatusColor(bombona.status)}>
                      {getStatusLabel(bombona.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
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

                  {/* Seletor de Status */}
                  <div className="space-y-2">
                    <Label htmlFor={`status-${bombona.id}`} className="text-xs">Alterar Status</Label>
                    <Select 
                      value={bombona.status} 
                      onValueChange={(value: BombonaStatus) => updateBombonaStatus(bombona.id, value)}
                    >
                      <SelectTrigger id={`status-${bombona.id}`} className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Disponível</SelectItem>
                        <SelectItem value="in_use">Em Uso</SelectItem>
                        <SelectItem value="maintenance">Manutenção</SelectItem>
                        <SelectItem value="washing">Lavagem</SelectItem>
                        <SelectItem value="lost">Extraviada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {bombona.location_address && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <span className="text-muted-foreground">{bombona.location_address}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-xs text-muted-foreground">
                      Ciclos: {bombona.total_cycles || 0}
                    </span>
                    <div className="flex gap-2">
                      {/* BOTÃO DE DESPACHO - Mostra para bombonas que não estão extraviadas ou em manutenção */}
                      {bombona.status !== 'lost' && bombona.status !== 'maintenance' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDespachoClick(bombona)}
                          className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800"
                          title="Despachar"
                        >
                          <Send className="w-3 h-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/bombonas/edit/${bombona.id}`)}
                        className="h-8 w-8 p-0"
                        title="Editar"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteBombona(bombona.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        title="Excluir"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Dialog para Despacho */}
        <Dialog open={isDespachoDialogOpen} onOpenChange={setIsDespachoDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Despacho</DialogTitle>
              <DialogDescription>
                Preencha os dados para despachar a bombona {selectedBombonaForDespacho?.name}
              </DialogDescription>
            </DialogHeader>
            {selectedBombonaForDespacho && (
              <DespachoForm 
                bombona={selectedBombonaForDespacho} 
                onDespachoCreated={handleDespachoCreated}
              />
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Bombonas;