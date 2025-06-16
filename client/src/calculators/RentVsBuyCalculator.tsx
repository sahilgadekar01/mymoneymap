import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/formatters";
import { generatePDF, generateCSV } from "@/utils/pdfGenerator";

const rentVsBuySchema = z.object({
  homePrice: z.number().min(100000, "Home price must be at least ₹1,00,000"),
  downPayment: z.number().min(0, "Down payment cannot be negative"),
  loanInterestRate: z.number().min(1, "Interest rate must be at least 1%").max(20, "Interest rate cannot exceed 20%"),
  loanTenure: z.number().min(1, "Loan tenure must be at least 1 year").max(30, "Loan tenure cannot exceed 30 years"),
  monthlyRent: z.number().min(1000, "Monthly rent must be at least ₹1,000"),
  rentIncreaseRate: z.number().min(0, "Rent increase rate cannot be negative").max(20, "Rent increase rate cannot exceed 20%"),
  homeAppreciationRate: z.number().min(0, "Home appreciation rate cannot be negative").max(20, "Home appreciation rate cannot exceed 20%"),
  investmentReturn: z.number().min(1, "Investment return must be at least 1%").max(25, "Investment return cannot exceed 25%"),
  maintenanceCost: z.number().min(0, "Maintenance cost cannot be negative"),
  analysisYears: z.number().min(1, "Analysis period must be at least 1 year").max(30, "Analysis period cannot exceed 30 years")
});

type RentVsBuyFormData = z.infer<typeof rentVsBuySchema>;

function calculateRentVsBuy(data: RentVsBuyFormData) {
  const {
    homePrice,
    downPayment,
    loanInterestRate,
    loanTenure,
    monthlyRent,
    rentIncreaseRate,
    homeAppreciationRate,
    investmentReturn,
    maintenanceCost,
    analysisYears
  } = data;

  const loanAmount = homePrice - downPayment;
  const monthlyInterestRate = loanInterestRate / (12 * 100);
  const loanMonths = loanTenure * 12;
  
  // Calculate EMI
  const emi = loanAmount > 0 ? 
    (loanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, loanMonths)) / 
    (Math.pow(1 + monthlyInterestRate, loanMonths) - 1) : 0;

  // Calculate total costs for buying
  let totalBuyingCost = downPayment;
  let totalRentCost = 0;
  let currentRent = monthlyRent;
  let currentHomeValue = homePrice;
  
  // Add stamp duty and registration (estimated 3% of home price)
  const stampDutyAndRegistration = homePrice * 0.03;
  totalBuyingCost += stampDutyAndRegistration;
  
  for (let year = 1; year <= analysisYears; year++) {
    // Buying costs
    if (year <= loanTenure) {
      totalBuyingCost += emi * 12; // EMI payments
    }
    totalBuyingCost += maintenanceCost; // Annual maintenance
    
    // Rent costs
    totalRentCost += currentRent * 12;
    currentRent *= (1 + rentIncreaseRate / 100);
    
    // Home appreciation
    currentHomeValue *= (1 + homeAppreciationRate / 100);
  }
  
  // Calculate opportunity cost of down payment invested
  const opportunityCostDownPayment = downPayment * Math.pow(1 + investmentReturn / 100, analysisYears);
  
  // Net buying cost after home sale
  const netBuyingCost = totalBuyingCost - currentHomeValue;
  
  // Total opportunity cost for buying
  const totalOpportunityCost = netBuyingCost + (opportunityCostDownPayment - downPayment);
  
  const savings = totalRentCost - Math.max(0, totalOpportunityCost);
  const recommendation = savings > 0 ? "Buy" : "Rent";
  
  return {
    totalBuyingCost: Math.round(totalBuyingCost),
    totalRentCost: Math.round(totalRentCost),
    netBuyingCost: Math.round(netBuyingCost),
    homeValueAfterYears: Math.round(currentHomeValue),
    emi: Math.round(emi),
    stampDutyAndRegistration: Math.round(stampDutyAndRegistration),
    opportunityCostDownPayment: Math.round(opportunityCostDownPayment),
    savings: Math.round(Math.abs(savings)),
    recommendation,
    breakEvenMonth: Math.round((totalBuyingCost - totalRentCost) / (currentRent - emi - maintenanceCost / 12))
  };
}

export default function RentVsBuyCalculator() {
  const [result, setResult] = useState<any>(null);

  const form = useForm<RentVsBuyFormData>({
    resolver: zodResolver(rentVsBuySchema),
    defaultValues: {
      homePrice: 5000000,
      downPayment: 1000000,
      loanInterestRate: 8.5,
      loanTenure: 20,
      monthlyRent: 25000,
      rentIncreaseRate: 5,
      homeAppreciationRate: 7,
      investmentReturn: 12,
      maintenanceCost: 60000,
      analysisYears: 10
    }
  });

  const onSubmit = (data: RentVsBuyFormData) => {
    if (data.downPayment >= data.homePrice) {
      form.setError("downPayment", {
        type: "manual",
        message: "Down payment cannot be equal to or greater than home price"
      });
      return;
    }
    
    const calculation = calculateRentVsBuy(data);
    setResult(calculation);
  };

  const handleDownloadPDF = () => {
    if (!result) return;
    generatePDF({
      title: "Rent vs Buy Calculator Report",
      inputs: form.getValues(),
      results: result,
      calculatorType: "rent-vs-buy"
    });
  };

  const handleDownloadCSV = () => {
    if (!result) return;
    generateCSV({
      title: "Rent vs Buy Calculator Report",
      inputs: form.getValues(),
      results: result,
      calculatorType: "rent-vs-buy"
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Property & Financial Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="homePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Home Price (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="5000000"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="downPayment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Down Payment (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="1000000"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="loanInterestRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loan Interest Rate (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="8.5"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="loanTenure"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loan Tenure (Years)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="20"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="monthlyRent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Monthly Rent (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="25000"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="rentIncreaseRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Annual Rent Increase (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="5"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="homeAppreciationRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Home Appreciation (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="7"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="investmentReturn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Investment Return (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="12"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maintenanceCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Annual Maintenance (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="60000"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="analysisYears"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Analysis Period (Years)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="10"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Compare Rent vs Buy
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                <div className={`result-card ${result.recommendation === 'Buy' ? 'from-green-50 to-green-100 border-green-200' : 'from-blue-50 to-blue-100 border-blue-200'}`}>
                  <div className="text-sm font-medium mb-1">Recommendation</div>
                  <div className={`text-2xl font-bold ${result.recommendation === 'Buy' ? 'text-green-700' : 'text-blue-700'}`}>
                    {result.recommendation === 'Buy' ? '🏠 Buy the Home' : '🏠 Keep Renting'}
                  </div>
                  <div className="text-sm mt-1">
                    Potential savings: {formatCurrency(result.savings)}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-600">Total Cost of Buying</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(result.totalBuyingCost)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-600">Total Cost of Renting</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(result.totalRentCost)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-blue-700">Monthly EMI</span>
                    <span className="font-semibold text-blue-900">{formatCurrency(result.emi)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-green-700">Home Value After {form.getValues().analysisYears} Years</span>
                    <span className="font-semibold text-green-900">{formatCurrency(result.homeValueAfterYears)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                    <span className="text-orange-700">Stamp Duty & Registration</span>
                    <span className="font-semibold text-orange-900">{formatCurrency(result.stampDutyAndRegistration)}</span>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h4 className="font-semibold text-yellow-900 mb-2">Key Assumptions:</h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• Stamp duty & registration: 3% of home price</li>
                    <li>• Down payment invested at {form.getValues().investmentReturn}% return</li>
                    <li>• Home appreciates at {form.getValues().homeAppreciationRate}% annually</li>
                    <li>• Rent increases at {form.getValues().rentIncreaseRate}% annually</li>
                  </ul>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button onClick={handleDownloadPDF} variant="outline" className="flex-1">
                    Download PDF
                  </Button>
                  <Button onClick={handleDownloadCSV} variant="outline" className="flex-1">
                    Download CSV
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <div className="text-4xl mb-4">🏘️</div>
                <p>Enter property details to compare renting vs buying</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
