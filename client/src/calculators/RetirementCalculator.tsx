import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { calculateRetirementCorpus } from "@/utils/calculations";
import { formatCurrency } from "@/utils/formatters";
import { generatePDF, generateCSV } from "@/utils/pdfGenerator";

const retirementSchema = z.object({
  currentAge: z.number().min(18, "Age must be at least 18").max(65, "Age must be less than 65"),
  retirementAge: z.number().min(50, "Retirement age must be at least 50").max(75, "Retirement age cannot exceed 75"),
  monthlyExpenses: z.number().min(10000, "Monthly expenses must be at least ₹10,000"),
  inflationRate: z.number().min(2, "Inflation rate must be at least 2%").max(15, "Inflation rate cannot exceed 15%"),
  expectedReturn: z.number().min(5, "Expected return must be at least 5%").max(25, "Expected return cannot exceed 25%")
});

type RetirementFormData = z.infer<typeof retirementSchema>;

export default function RetirementCalculator() {
  const [result, setResult] = useState<any>(null);

  const form = useForm<RetirementFormData>({
    resolver: zodResolver(retirementSchema),
    defaultValues: {
      currentAge: 30,
      retirementAge: 60,
      monthlyExpenses: 50000,
      inflationRate: 6,
      expectedReturn: 12
    }
  });

  const onSubmit = (data: RetirementFormData) => {
    if (data.retirementAge <= data.currentAge) {
      form.setError("retirementAge", { 
        type: "manual", 
        message: "Retirement age must be greater than current age" 
      });
      return;
    }
    
    const calculation = calculateRetirementCorpus(
      data.currentAge,
      data.retirementAge,
      data.monthlyExpenses,
      data.inflationRate,
      data.expectedReturn
    );
    setResult(calculation);
  };

  const handleDownloadPDF = () => {
    if (!result) return;
    generatePDF({
      title: "Retirement Calculator Report",
      inputs: form.getValues(),
      results: result,
      calculatorType: "retirement"
    });
  };

  const handleDownloadCSV = () => {
    if (!result) return;
    generateCSV({
      title: "Retirement Calculator Report",
      inputs: form.getValues(),
      results: result,
      calculatorType: "retirement"
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Retirement Planning Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="currentAge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Age</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="30"
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
                  name="retirementAge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Retirement Age</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="60"
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
                name="monthlyExpenses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Monthly Expenses (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="50000"
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
                name="inflationRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Inflation Rate (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="6"
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
                name="expectedReturn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Return on Investment (%)</FormLabel>
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

              <Button type="submit" className="w-full">
                Calculate Retirement Corpus
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Retirement Planning Results</CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                <div className="result-card">
                  <div className="text-sm text-primary font-medium mb-1">Required Retirement Corpus</div>
                  <div className="text-2xl font-bold text-primary">{formatCurrency(result.requiredCorpus)}</div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-600">Monthly SIP Required</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(result.monthlySIP)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                    <span className="text-orange-700">Future Monthly Expenses</span>
                    <span className="font-semibold text-orange-900">{formatCurrency(result.futureMonthlyExpenses)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-blue-700">Current Monthly Expenses</span>
                    <span className="font-semibold text-blue-900">{formatCurrency(result.currentValue)}</span>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> This calculation uses the 4% withdrawal rule, assuming you can 
                    safely withdraw 4% of your corpus annually during retirement.
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
                <div className="text-4xl mb-4">🏖️</div>
                <p>Enter your details to plan for retirement</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
