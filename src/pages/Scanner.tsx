import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QrCode, Camera, Search, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Html5Qrcode } from 'html5-qrcode';

interface BombonaInfo {
  id: string;
  name: string;
  qr_code: string;
  capacity: number;
  material: string;
  status: string;
  current_product: string | null;
  location_address: string | null;
  total_cycles: number;
}

const Scanner = () => {
  const [qrCode, setQrCode] = useState('');
  const [bombona, setBombona] = useState<BombonaInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    try {
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        const scanner = new Html5Qrcode("qr-reader");
        scannerRef.current = scanner;
        
        await scanner.start(
          devices[0].id,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 }
          },
          (decodedText) => {
            setQrCode(decodedText);
            handleSearch(decodedText);
            stopScanning();
          },
          () => {
            // Ignore scanning errors
          }
        );
        setScanning(true);
        toast.success('Câmera ativada!');
      } else {
        toast.error('Nenhuma câmera encontrada');
      }
    } catch (error) {
      console.error('Erro ao iniciar scanner:', error);
      toast.error('Erro ao acessar câmera');
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current && scanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null;
        setScanning(false);
      } catch (error) {
        console.error('Erro ao parar scanner:', error);
      }
    }
  };

  const handleSearch = async (code?: string) => {
    const searchCode = code || qrCode;
    if (!searchCode.trim()) {
      toast.error('Digite um código QR');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bombonas')
        .select('*')
        .eq('qr_code', searchCode.trim())
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setBombona(data);
        toast.success('Bombona encontrada!');
      } else {
        toast.error('Bombona não encontrada');
        setBombona(null);
      }
    } catch (error) {
      console.error('Erro ao buscar bombona:', error);
      toast.error('Erro ao buscar bombona');
      setBombona(null);
    } finally {
      setLoading(false);
    }
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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      available: 'bg-success text-success-foreground',
      in_use: 'bg-primary text-primary-foreground',
      maintenance: 'bg-destructive text-destructive-foreground',
      washing: 'bg-accent text-accent-foreground'
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-eco shadow-eco mb-4">
              <QrCode className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Scanner QR Code</h1>
            <p className="text-muted-foreground">Escaneie ou digite o código QR para rastrear a bombona</p>
          </div>

          <Card className="shadow-card-eco mb-6">
            <CardHeader>
              <CardTitle>Buscar Bombona</CardTitle>
              <CardDescription>Digite o código QR da bombona</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="qr-code">Código QR</Label>
                <div className="flex gap-2">
                  <Input
                    id="qr-code"
                    placeholder="Ex: QR-2024-001"
                    value={qrCode}
                    onChange={(e) => setQrCode(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button onClick={() => handleSearch()} disabled={loading}>
                    <Search className="w-4 h-4 mr-2" />
                    Buscar
                  </Button>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">ou</span>
                </div>
              </div>

              {!scanning ? (
                <Button 
                  className="w-full" 
                  onClick={startScanning}
                  variant="outline"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Escanear com Câmera
                </Button>
              ) : (
                <Button 
                  className="w-full" 
                  onClick={stopScanning}
                  variant="destructive"
                >
                  <X className="mr-2 h-4 w-4" />
                  Parar Scanner
                </Button>
              )}
            </CardContent>
          </Card>

          {scanning && (
            <Card className="shadow-card-eco">
              <CardContent className="p-0">
                <div id="qr-reader" className="w-full rounded-lg overflow-hidden"></div>
              </CardContent>
            </Card>
          )}

          {bombona && (
            <Card className="shadow-card-eco animate-slide-up">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{bombona.name}</CardTitle>
                    <CardDescription>Código: {bombona.qr_code}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(bombona.status)}>
                    {getStatusLabel(bombona.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Capacidade</p>
                    <p className="text-lg font-semibold">{bombona.capacity}L</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Material</p>
                    <p className="text-lg font-semibold">{bombona.material}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Ciclos</p>
                    <p className="text-lg font-semibold">{bombona.total_cycles || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Produto Atual</p>
                    <p className="text-lg font-semibold">{bombona.current_product || 'Nenhum'}</p>
                  </div>
                </div>

                {bombona.location_address && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-1">Localização</p>
                    <p className="text-sm">{bombona.location_address}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Scanner;
