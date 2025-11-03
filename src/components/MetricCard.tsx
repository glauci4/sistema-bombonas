import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  trend?: "up" | "down";
  trendValue?: string;
  variant?: "default" | "success" | "primary";
}

const MetricCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  trendValue,
  variant = "default" 
}: MetricCardProps) => {
  const variantStyles = {
    default: "bg-gradient-card",
    success: "bg-gradient-to-br from-success/10 to-success/5 border-success/20",
    primary: "bg-gradient-eco border-primary/20",
  };

  const iconBgStyles = {
    default: "bg-muted",
    success: "bg-success/20",
    primary: "bg-primary/20",
  };

  const iconStyles = {
    default: "text-foreground",
    success: "text-success-foreground",
    primary: "text-primary",
  };

  const textStyles = {
    default: "text-foreground",
    success: "text-success-foreground",
    primary: "text-primary-foreground",
  };

  return (
    <Card className={`${variantStyles[variant]} border shadow-card-eco hover:shadow-eco transition-all duration-300 hover:scale-105 animate-slide-up`}>
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className={`text-sm font-medium ${variant === 'primary' ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
              {title}
            </p>
            <h3 className={`text-3xl font-bold mt-2 ${textStyles[variant]}`}>
              {value}
            </h3>
            <p className={`text-sm mt-1 ${variant === 'primary' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
              {subtitle}
            </p>
            {trend && trendValue && (
              <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${
                trend === 'up' ? 'text-success' : 'text-destructive'
              }`}>
                <span>{trend === 'up' ? '↑' : '↓'}</span>
                <span>{trendValue}</span>
              </div>
            )}
          </div>
          <div className={`w-12 h-12 rounded-lg ${iconBgStyles[variant]} flex items-center justify-center`}>
            <Icon className={`w-6 h-6 ${iconStyles[variant]}`} />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MetricCard;
