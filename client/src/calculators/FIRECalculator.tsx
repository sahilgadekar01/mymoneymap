import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { calculateFIRE } from "@/utils/calculations";
import { formatCurrency } from "@/utils/formatters";
import { generatePDF, generateCSV } from "@/utils/pdfGenerator";

const fireSchema = z.object({
  currentAge: z.number().min(18, "Age must be at least 18").max(60, "Age must be less than 60"),
  currentSavings: z.number().min(0, "Current savings cannot be negative"),
  monthlyExpenses: z.number().min(5000, "Monthly expenses must be at least ₹5,000"),
  monthlySavings: z.number().min(1000, "Monthly savings must be at least ₹1,000"),
  expectedReturn: z.number().min(5, "Expected return must be at least 5%").max(25, "Expected return cannot exceed 25%")
});

type FIREFormData = z.infer<typeof fireSchema>;

export default function FIRECalculator() {
  const [result, setResult] = useState<any>(null);

  const form = useForm<FIREFormData>({
    resolver: zodResolver(fireSchema),
    defaultValues: {
      currentAge: 25,
      currentSavings: 0,
      monthlyExpenses: 40000,
      monthlySavings: 20000,
      expectedReturn: 12
    }
  });

  const onSubmit = (data: FIREFormData) => {
    if (data.monthlySavings >= data.monthlyExpenses) {
      form.setError("monthlySavings", { 
        type: "manual", 
        message: "Monthly savings should be less than monthly expenses for realistic planning" 
      });
    }
    
    const calculation = calculateFIRE(
      data.currentAge,
      data.currentSavings,
      data.monthlyExpenses,
      data.monthlySavings,
      data.expectedReturn
    );
    setResult(calculation);
  };

  const handleDownloadPDF = () => {
    if (!result) return;
    generatePDF({
      title: "FIRE Calculator Report",
      inputs: form.getValues(),
      results: result,
      calculatorType: "fire"
    });
  };

  const handleDownloadCSV = () => {
    if (!result) return;
    generateCSV({
      title: "FIRE Calculator Report",
      inputs: form.getValues(),
      results: result,
      calculatorType: "fire"
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>FIRE Planning Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="currentAge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Age</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="25"
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
                name="currentSavings"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Savings/Investments (₹)</FormLabel>
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

              <FormField
                control={form.control}
                name="monthlyExpenses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Expenses (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="40000"
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
                name="monthlySavings"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Savings/Investments (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="20000"
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
                    <FormLabel>Expected Annual Return (%)</FormLabel>
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
                Calculate FIRE Timeline
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>FIRE Results</CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                <div className="result-card">
                  <div className="text-sm text-primary font-medium mb-1">FIRE Number</div>
                  <div className="text-2xl font-bold text-primary">{formatCurrency(result.fireNumber)}</div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-green-700">Years to FIRE</span>
                    <span className="font-semibold text-green-900">{result.yearsToFire} years</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-blue-700">FIRE Age</span>
                    <span className="font-semibold text-blue-900">{result.fireAge} years</span>
                  </div>
                  {result.shortfall > 0 && (
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <span className="text-orange-700">Amount Needed</span>
                      <span className="font-semibold text-orange-900">{formatCurrency(result.shortfall)}</span>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-900 mb-2">What is FIRE?</h4>
                  <p className="text-sm text-purple-800">
                    FIRE (Financial Independence, Retire Early) means having 25 times your annual 
                    expenses invested, allowing you to withdraw 4% annually to cover your living costs.
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
                <div className="text-4xl mb-4">🔥</div>
                <p>Enter your details to calculate your FIRE timeline</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
