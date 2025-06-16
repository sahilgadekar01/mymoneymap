import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { calculateEMI } from "@/utils/calculations";
import { formatCurrency, formatNumber } from "@/utils/formatters";
import { generatePDF, generateCSV } from "@/utils/pdfGenerator";
import CalculatorInfo from "@/components/CalculatorInfo";
import { FinTerm } from "@/components/FinancialTooltip";

const emiSchema = z.object({
  loanAmount: z.number().min(1, "Loan amount must be greater than 0"),
  interestRate: z.number().min(0.1, "Interest rate must be at least 0.1%").max(50, "Interest rate cannot exceed 50%"),
  loanTenure: z.number().min(1, "Loan tenure must be at least 1 year").max(50, "Loan tenure cannot exceed 50 years")
});

type EMIFormData = z.infer<typeof emiSchema>;

export default function EMICalculator() {
  const [result, setResult] = useState<any>(null);

  const form = useForm<EMIFormData>({
    resolver: zodResolver(emiSchema),
    defaultValues: {
      loanAmount: 1000000,
      interestRate: 8.5,
      loanTenure: 15
    }
  });

  const onSubmit = (data: EMIFormData) => {
    const calculation = calculateEMI(data.loanAmount, data.interestRate, data.loanTenure);
    setResult(calculation);
  };

  const handleReset = () => {
    form.reset();
    setResult(null);
  };

  const handleDownloadPDF = () => {
    if (!result) return;
    
    generatePDF({
      title: "EMI Calculator Report",
      inputs: form.getValues(),
      results: result,
      calculatorType: "emi"
    });
  };

  const handleDownloadCSV = () => {
    if (!result) return;
    
    generateCSV({
      title: "EMI Calculator Report",
      inputs: form.getValues(),
      results: result,
      calculatorType: "emi"
    });
  };

  return (
    <div className="space-y-8">
      {/* Calculator Information */}
      <CalculatorInfo
        description="Calculate your monthly loan payments based on loan amount, interest rate, and tenure."
        useCase="Perfect for planning home loans, car loans, or personal loans before applying."
        assumptions={[
          "Fixed interest rate throughout the loan tenure",
          "Monthly compounding of interest",
          "No prepayments or additional charges included"
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <Card>
        <CardHeader>
          <CardTitle>Loan Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="loanAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loan Amount (₹)</FormLabel>
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

              <FormField
                control={form.control}
                name="interestRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interest Rate (% per annum)</FormLabel>
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
                        placeholder="15"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex space-x-3">
                <Button type="submit" className="flex-1">
                  Calculate <FinTerm term="EMI" />
                </Button>
                <Button type="button" variant="outline" onClick={handleReset} className="flex-shrink-0">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>EMI Calculation Results</CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                <div className="result-card">
                  <div className="text-sm text-primary font-medium mb-1">Monthly EMI</div>
                  <div className="text-2xl font-bold text-primary">{formatCurrency(result.emi)}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600">Principal Amount</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {formatCurrency(form.getValues().loanAmount)}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600">Total Interest</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {formatCurrency(result.totalInterest)}
                    </p>
                  </div>
                </div>
                
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600">Total Amount Payable</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {formatCurrency(result.totalAmount)}
                  </p>
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
                <div className="text-4xl mb-4">📊</div>
                <p>Enter loan details to see your EMI calculation</p>
              </div>
            )}
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle>How EMI is Calculated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-slate-600">
                <p className="mb-2">
                  <strong>EMI Formula:</strong> EMI = [P × R × (1+R)^N] / [(1+R)^N-1]
                </p>
                <ul className="space-y-1">
                  <li><strong>P</strong> = Principal loan amount</li>
                  <li><strong>R</strong> = Monthly interest rate (Annual rate ÷ 12)</li>
                  <li><strong>N</strong> = Loan tenure in months</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
        </div>
      </div>
    </div>
  );
}
