import { useParams } from "wouter";
import { ArrowLeft, Share, Download } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { calculatorConfigs } from "@/data/calculators";
import { useShare } from "@/hooks/useShare";
import { useToast } from "@/hooks/use-toast";

// Calculator Components
import EMICalculator from "@/calculators/EMICalculator";
import SIPCalculator from "@/calculators/SIPCalculator";
import LumpSumCalculator from "@/calculators/LumpSumCalculator";
import PPFCalculator from "@/calculators/PPFCalculator";
import RetirementCalculator from "@/calculators/RetirementCalculator";
import FIRECalculator from "@/calculators/FIRECalculator";
import InflationCalculator from "@/calculators/InflationCalculator";
import IncomeTaxCalculator from "@/calculators/IncomeTaxCalculator";
import HRACalculator from "@/calculators/HRACalculator";
import NetSalaryCalculator from "@/calculators/NetSalaryCalculator";
import RentVsBuyCalculator from "@/calculators/RentVsBuyCalculator";
import EmergencyFundCalculator from "@/calculators/EmergencyFundCalculator";
import NetWorthCalculator from "@/calculators/NetWorthCalculator";
import CompoundInterestCalculator from "@/calculators/CompoundInterestCalculator";
import CurrencyConverter from "@/calculators/CurrencyConverter";
import BreakEvenCalculator from "@/calculators/BreakEvenCalculator";
import LoanAmortizationCalculator from "@/calculators/LoanAmortizationCalculator";
import CarLoanCalculator from "@/calculators/CarLoanCalculator";

const calculatorComponents: Record<string, React.ComponentType<any>> = {
  "emi": EMICalculator,
  "loan-amortization": LoanAmortizationCalculator,
  "car-loan": CarLoanCalculator,
  "sip": SIPCalculator,
  "lump-sum": LumpSumCalculator,
  "ppf": PPFCalculator,
  "retirement-corpus": RetirementCalculator,
  "fire": FIRECalculator,
  "inflation-adjusted": InflationCalculator,
  "income-tax": IncomeTaxCalculator,
  "hra-exemption": HRACalculator,
  "net-salary": NetSalaryCalculator,
  "rent-vs-buy": RentVsBuyCalculator,
  "emergency-fund": EmergencyFundCalculator,
  "net-worth": NetWorthCalculator,
  "compound-interest": CompoundInterestCalculator,
  "currency-converter": CurrencyConverter,
  "break-even": BreakEvenCalculator,
};

export default function CalculatorPage() {
  const params = useParams();
  const calculatorId = params.calculatorId as string;
  const { shareResults } = useShare();
  const { toast } = useToast();

  const config = calculatorConfigs[calculatorId];
  const CalculatorComponent = calculatorComponents[calculatorId];

  if (!config || !CalculatorComponent) {
    return (
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Calculator Not Found</h1>
          <p className="text-slate-600 mb-6">The calculator you're looking for doesn't exist.</p>
          <Link href="/">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  const handleShare = async () => {
    try {
      await shareResults({
        title: config.name,
        text: `Check out this ${config.name} on MoneyMap`,
        url: window.location.href
      });
    } catch (error) {
      toast({
        title: "Share failed",
        description: "Unable to share at this time",
        variant: "destructive"
      });
    }
  };

  const handleDownload = () => {
    toast({
      title: "Download started",
      description: "Your report is being generated"
    });
  };

  return (
    <main className="flex-1 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center mb-4">
              <span className="text-3xl mr-4">{config.icon}</span>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">{config.name}</h1>
                <p className="text-slate-600 mt-1">{config.description}</p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button variant="outline" onClick={handleShare}>
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>

        {/* Calculator Component */}
        <CalculatorComponent />
      </div>
    </main>
  );
}
