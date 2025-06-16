import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { calculateCompoundInterest } from "@/utils/calculations";
import { formatCurrency } from "@/utils/formatters";
import { generatePDF, generateCSV } from "@/utils/pdfGenerator";

const compoundInterestSchema = z.object({
  principal: z.number().min(1, "Principal amount must be greater than 0"),
  interestRate: z.number().min(0.1, "Interest rate must be at least 0.1%").max(50, "Interest rate cannot exceed 50%"),
  timePeriod: z.number().min(1, "Time period must be at least 1 year").max(50, "Time period cannot exceed 50 years"),
  compoundingFrequency: z.number().min(1, "Compounding frequency must be at least 1"),
  additionalContribution: z.number().min(0, "Additional contribution cannot be negative")
});

type CompoundInterestFormData = z.infer<typeof compoundInterestSchema>;

function calculateExtendedCompoundInterest(data: CompoundInterestFormData) {
  const { principal, interestRate, timePeriod, compoundingFrequency, additionalContribution } = data;
  
  // Calculate compound interest for principal
  const basicCompound = calculateCompoundInterest(principal, interestRate, timePeriod, compoundingFrequency);
  
  // Calculate future value with additional contributions (annuity)
  let totalFutureValue = basicCompound.amount;
  let totalContributions = principal;
  
  if (additionalContribution > 0) {
    // Calculate future value of annuity
    const monthlyRate = interestRate / (100 * 12);
    const months = timePeriod * 12;
    
    if (monthlyRate > 0) {
      const annuityFV = additionalContribution * 
        (((Math.pow(1 + monthlyRate, months)) - 1) / monthlyRate);
      totalFutureValue += annuityFV;
    } else {
      totalFutureValue += additionalContribution * months;
    }
    
    totalContributions += additionalContribution * 12 * timePeriod;
  }
  
  const totalInterest = totalFutureValue - totalContributions;
  const effectiveRate = Math.pow(totalFutureValue / totalContributions, 1 / timePeriod) - 1;
  
  return {
    ...basicCompound,
    totalFutureValue: Math.round(totalFutureValue),
    totalContributions: Math.round(totalContributions),
    totalInterest: Math.round(totalInterest),
    effectiveAnnualRate: Math.round(effectiveRate * 10000) / 100,
    monthlyContribution: additionalContribution
  };
}

export default function CompoundInterestCalculator() {
  const [result, setResult] = useState<any>(null);

  const form = useForm<CompoundInterestFormData>({
    resolver: zodResolver(compoundInterestSchema),
    defaultValues: {
      principal: 100000,
      interestRate: 12,
      timePeriod: 10,
      compoundingFrequency: 12,
      additionalContribution: 0
    }
  });

  const onSubmit = (data: CompoundInterestFormData) => {
    const calculation = calculateExtendedCompoundInterest(data);
    setResult(calculation);
  };

  const handleDownloadPDF = () => {
    if (!result) return;
    generatePDF({
      title: "Compound Interest Calculator Report",
      inputs: form.getValues(),
      results: result,
      calculatorType: "compound-interest"
    });
  };

  const handleDownloadCSV = () => {
    if (!result) return;
    generateCSV({
      title: "Compound Interest Calculator Report",
      inputs: form.getValues(),
      results: result,
      calculatorType: "compound-interest"
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Investment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="principal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Principal Amount (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="100000"
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
                    <FormLabel>Annual Interest Rate (%)</FormLabel>
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
                name="timePeriod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Investment Period (Years)</FormLabel>
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

              <FormField
                control={form.control}
                name="compoundingFrequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Compounding Frequency</FormLabel>
                    <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={field.value.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select compounding frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">Annually</SelectItem>
                        <SelectItem value="2">Semi-annually</SelectItem>
                        <SelectItem value="4">Quarterly</SelectItem>
                        <SelectItem value="12">Monthly</SelectItem>
                        <SelectItem value="365">Daily</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="additionalContribution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Additional Contribution (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-sm text-slate-500">Optional: Regular monthly investments</p>
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Calculate Compound Interest
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Compound Interest Results</CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                <div className="result-card">
                  <div className="text-sm text-primary font-medium mb-1">Final Amount</div>
                  <div className="text-2xl font-bold text-primary">
                    {formatCurrency(result.totalFutureValue || result.amount)}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-600">Initial Principal</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(result.principal)}</span>
                  </div>
                  {result.monthlyContribution > 0 && (
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-blue-700">Total Contributions</span>
                      <span className="font-semibold text-blue-900">{formatCurrency(result.totalContributions - result.principal)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-green-700">Total Interest Earned</span>
                    <span className="font-semibold text-green-900">
                      {formatCurrency(result.totalInterest || result.interest)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="text-purple-700">Effective Annual Rate</span>
                    <span className="font-semibold text-purple-900">
                      {result.effectiveAnnualRate ? `${result.effectiveAnnualRate}%` : `${form.getValues().interestRate}%`}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h4 className="font-semibold text-yellow-900 mb-2">Power of Compounding:</h4>
                  <p className="text-sm text-yellow-800">
                    Your money grew by{' '}
                    <strong>
                      {Math.round(((result.totalFutureValue || result.amount) / result.principal - 1) * 100)}%
                    </strong>{' '}
                    over {form.getValues().timePeriod} years through compound interest!
                  </p>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibred text-blue-900 mb-2">Compound Interest Formula:</h4>
                  <div className="text-sm text-blue-800">
                    <p><strong>A = P(1 + r/n)^(nt)</strong></p>
                    <ul className="mt-2 space-y-1">
                      <li>A = Final amount</li>
                      <li>P = Principal ({formatCurrency(result.principal)})</li>
                      <li>r = Annual interest rate ({form.getValues().interestRate}%)</li>
                      <li>n = Compounding frequency ({form.getValues().compoundingFrequency})</li>
                      <li>t = Time period ({form.getValues().timePeriod} years)</li>
                    </ul>
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
                <div className="text-4xl mb-4">⚡</div>
                <p>Enter investment details to see the power of compounding</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
