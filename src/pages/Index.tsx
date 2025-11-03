import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import MetricCard from "@/components/MetricCard";
import AssetOverview from "@/components/AssetOverview";
import { Package, Recycle, TrendingUp, Leaf, Droplet, Factory } from "lucide-react";
import { Card } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 lg:px-8 pb-16">
        <HeroSection />

        {/* Sustainability Impact Banner */}
        <Card className="bg-gradient-eco shadow-eco border-primary/20 mb-8 animate-slide-up">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <Leaf className="w-5 h-5 text-primary-foreground animate-pulse-glow" />
              </div>
              <h2 className="text-xl font-bold text-primary-foreground">
                Impacto de Sustentabilidade em Tempo Real
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-foreground mb-1">15.847</div>
                <div className="text-sm text-primary-foreground/80">Embalagens Economizadas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-foreground mb-1">-42%</div>
                <div className="text-sm text-primary-foreground/80">Redução de CO₂</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-foreground mb-1">328</div>
                <div className="text-sm text-primary-foreground/80">Árvores Preservadas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-foreground mb-1">98.5%</div>
                <div className="text-sm text-primary-foreground/80">Taxa de Reutilização</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <MetricCard
            title="Ativos Totais"
            value="5.247"
            subtitle="Bombonas e containers ativos"
            icon={Package}
            trend="up"
            trendValue="+12% este mês"
            variant="default"
          />
          <MetricCard
            title="Taxa de Reutilização"
            value="98.5%"
            subtitle="Eficiência operacional"
            icon={Recycle}
            trend="up"
            trendValue="+5.2% vs. trimestre"
            variant="success"
          />
          <MetricCard
            title="Economia Circular"
            value="R$ 2.8M"
            subtitle="Economia acumulada em 2024"
            icon={TrendingUp}
            trend="up"
            trendValue="+18% vs. 2023"
            variant="primary"
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <MetricCard
            title="Produtos Rastreados"
            value="847"
            subtitle="Catálogo BioAccess"
            icon={Droplet}
            variant="default"
          />
          <MetricCard
            title="Lavagens Concluídas"
            value="3.542"
            subtitle="Este mês"
            icon={Factory}
            trend="up"
            trendValue="+8%"
            variant="default"
          />
          <MetricCard
            title="Compatibilidade"
            value="100%"
            subtitle="Matriz validada"
            icon={Leaf}
            variant="success"
          />
        </div>

        {/* Asset Overview */}
        <AssetOverview />
      </main>
    </div>
  );
};

export default Index;
