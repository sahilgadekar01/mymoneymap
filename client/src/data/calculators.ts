export interface Calculator {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface CalculatorCategory {
  id: string;
  name: string;
  icon: string;
  calculators: Calculator[];
}

export const calculatorCategories: CalculatorCategory[] = [
  {
    id: "loan-debt",
    name: "Loan & Debt Management",
    icon: "💳",
    calculators: [
      {
        id: "emi",
        name: "EMI Calculator",
        icon: "🏠",
        description: "Calculate your monthly loan payments"
      },
      {
        id: "loan-amortization",
        name: "Loan Amortization Schedule",
        icon: "📊",
        description: "View detailed payment breakdown over time"
      },
      {
        id: "car-loan",
        name: "Car Loan Calculator",
        icon: "🚗",
        description: "Calculate car loan EMI and total cost"
      }
    ]
  },
  {
    id: "investment-wealth",
    name: "Investment & Wealth Creation",
    icon: "📈",
    calculators: [
      {
        id: "sip",
        name: "SIP Calculator",
        icon: "💹",
        description: "Calculate SIP returns and plan investments"
      },
      {
        id: "lump-sum",
        name: "Lump Sum Investment Calculator",
        icon: "💎",
        description: "Calculate one-time investment returns"
      },
      {
        id: "ppf",
        name: "PPF Calculator",
        icon: "🏛️",
        description: "Calculate PPF maturity amount and returns"
      }
    ]
  },
  {
    id: "retirement-planning",
    name: "Retirement & Long-Term Planning",
    icon: "🏖️",
    calculators: [
      {
        id: "retirement-corpus",
        name: "Retirement Corpus Calculator",
        icon: "🏖️",
        description: "Plan your retirement corpus"
      },
      {
        id: "fire",
        name: "FIRE Calculator",
        icon: "🔥",
        description: "Calculate Financial Independence Retire Early"
      },
      {
        id: "inflation-adjusted",
        name: "Inflation-Adjusted Future Value",
        icon: "📊",
        description: "Calculate future value with inflation"
      }
    ]
  },
  {
    id: "tax-income",
    name: "Tax & Income Planning",
    icon: "🧾",
    calculators: [
      {
        id: "income-tax",
        name: "Income Tax Calculator",
        icon: "💼",
        description: "Calculate income tax liability"
      },
      {
        id: "hra-exemption",
        name: "HRA Exemption Calculator",
        icon: "🏠",
        description: "Calculate HRA tax exemption"
      },
      {
        id: "net-salary",
        name: "Net Salary Calculator",
        icon: "💰",
        description: "Calculate take-home salary"
      }
    ]
  },
  {
    id: "smart-life-tools",
    name: "Smart Life Decision Tools",
    icon: "🧠",
    calculators: [
      {
        id: "rent-vs-buy",
        name: "Rent vs Buy Calculator",
        icon: "🏘️",
        description: "Compare renting vs buying a home"
      },
      {
        id: "emergency-fund",
        name: "Emergency Fund Calculator",
        icon: "🆘",
        description: "Calculate emergency fund requirement"
      },
      {
        id: "net-worth",
        name: "Net Worth Tracker",
        icon: "💯",
        description: "Track your net worth over time"
      }
    ]
  },
  {
    id: "utility-tools",
    name: "Other Utility Tools",
    icon: "🔧",
    calculators: [
      {
        id: "compound-interest",
        name: "Compound Interest Calculator",
        icon: "⚡",
        description: "Calculate compound interest growth"
      },
      {
        id: "currency-converter",
        name: "Currency Converter",
        icon: "💱",
        description: "Convert between currencies"
      },
      {
        id: "break-even",
        name: "Break-even Point Calculator",
        icon: "⚖️",
        description: "Calculate business break-even point"
      }
    ]
  }
];

export const calculatorConfigs: Record<string, Calculator> = calculatorCategories
  .flatMap(category => category.calculators)
  .reduce((acc, calculator) => {
    acc[calculator.id] = calculator;
    return acc;
  }, {} as Record<string, Calculator>);
