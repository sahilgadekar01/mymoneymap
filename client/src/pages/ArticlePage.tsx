import { useRoute } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const articles: Record<string, any> = {
  "compound-interest": {
    title: "What is Compound Interest?",
    readTime: "5 min read",
    content: `
      <h2>Understanding Compound Interest</h2>
      <p>Compound interest is the interest you earn on both your original money and on the interest you keep accumulating. It's often called "interest on interest" and can significantly boost your investment returns over time.</p>
      
      <h3>How Compound Interest Works</h3>
      <p>When you invest money, you earn interest on your principal amount. With compound interest, that interest gets added to your principal, and you start earning interest on the new, larger amount.</p>
      
      <h3>The Power of Time</h3>
      <p>The longer you leave your money invested, the more powerful compound interest becomes. This is why starting early is so important for building wealth.</p>
      
      <h3>Example</h3>
      <p>If you invest ₹10,000 at 8% annual interest:</p>
      <ul>
        <li>After 1 year: ₹10,800</li>
        <li>After 5 years: ₹14,693</li>
        <li>After 10 years: ₹21,589</li>
        <li>After 20 years: ₹46,610</li>
      </ul>
      
      <h3>Key Takeaways</h3>
      <ul>
        <li>Start investing as early as possible</li>
        <li>Let your investments grow without withdrawing</li>
        <li>Higher interest rates compound faster</li>
        <li>Time is your greatest asset in wealth building</li>
      </ul>
    `
  },
  "fire-planning": {
    title: "How to Plan for FIRE (Financial Independence, Retire Early)",
    readTime: "8 min read",
    content: `
      <h2>What is FIRE?</h2>
      <p>FIRE stands for Financial Independence, Retire Early. It's a movement focused on extreme saving and investment to allow retirement much earlier than traditional retirement age.</p>
      
      <h3>The 25x Rule</h3>
      <p>The basic principle is to save 25 times your annual expenses. This allows you to withdraw 4% annually without depleting your principal.</p>
      
      <h3>Types of FIRE</h3>
      <ul>
        <li><strong>Lean FIRE:</strong> Minimalist lifestyle with lower expenses</li>
        <li><strong>Fat FIRE:</strong> Higher expense lifestyle requiring more savings</li>
        <li><strong>Barista FIRE:</strong> Partial financial independence with some work income</li>
      </ul>
      
      <h3>Steps to Achieve FIRE</h3>
      <ol>
        <li>Calculate your annual expenses</li>
        <li>Multiply by 25 to get your FIRE number</li>
        <li>Increase your savings rate (aim for 50%+)</li>
        <li>Invest in low-cost index funds</li>
        <li>Reduce expenses without sacrificing happiness</li>
        <li>Track progress regularly</li>
      </ol>
      
      <h3>FIRE Calculator Tips</h3>
      <p>Use our FIRE calculator to:</p>
      <ul>
        <li>Determine your FIRE number</li>
        <li>Calculate how long it will take</li>
        <li>Adjust savings rate to reach goals faster</li>
        <li>Account for inflation</li>
      </ul>
    `
  },
  "sip-benefits": {
    title: "Benefits of Systematic Investment Plans (SIP)",
    readTime: "6 min read",
    content: `
      <h2>What is SIP?</h2>
      <p>A Systematic Investment Plan (SIP) allows you to invest a fixed amount regularly in mutual funds, typically monthly. It's one of the most effective ways to build wealth over time.</p>
      
      <h3>Key Benefits of SIP</h3>
      
      <h4>1. Rupee Cost Averaging</h4>
      <p>When markets are high, you buy fewer units. When markets are low, you buy more units. This averages out your purchase cost over time.</p>
      
      <h4>2. Power of Compounding</h4>
      <p>Regular investments benefit from compound growth, where your returns generate their own returns.</p>
      
      <h4>3. Disciplined Investing</h4>
      <p>SIP enforces regular investing habits and removes emotional decision-making from the process.</p>
      
      <h4>4. Flexibility</h4>
      <p>You can start with as little as ₹500 per month and increase, decrease, or stop anytime.</p>
      
      <h3>SIP vs Lump Sum</h3>
      <p>While lump sum can work well in rising markets, SIP provides:</p>
      <ul>
        <li>Lower risk through diversification over time</li>
        <li>Easier on monthly budget</li>
        <li>Less stress about market timing</li>
      </ul>
      
      <h3>How to Start SIP</h3>
      <ol>
        <li>Choose your investment goal</li>
        <li>Select appropriate mutual funds</li>
        <li>Decide on monthly amount</li>
        <li>Set up auto-debit</li>
        <li>Review annually</li>
      </ol>
    `
  },
  "emi-management": {
    title: "Smart EMI Management Strategies",
    readTime: "7 min read",
    content: `
      <h2>Understanding EMI</h2>
      <p>Equated Monthly Installment (EMI) is the fixed amount you pay monthly towards loan repayment. Smart EMI management can save you significant money over time.</p>
      
      <h3>EMI Optimization Strategies</h3>
      
      <h4>1. Make Prepayments</h4>
      <p>Any extra payment towards principal reduces interest burden significantly:</p>
      <ul>
        <li>Use bonuses and windfalls for prepayment</li>
        <li>Even small prepayments make a big difference</li>
        <li>Prepay early in the loan tenure for maximum benefit</li>
      </ul>
      
      <h4>2. Choose Shorter Tenure</h4>
      <p>Higher EMI but lower total interest:</p>
      <ul>
        <li>20-year loan vs 30-year can save lakhs in interest</li>
        <li>Assess your income stability before choosing</li>
      </ul>
      
      <h4>3. Balance Transfer</h4>
      <p>Switch to lenders offering lower interest rates:</p>
      <ul>
        <li>Compare offers regularly</li>
        <li>Factor in processing fees</li>
        <li>Negotiate with current lender first</li>
      </ul>
      
      <h3>EMI to Income Ratio</h3>
      <p>Maintain healthy ratios:</p>
      <ul>
        <li>Total EMIs should not exceed 40% of income</li>
        <li>Home loan EMI: Maximum 30% of income</li>
        <li>Other loans: Maximum 10% of income</li>
      </ul>
      
      <h3>Emergency Planning</h3>
      <ul>
        <li>Maintain 6-month EMI reserve</li>
        <li>Consider loan insurance</li>
        <li>Know your lender's policies on payment delays</li>
      </ul>
      
      <h3>Use Our EMI Calculator</h3>
      <p>Plan better with our calculator to:</p>
      <ul>
        <li>Compare different loan scenarios</li>
        <li>Calculate prepayment benefits</li>
        <li>Optimize loan tenure</li>
      </ul>
    `
  }
};

export default function ArticlePage() {
  const [, params] = useRoute("/learn/:articleId");
  const articleId = params?.articleId;
  const article = articleId ? articles[articleId] : null;

  if (!article) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Article Not Found</h1>
        <p className="text-slate-600 mb-6">The article you're looking for doesn't exist.</p>
        <Link href="/learn">
          <Button>Back to Learn</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Navigation */}
      <Link href="/learn">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Learn
        </Button>
      </Link>

      {/* Article Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-slate-900">{article.title}</h1>
        <div className="flex items-center justify-center space-x-2 text-slate-600">
          <Clock className="w-4 h-4" />
          <span>{article.readTime}</span>
        </div>
      </div>

      {/* Article Content */}
      <Card>
        <CardContent className="p-8">
          <div 
            className="prose prose-slate max-w-none"
            dangerouslySetInnerHTML={{ __html: article.content }}
            style={{
              lineHeight: '1.7',
              fontSize: '16px'
            }}
          />
        </CardContent>
      </Card>

      {/* Call to Action */}
      <div className="bg-primary/5 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Ready to Calculate?</h3>
        <p className="text-slate-600 mb-4">Apply what you've learned with our financial calculators.</p>
        <Link href="/">
          <Button>Explore Calculators</Button>
        </Link>
      </div>
    </div>
  );
}