import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { calculatorCategories } from "@/data/calculators";
import { Button } from "@/components/ui/button";
import { X, BookOpen } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">💰</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">MoneyMap</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <div className="space-y-6">
            {calculatorCategories.map((category) => (
              <div key={category.id}>
                <h3 className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  {category.icon} {category.name}
                </h3>
                <div className="space-y-1">
                  {category.calculators.map((calculator) => {
                    const isActive = location === `/calculator/${calculator.id}`;
                    return (
                      <Link
                        key={calculator.id}
                        href={`/calculator/${calculator.id}`}
                        onClick={onClose}
                        className={cn(
                          "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-slate-700 hover:bg-slate-100"
                        )}
                      >
                        <span className="mr-3">{calculator.icon}</span>
                        {calculator.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Learn Section */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <h3 className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                📚 Learn
              </h3>
              <Link
                href="/learn"
                onClick={onClose}
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  location === '/learn' || location.startsWith('/learn/')
                    ? "bg-primary/10 text-primary"
                    : "text-slate-700 hover:bg-slate-100"
                )}
              >
                <BookOpen className="w-4 h-4 mr-3" />
                Financial Education
              </Link>
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
}
