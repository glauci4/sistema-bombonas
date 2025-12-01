import { useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete (L.Icon.Default.prototype as unknown as { _getIconUrl: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const bombonaIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3502/3502681.png',
  iconSize: [25, 25],
  iconAnchor: [12, 12],
});

const truckIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3097/3097136.png',
  iconSize: [25, 25],
  iconAnchor: [12, 12],
});

interface InteractiveMapProps {
  bombonas: Array<{
    id: string;
    name: string;
    status: string;
    location_address: string | null;
    location_lat: number | null;
    location_lng: number | null;
  }>;
  despachos?: Array<{
    id: string;
    bombona_id: string;
    destino: string;
    endereco: string;
    latitude: number;
    longitude: number;
    data_despacho: string;
    responsavel: string;
    status: string;
    bombona_nome: string;
    bombona_status: string;
  }>;
}

const InteractiveMap = ({ bombonas, despachos = [] }: InteractiveMapProps) => {
  const mapRef = useRef<L.Map | null>(null);

  const defaultCenter: [number, number] = [-23.5505, -46.6333];

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      available: 'Disponível',
      in_use: 'Em Uso',
      maintenance: 'Manutenção',
      washing: 'Lavagem',
      lost: 'Extraviada',
      em_transito: 'Em Trânsito',
      entregue: 'Entregue',
      pendente: 'Pendente'
    };
    return labels[status] || status;
  };

  const validBombonas = bombonas.filter(
    (bombona) => bombona.location_lat !== null && bombona.location_lng !== null
  ) as Array<{
    id: string;
    name: string;
    status: string;
    location_address: string | null;
    location_lat: number;
    location_lng: number;
  }>;

  const validDespachos = despachos.filter(
    (despacho) => despacho.latitude !== null && despacho.longitude !== null
  );

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={defaultCenter}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Bombona markers */}
        {validBombonas.map((bombona) => (
          <Marker
            key={`bombona-${bombona.id}`}
            position={[bombona.location_lat, bombona.location_lng]}
            icon={bombonaIcon}
          >
            <Popup>
              <div className="text-sm min-w-[200px]">
                <div className="font-bold text-base mb-2">Bombona: {bombona.name}</div>
                <div className="space-y-1">
                  <div><strong>Status:</strong> {getStatusLabel(bombona.status)}</div>
                  <div><strong>Endereço:</strong> {bombona.location_address || 'Não informado'}</div>
                  <div><strong>Coordenadas:</strong> {bombona.location_lat.toFixed(4)}, {bombona.location_lng.toFixed(4)}</div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Despacho markers */}
        {validDespachos.map((despacho) => (
          <Marker
            key={`despacho-${despacho.id}`}
            position={[despacho.latitude, despacho.longitude]}
            icon={truckIcon}
          >
            <Popup>
              <div className="text-sm min-w-[250px]">
                <div className="font-bold text-base mb-2">Despacho Ativo</div>
                <div className="space-y-1">
                  <div><strong>Destino:</strong> {despacho.destino}</div>
                  <div><strong>Bombona:</strong> {despacho.bombona_nome}</div>
                  <div><strong>Status:</strong> {getStatusLabel(despacho.status)}</div>
                  <div><strong>Responsável:</strong> {despacho.responsavel}</div>
                  <div><strong>Endereço:</strong> {despacho.endereco}</div>
                  <div><strong>Data:</strong> {new Date(despacho.data_despacho).toLocaleDateString('pt-BR')}</div>
                  <div><strong>Coordenadas:</strong> {despacho.latitude.toFixed(4)}, {despacho.longitude.toFixed(4)}</div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default InteractiveMap;