import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { relatoriosService } from '@/services/relatoriosService';
import { toast } from 'sonner';
import { FileText, TrendingUp, Download } from 'lucide-react';

export const RelatoriosPanel = () => {
  const [loading, setLoading] = useState(false);
  const [mesSelecionado, setMesSelecionado] = useState<number>(new Date().getMonth() + 1);
  const [anoSelecionado, setAnoSelecionado] = useState<number>(new Date().getFullYear());

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const anos = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const handleGerarMensal = async () => {
    setLoading(true);
    try {
      const nomeArquivo = await relatoriosService.gerarRelatorioMensal(mesSelecionado, anoSelecionado);
      toast.success('Relatório gerado com sucesso!', {
        description: `Arquivo: ${nomeArquivo}`
      });
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast.error('Erro ao gerar relatório', {
        description: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGerarAnual = async () => {
    setLoading(true);
    try {
      const nomeArquivo = await relatoriosService.gerarRelatorioAnual(anoSelecionado);
      toast.success('Relatório anual gerado com sucesso!', {
        description: `Arquivo: ${nomeArquivo}`
      });
    } catch (error) {
      console.error('Erro ao gerar relatório anual:', error);
      toast.error('Erro ao gerar relatório anual', {
        description: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Relatórios BonnaTech</h1>
        <p className="text-muted-foreground">
          Gere relatórios profissionais sobre bombonas sustentáveis
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Relatório Mensal */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle>Relatório Mensal</CardTitle>
            </div>
            <CardDescription>
              Indicadores e métricas do mês selecionado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Mês</label>
              <Select
                value={mesSelecionado.toString()}
                onValueChange={(value) => setMesSelecionado(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {meses.map((mes, index) => (
                    <SelectItem key={index} value={(index + 1).toString()}>
                      {mes}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ano</label>
              <Select
                value={anoSelecionado.toString()}
                onValueChange={(value) => setAnoSelecionado(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {anos.map((ano) => (
                    <SelectItem key={ano} value={ano.toString()}>
                      {ano}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleGerarMensal}
              disabled={loading}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Gerar PDF Mensal
            </Button>
          </CardContent>
        </Card>

        {/* Relatório Anual */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle>Relatório Anual</CardTitle>
            </div>
            <CardDescription>
              Evolução e análise de todo o ano
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Ano</label>
              <Select
                value={anoSelecionado.toString()}
                onValueChange={(value) => setAnoSelecionado(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {anos.map((ano) => (
                    <SelectItem key={ano} value={ano.toString()}>
                      {ano}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="h-[68px]" /> {/* Spacer para alinhar botões */}

            <Button
              onClick={handleGerarAnual}
              disabled={loading}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Gerar PDF Anual
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Informações adicionais */}
      <Card>
        <CardHeader>
          <CardTitle>Sobre os Relatórios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold text-primary">✓ Design Profissional</h4>
              <p className="text-muted-foreground">
                Visual clean e moderno com identidade BonnaTech
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-primary">✓ Dados Completos</h4>
              <p className="text-muted-foreground">
                Métricas detalhadas e análises consolidadas
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-primary">✓ Fácil Download</h4>
              <p className="text-muted-foreground">
                Geração rápida em formato PDF para compartilhamento
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};