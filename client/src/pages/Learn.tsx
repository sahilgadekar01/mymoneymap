import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Clock, TrendingUp, Target, Calculator, DollarSign } from "lucide-react";

const articles = [
  {
    id: "compound-interest",
    title: "What is Compound Interest?",
    description: "Learn how compound interest can make your money grow exponentially over time.",
    readTime: "5 min read",
    icon: TrendingUp,
    category: "Basics"
  },
  {
    id: "fire-planning",
    title: "How to Plan for FIRE (Financial Independence, Retire Early)",
    description: "A comprehensive guide to achieving financial independence and early retirement.",
    readTime: "8 min read",
    icon: Target,
    category: "Planning"
  },
  {
    id: "sip-benefits",
    title: "Benefits of Systematic Investment Plans (SIP)",
    description: "Understand why SIP is considered one of the best investment strategies.",
    readTime: "6 min read",
    icon: Calculator,
    category: "Investment"
  },
  {
    id: "emi-management",
    title: "Smart EMI Management Strategies",
    description: "Tips to manage your loan EMIs effectively and save on interest.",
    readTime: "7 min read",
    icon: DollarSign,
    category: "Loans"
  }
];

export default function Learn() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Learn Financial Planning</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Master the fundamentals of personal finance with our educational articles and guides.
        </p>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {articles.map((article) => {
          const IconComponent = article.icon;
          return (
            <Card key={article.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href={`/learn/${article.id}`}>
                <CardHeader>
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <IconComponent className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                          {article.category}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{article.readTime}</span>
                        </span>
                      </div>
                      <CardTitle className="text-lg">{article.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">{article.description}</p>
                </CardContent>
              </Link>
            </Card>
          );
        })}
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-primary/5 to-blue-50 rounded-lg p-8 text-center">
        <BookOpen className="w-12 h-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Ready to Start Calculating?</h2>
        <p className="text-slate-600 mb-6">
          Put your knowledge into practice with our comprehensive financial calculators.
        </p>
        <Link href="/">
          <div className="inline-flex items-center space-x-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors">
            <Calculator className="w-5 h-5" />
            <span>Explore Calculators</span>
          </div>
        </Link>
      </div>
    </div>
  );
}