import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculatorCategories } from "@/data/calculators";

export default function Dashboard() {
  const featuredCalculators = [
    {
      id: "emi",
      name: "EMI Calculator",
      icon: "🏠",
      description: "Calculate your monthly loan payments for home loans, personal loans, and more.",
      tag: "Most Popular"
    },
    {
      id: "sip",
      name: "SIP Calculator",
      icon: "💹",
      description: "Plan your systematic investment plan and see how small amounts grow over time.",
      tag: "Trending"
    },
    {
      id: "retirement-corpus",
      name: "Retirement Planning",
      icon: "🏖️",
      description: "Calculate how much you need to save for a comfortable retirement.",
      tag: "Plan Ahead"
    }
  ];

  return (
    <main className="flex-1 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome to MoneyMap</h1>
          <p className="text-lg text-slate-600">
            Your comprehensive financial planning toolkit. Choose a calculator from the sidebar to get started.
          </p>
        </div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {featuredCalculators.map((calculator) => (
            <Link key={calculator.id} href={`/calculator/${calculator.id}`}>
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <span className="text-2xl mr-3">{calculator.icon}</span>
                    <h3 className="text-lg font-semibold text-slate-900">{calculator.name}</h3>
                  </div>
                  <p className="text-slate-600 text-sm mb-4">{calculator.description}</p>
                  <div className="text-primary text-sm font-medium">{calculator.tag} →</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Categories Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {calculatorCategories.map((category, index) => {
            const gradientClasses = [
              "from-blue-50 to-blue-100 border-blue-200",
              "from-green-50 to-green-100 border-green-200",
              "from-purple-50 to-purple-100 border-purple-200",
              "from-orange-50 to-orange-100 border-orange-200",
              "from-teal-50 to-teal-100 border-teal-200",
              "from-gray-50 to-gray-100 border-gray-200"
            ];
            
            const textClasses = [
              "text-blue-900",
              "text-green-900",
              "text-purple-900",
              "text-orange-900",
              "text-teal-900",
              "text-gray-900"
            ];

            const descClasses = [
              "text-blue-700",
              "text-green-700",
              "text-purple-700",
              "text-orange-700",
              "text-teal-700",
              "text-gray-700"
            ];

            const detailClasses = [
              "text-blue-600",
              "text-green-600",
              "text-purple-600",
              "text-orange-600",
              "text-teal-600",
              "text-gray-600"
            ];

            return (
              <div
                key={category.id}
                className={`bg-gradient-to-br ${gradientClasses[index]} rounded-xl p-6 border`}
              >
                <h3 className={`text-lg font-semibold ${textClasses[index]} mb-2`}>
                  {category.icon} {category.name}
                </h3>
                <p className={`${descClasses[index]} text-sm mb-3`}>
                  {category.calculators.length} calculators available
                </p>
                <p className={`${detailClasses[index]} text-sm`}>
                  {category.calculators.slice(0, 3).map(calc => calc.name.split(' ')[0]).join(', ')}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
