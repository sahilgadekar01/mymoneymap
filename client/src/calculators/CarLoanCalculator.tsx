import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { calculateEMI } from "@/utils/calculations";
import { formatCurrency, formatNumber } from "@/utils/formatters";
import { generatePDF, generateCSV } from "@/utils/pdfGenerator";

const carLoanSchema = z.object({
  carPrice: z.number().min(100000, "Car price must be at least ₹1,00,000"),
  downPayment: z.number().min(0, "Down payment cannot be negative"),
  tradeInValue: z.number().min(0, "Trade-in value cannot be negative"),
  interestRate: z.number().min(0.1, "Interest rate must be at least 0.1%").max(30, "Interest rate cannot exceed 30%"),
  loanTenure: z.number().min(1, "Loan tenure must be at least 1 year").max(7, "Car loan tenure cannot exceed 7 years"),
  processingFee: z.number().min(0, "Processing fee cannot be negative"),
  insurance: z.number().min(0, "Insurance amount cannot be negative"),
  extendedWarranty: z.number().min(0, "Extended warranty cost cannot be negative"),
  carType: z.enum(["new", "used"])
});

type CarLoanFormData = z.infer<typeof carLoanSchema>;

function calculateCarLoan(data: CarLoanFormData) {
  const {
    carPrice,
    downPayment,
    tradeInValue,
    interestRate,
    loanTenure,
    processingFee,
    insurance,
    extendedWarranty,
    carType
  } = data;

  // Calculate net car price after down payment and trade-in
  const netFinancedAmount = carPrice - downPayment - tradeInValue + insurance + extendedWarranty;
  
  // Calculate loan amount (net financed amount + processing fee)
  const loanAmount = Math.max(0, netFinancedAmount + processingFee);
  
  // Calculate EMI if loan amount > 0
  let emiResult = { emi: 0, totalAmount: 0, totalInterest: 0 };
  if (loanAmount > 0) {
    emiResult = calculateEMI(loanAmount, interestRate, loanTenure);
  }
  
  // Calculate total cost of ownership
  const totalCostOfOwnership = carPrice + processingFee + insurance + extendedWarranty + emiResult.totalInterest;
  
  // Calculate upfront costs
  const upfrontCosts = downPayment + processingFee + insurance + (carType === 'new' ? extendedWarranty : 0);
  
  // Calculate depreciation (rough estimate)
  const depreciationRate = carType === 'new' ? 0.15 : 0.10; // 15% for new, 10% for used
  const estimatedValueAfterLoan = carPrice * Math.pow(1 - depreciationRate, loanTenure);
  
  return {
    loanAmount: Math.round(loanAmount),
    emi: Math.round(emiResult.emi),
    totalInterest: Math.round(emiResult.totalInterest),
    totalAmountPayable: Math.round(emiResult.totalAmount),
    netFinancedAmount: Math.round(netFinancedAmount),
    upfrontCosts: Math.round(upfrontCosts),
    totalCostOfOwnership: Math.round(totalCostOfOwnership),
    estimatedValueAfterLoan: Math.round(estimatedValueAfterLoan),
    totalDepreciation: Math.round(carPrice - estimatedValueAfterLoan),
    loanToValueRatio: carPrice > 0 ? Math.round((loanAmount / carPrice) * 100) : 0,
    effectiveInterestRate: loanAmount > 0 ? Math.round(((emiResult.totalInterest / loanAmount) / loanTenure) * 10000) / 100 : 0
  };
}

export default function CarLoanCalculator() {
  const [result, setResult] = useState<any>(null);

  const form = useForm<CarLoanFormData>({
    resolver: zodResolver(carLoanSchema),
    defaultValues: {
      carPrice: 1200000,
      downPayment: 240000,
      tradeInValue: 0,
      interestRate: 9.5,
      loanTenure: 5,
      processingFee: 15000,
      insurance: 45000,
      extendedWarranty: 25000,
      carType: "new"
    }
  });

  const onSubmit = (data: CarLoanFormData) => {
    if (data.downPayment + data.tradeInValue >= data.carPrice) {
      form.setError("downPayment", {
        type: "manual",
        message: "Down payment + trade-in value cannot exceed car price"
      });
      return;
    }
    
    const calculation = calculateCarLoan(data);
    setResult(calculation);
  };

  const handleDownloadPDF = () => {
    if (!result) return;
    
    generatePDF({
      title: "Car Loan Calculator Report",
      inputs: form.getValues(),
      results: result,
      calculatorType: "car-loan"
    });
  };

  const handleDownloadCSV = () => {
    if (!result) return;
    
    generateCSV({
      title: "Car Loan Calculator Report",
      inputs: form.getValues(),
      results: result,
      calculatorType: "car-loan"
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Input Form */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Car & Loan Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="carType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Car Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select car type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="new">New Car</SelectItem>
                          <SelectItem value="used">Used Car</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="carPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Car Price (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="1200000"
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
                    name="downPayment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Down Payment (₹)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="240000"
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
                    name="tradeInValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Trade-in Value (₹)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
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
                    name="interestRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Interest Rate (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="9.5"
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
                            placeholder="5"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" className="w-full">
                  Calculate Car Loan
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Costs</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="processingFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Processing Fee (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="15000"
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
                  name="insurance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Insurance Premium (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="45000"
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
                  name="extendedWarranty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Extended Warranty (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="25000"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-sm text-slate-500">Optional for used cars</p>
                    </FormItem>
                  )}
                />
              </div>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Car Loan Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                <div className="result-card">
                  <div className="text-sm text-primary font-medium mb-1">Monthly EMI</div>
                  <div className="text-2xl font-bold text-primary">{formatCurrency(result.emi)}</div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-600">Loan Amount</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(result.loanAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-blue-700">Upfront Costs</span>
                    <span className="font-semibold text-blue-900">{formatCurrency(result.upfrontCosts)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="text-red-700">Total Interest</span>
                    <span className="font-semibold text-red-900">{formatCurrency(result.totalInterest)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <span className="text-yellow-700">Total Amount Payable</span>
                    <span className="font-semibold text-yellow-900">{formatCurrency(result.totalAmountPayable)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-green-700">Total Cost of Ownership</span>
                    <span className="font-semibold text-green-900">{formatCurrency(result.totalCostOfOwnership)}</span>
                  </div>
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
                <div className="text-4xl mb-4">🚗</div>
                <p>Enter car details to calculate your loan EMI</p>
              </div>
            )}
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Financial Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded-lg text-center">
                    <div className="text-xs text-slate-600">Loan-to-Value Ratio</div>
                    <div className="font-semibold text-slate-900">{result.loanToValueRatio}%</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg text-center">
                    <div className="text-xs text-slate-600">Effective Interest Rate</div>
                    <div className="font-semibold text-slate-900">{result.effectiveInterestRate}%</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                    <span className="text-orange-700">Estimated Value After Loan</span>
                    <span className="font-semibold text-orange-900">{formatCurrency(result.estimatedValueAfterLoan)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="text-red-700">Estimated Depreciation</span>
                    <span className="font-semibold text-red-900">{formatCurrency(result.totalDepreciation)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Cost Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Car Price</span>
                  <span>{formatCurrency(form.getValues().carPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Down Payment</span>
                  <span className="text-green-600">-{formatCurrency(form.getValues().downPayment)}</span>
                </div>
                {form.getValues().tradeInValue > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Trade-in Value</span>
                    <span className="text-green-600">-{formatCurrency(form.getValues().tradeInValue)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Processing Fee</span>
                  <span className="text-red-600">+{formatCurrency(form.getValues().processingFee)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Insurance</span>
                  <span className="text-red-600">+{formatCurrency(form.getValues().insurance)}</span>
                </div>
                {form.getValues().extendedWarranty > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Extended Warranty</span>
                    <span className="text-red-600">+{formatCurrency(form.getValues().extendedWarranty)}</span>
                  </div>
                )}
                <hr className="my-2" />
                <div className="flex justify-between font-semibold">
                  <span>Net Financed Amount</span>
                  <span>{formatCurrency(result.netFinancedAmount)}</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">💡 Money-Saving Tips:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Higher down payment reduces EMI and total interest</li>
                  <li>• Compare interest rates from multiple lenders</li>
                  <li>• Consider shorter tenure to save on total interest</li>
                  <li>• Negotiate processing fees and insurance premiums</li>
                  <li>• Pre-closure can save significant interest amount</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
