import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface FinancialTooltipProps {
  term: string;
  definition: string;
  children?: React.ReactNode;
}

const financialGlossary: Record<string, string> = {
  "SIP": "Systematic Investment Plan - A method of investing a fixed sum regularly in mutual funds",
  "EMI": "Equated Monthly Installment - Fixed payment amount made by a borrower to a lender",
  "Corpus": "The principal amount or initial investment that generates returns",
  "Amortization": "The process of paying off debt through regular payments over a specified period",
  "FIRE": "Financial Independence, Retire Early - A movement focused on saving and investing to retire early",
  "PPF": "Public Provident Fund - A long-term savings scheme backed by the Government of India",
  "HRA": "House Rent Allowance - A component of salary paid to employees for accommodation expenses",
  "Compound Interest": "Interest calculated on the initial principal and accumulated interest from previous periods",
  "Principal": "The original amount of money borrowed or invested, excluding interest",
  "Tenure": "The time period for which a loan is taken or an investment is made",
  "Interest Rate": "The percentage charged on the principal amount by a lender to a borrower",
  "Maturity Amount": "The total amount received at the end of an investment period",
  "Inflation": "The rate at which the general level of prices for goods and services rises",
  "Net Worth": "Total assets minus total liabilities of an individual or entity",
  "Liquidity": "How easily an asset can be converted into cash without affecting its market price",
  "Depreciation": "The decrease in value of an asset over time due to wear, tear, or obsolescence",
  "Break-even": "The point at which total revenues equal total costs, resulting in no profit or loss",
  "Tax Exemption": "Income or transactions that are free from tax liability",
  "Mutual Fund": "A pooled investment vehicle that collects money from many investors",
  "Equity": "Ownership interest in a company or property after debts have been paid"
};

export function FinancialTooltip({ term, definition, children }: FinancialTooltipProps) {
  const tooltipDefinition = definition || financialGlossary[term] || `Learn more about ${term}`;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children || (
            <span className="inline-flex items-center space-x-1 text-primary cursor-help border-b border-dotted border-primary">
              <span>{term}</span>
              <HelpCircle className="w-3 h-3" />
            </span>
          )}
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-sm">{tooltipDefinition}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Helper component for quick financial term tooltips
export function FinTerm({ term }: { term: string }) {
  return <FinancialTooltip term={term} definition={financialGlossary[term]} />;
}