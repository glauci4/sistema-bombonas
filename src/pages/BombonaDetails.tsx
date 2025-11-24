import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, MapPin, Activity, CheckCircle2, AlertCircle, Clock, 
  ArrowLeft, Calendar, Droplet, Box, Palette, History, Download,
  Edit, Trash2, Send
} from 'lucide-react';
import { toast } from 'sonner';
import QRCode from 'qrcode';
import { Bombona, BombonaStatus, BombonaFromDB, convertBombonaFromDB, TrackingHistory } from '@/services/types';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DespachoForm from '@/components/DespachoForm';
import { bombonaService } from '@/services/bombonaService'; 

const statusConfig = {
  available: {
    label: 'Disponível',
    icon: CheckCircle2,
    color: 'bg-green-100 text-green-800 border-green-200',
  },
  in_use: {
    label: 'Em Uso',
    icon: Activity,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  maintenance: {
    label: 'Manutenção',
    icon: AlertCircle,
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  washing: {
    label: 'Lavagem',
    icon: Clock,
    color: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  lost: {
    label: 'Extraviada',
    icon: AlertCircle,
    color: 'bg-red-100 text-red-800 border-red-200',
  },
};

const BombonaDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bombona, setBombona] = useState<Bombona | null>(null);
  const [history, setHistory] = useState<TrackingHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  const fetchBombonaDetails = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('bombonas')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      const convertedBombona = convertBombonaFromDB(data);
      setBombona(convertedBombona);
    } catch (error: unknown) {
      console.error('Erro ao carregar detalhes da bombona:', error);
      toast.error('Erro ao carregar detalhes da bombona');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchTrackingHistory = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('tracking_history')
        .select('*')
        .eq('bombona_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHistory(data || []);
    } catch (error: unknown) {
      console.error('Erro ao carregar histórico:', error);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchBombonaDetails();
      fetchTrackingHistory();
    }
  }, [id, fetchBombonaDetails, fetchTrackingHistory]);

  useEffect(() => {
    if (bombona) {
      generateQRCode(bombona.qr_code);
    }
  }, [bombona]);

  const generateQRCode = async (text: string) => {
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
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
    }
  };

  const downloadQRCode = () => {
    if (qrCodeUrl && bombona) {
      const link = document.createElement('a');
      link.download = `qrcode-${bombona.qr_code}.png`;
      link.href = qrCodeUrl;
      link.click();
      toast.success('QR Code baixado!');
    }
  };

  const updateBombonaStatus = async (newStatus: BombonaStatus) => {
    if (!bombona) return;

    try {
      const success = await bombonaService.updateBombonaStatus(bombona.id, newStatus);
      if (success) {
        setBombona({ ...bombona, status: newStatus });
        fetchTrackingHistory();
      }
    } catch (error: unknown) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const handleDeleteBombona = async () => {
    if (!bombona) return;

    try {
      const success = await bombonaService.deleteBombona(bombona.id);
      if (success) {
        navigate('/bombonas');
      }
    } catch (error: unknown) {
      console.error('Erro ao excluir bombona:', error);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <p className="text-center text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!bombona) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Bombona não encontrada</p>
              <Button onClick={() => navigate('/bombonas')}>
                Voltar para Bombonas
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const statusInfo = statusConfig[bombona.status];
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          
          <div className="flex gap-2">
            {/* Botão de Despacho - Só mostra se a bombona estiver disponível */}
            {bombona.status === 'available' && (
              <DespachoForm 
                bombona={bombona} 
                onDespachoCreated={fetchBombonaDetails}
              />
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/bombonas/edit/${bombona.id}`)}
              className="flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Editar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteBombona}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Excluir
            </Button>
          </div>
        </div>

        {/* Detalhes da Bombona */}
        <Card className="mb-6 shadow-card-eco">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-24 h-24 rounded-lg bg-gradient-eco flex items-center justify-center shrink-0">
                <Package className="w-12 h-12 text-primary-foreground" />
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-foreground mb-2">{bombona.name}</h1>
                    <p className="text-muted-foreground">QR Code: {bombona.qr_code}</p>
                  </div>
                  <Badge variant="outline" className={statusInfo.color}>
                    <StatusIcon className="w-4 h-4 mr-1" />
                    {statusInfo.label}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Box className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Capacidade</p>
                      <p className="font-semibold">{bombona.capacity}L</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Material</p>
                      <p className="font-semibold">{bombona.material}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Ciclos</p>
                      <p className="font-semibold">{bombona.total_cycles}</p>
                    </div>
                  </div>
                  {bombona.color && (
                    <div className="flex items-center gap-2">
                      <Palette className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Cor</p>
                        <p className="font-semibold">{bombona.color}</p>
                      </div>
                    </div>
                  )}
                </div>

                {}
                <div className="max-w-xs">
                  <Label htmlFor="status-select" className="text-sm">Alterar Status</Label>
                  <Select 
                    value={bombona.status} 
                    onValueChange={(value: BombonaStatus) => updateBombonaStatus(value)}
                  >
                    <SelectTrigger id="status-select" className="mt-1">
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
              </div>
            </div>
          </CardContent>
        </Card>

        {}
        <Tabs defaultValue="info" className="space-y-6">
          <TabsList>
            <TabsTrigger value="info">Informações</TabsTrigger>
            <TabsTrigger value="location">Localização</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
            <TabsTrigger value="qrcode">QR Code</TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <Card>
              <CardHeader>
                <CardTitle>Detalhes Completos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Tipo</p>
                    <p className="font-semibold">{bombona.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Status</p>
                    <Badge variant="outline" className={statusInfo.color}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusInfo.label}
                    </Badge>
                  </div>
                  {bombona.current_product && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Produto Atual</p>
                      <div className="flex items-center gap-2">
                        <Droplet className="w-4 h-4 text-primary" />
                        <p className="font-semibold">{bombona.current_product}</p>
                      </div>
                    </div>
                  )}
                  {bombona.last_wash_date && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Última Lavagem</p>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-accent" />
                        <p className="font-semibold">{formatDate(bombona.last_wash_date)}</p>
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Cadastrado em</p>
                    <p className="font-semibold">{formatDate(bombona.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total de Ciclos</p>
                    <p className="font-semibold">{bombona.total_cycles} ciclos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="location">
            <Card>
              <CardHeader>
                <CardTitle>Localização Atual</CardTitle>
              </CardHeader>
              <CardContent>
                {bombona.location_address ? (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-primary mt-1" />
                      <div>
                        <p className="font-semibold mb-1">Endereço</p>
                        <p className="text-muted-foreground">{bombona.location_address}</p>
                      </div>
                    </div>
                    {bombona.location_lat && bombona.location_lng && (
                      <div className="text-sm text-muted-foreground">
                        <p>Coordenadas: {bombona.location_lat}, {bombona.location_lng}</p>
                      </div>
                    )}
                    <Button onClick={() => navigate('/mapa')} variant="outline" className="w-full">
                      Ver no Mapa
                    </Button>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Localização não registrada
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Histórico de Movimentações
                </CardTitle>
              </CardHeader>
              <CardContent>
                {history.length > 0 ? (
                  <div className="space-y-4">
                    {history.map((item) => (
                      <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className={statusConfig[item.status as keyof typeof statusConfig]?.color}>
                              {statusConfig[item.status as keyof typeof statusConfig]?.label || item.status}
                            </Badge>
                            <span className="text-sm text-muted-foreground">{formatDate(item.created_at)}</span>
                          </div>
                          {item.location_address && (
                            <p className="text-sm text-muted-foreground mt-1">
                              <MapPin className="w-3 h-3 inline mr-1" />
                              {item.location_address}
                            </p>
                          )}
                          {item.notes && (
                            <p className="text-sm mt-1">{item.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhum histórico registrado
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="qrcode">
            <Card>
              <CardHeader>
                <CardTitle>QR Code da Bombona</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                {qrCodeUrl ? (
                  <>
                    <div className="p-4 bg-muted/20 rounded-lg">
                      <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64" />
                    </div>
                    <p className="text-sm text-muted-foreground">Código: {bombona.qr_code}</p>
                    <Button onClick={downloadQRCode} className="w-full max-w-xs">
                      <Download className="mr-2 h-4 w-4" />
                      Baixar QR Code
                    </Button>
                  </>
                ) : (
                  <p className="text-muted-foreground py-8">Gerando QR Code...</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default BombonaDetails;