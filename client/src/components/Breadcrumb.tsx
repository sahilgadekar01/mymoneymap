import { Link, useLocation } from "wouter";
import { ChevronRight, Home } from "lucide-react";
import { calculatorConfigs, calculatorCategories } from "@/data/calculators";

export default function Breadcrumb() {
  const [location] = useLocation();
  
  // Generate breadcrumb based on current route
  const generateBreadcrumb = () => {
    const segments = location.split('/').filter(Boolean);
    
    if (location === '/') {
      return [{ label: 'Home', href: '/', isActive: true }];
    }
    
    if (segments[0] === 'calculator' && segments[1]) {
      const calculatorId = segments[1];
      const calculator = calculatorConfigs[calculatorId];
      
      if (calculator) {
        // Find the category for this calculator
        const category = calculatorCategories.find((cat: any) => 
          cat.calculators.some((calc: any) => calc.id === calculatorId)
        );
        
        return [
          { label: 'Home', href: '/', isActive: false },
          { label: category?.name || 'Calculator', href: '/', isActive: false },
          { label: calculator.name, href: location, isActive: true }
        ];
      }
    }
    
    // Default fallback
    return [
      { label: 'Home', href: '/', isActive: false },
      { label: 'Calculator', href: location, isActive: true }
    ];
  };
  
  const breadcrumbItems = generateBreadcrumb();
  
  return (
    <nav className="flex items-center space-x-2 text-sm text-slate-600 mb-6">
      {breadcrumbItems.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          {index === 0 && <Home className="w-4 h-4" />}
          
          {item.isActive ? (
            <span className="text-slate-900 font-medium">{item.label}</span>
          ) : (
            <Link href={item.href} className="hover:text-primary transition-colors">
              {item.label}
            </Link>
          )}
          
          {index < breadcrumbItems.length - 1 && (
            <ChevronRight className="w-4 h-4 text-slate-400" />
          )}
        </div>
      ))}
    </nav>
  );
}