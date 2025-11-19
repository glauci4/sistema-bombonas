import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowRight, Leaf, Package, BarChart3 } from "lucide-react";
import heroBackground from "@/assets/hero-background.jpg";

const HeroSection = () => {
  const navigate = useNavigate();
  
  return (
    <section className="relative min-h-[500px] overflow-hidden rounded-2xl my-8 shadow-eco">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBackground})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-transparent"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-16 lg:py-24">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-background/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-background/30">
            <Leaf className="w-4 h-4 text-background" />
            <span className="text-sm font-medium text-background">
              Economia Circular em Ação
            </span>
          </div>

          <h1 className="text-4xl lg:text-6xl font-bold text-background mb-6 leading-tight">
            Gestão Inteligente de
            <span className="block bg-gradient-to-r from-success to-accent bg-clip-text text-transparent">
              Bombonas Sustentáveis
            </span>
          </h1>

          <p className="text-lg text-background/95 mb-8 leading-relaxed font-medium">
            Rastreamento em tempo real, matriz de compatibilidade e analytics avançados 
            para maximizar a economia circular e reduzir o impacto ambiental.
          </p>

          <div className="flex flex-wrap gap-4">
            <Button 
              size="lg" 
              className="bg-background text-primary hover:bg-background/90 shadow-glow font-semibold"
              onClick={() => navigate('/bombonas')}
            >
              Começar Agora
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>

            {/* Botão com cor → transparente no hover */}
            <Button 
              size="lg" 
              variant="outline"
              className="
                border-white 
                text-white 
                bg-white/40 
                backdrop-blur-sm
                hover:bg-white/0
                transition-all duration-500 ease-in-out
                font-semibold
              "
              onClick={() => navigate('/demo')}
            >
              Acessar Funcionalidades
            </Button>
          </div>

          <div className="flex flex-wrap gap-4 mt-12">
            <div className="flex items-center gap-2 bg-background/20 backdrop-blur-sm rounded-full px-4 py-2 border border-background/30">
              <Package className="w-4 h-4 text-background" />
              <span className="text-sm font-medium text-background">5.000+ Ativos</span>
            </div>
            <div className="flex items-center gap-2 bg-background/20 backdrop-blur-sm rounded-full px-4 py-2 border border-background/30">
              <BarChart3 className="w-4 h-4 text-background" />
              <span className="text-sm font-medium text-background">98% Sustentável</span>
            </div>
            <div className="flex items-center gap-2 bg-background/20 backdrop-blur-sm rounded-full px-4 py-2 border border-background/30">
              <Leaf className="w-4 h-4 text-background" />
              <span className="text-sm font-medium text-background">-40% CO₂</span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 right-0 w-64 h-64 bg-success/20 rounded-full blur-3xl"></div>
      <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-accent/20 rounded-full blur-2xl animate-float"></div>
    </section>
  );
};

export default HeroSection;
