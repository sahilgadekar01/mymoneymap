import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { calculateEmergencyFund } from "@/utils/calculations";
import { formatCurrency } from "@/utils/formatters";
import { generatePDF, generateCSV } from "@/utils/pdfGenerator";

const emergencyFundSchema = z.object({
  monthlyExpenses: z.number().min(5000, "Monthly expenses must be at least ₹5,000"),
  dependents: z.number().min(0, "Number of dependents cannot be negative").max(10, "Number of dependents cannot exceed 10"),
  jobStability: z.enum(["high", "medium", "low"]),
  hasHealthInsurance: z.boolean(),
  hasLifeInsurance: z.boolean(),
  currentEmergencyFund: z.number().min(0, "Current emergency fund cannot be negative"),
  monthlySavingsCapacity: z.number().min(0, "Monthly savings capacity cannot be negative")
});

type EmergencyFundFormData = z.infer<typeof emergencyFundSchema>;

export default function EmergencyFundCalculator() {
  const [result, setResult] = useState<any>(null);

  const form = useForm<EmergencyFundFormData>({
    resolver: zodResolver(emergencyFundSchema),
    defaultValues: {
      monthlyExpenses: 50000,
      dependents: 1,
      jobStability: "medium",
      hasHealthInsurance: true,
      hasLifeInsurance: true,
      currentEmergencyFund: 0,
      monthlySavingsCapacity: 10000
    }
  });

  const onSubmit = (data: EmergencyFundFormData) => {
    // Enhanced emergency fund calculation with insurance consideration
    const hasInsurance = data.hasHealthInsurance && data.hasLifeInsurance;
    const calculation = calculateEmergencyFund(
      data.monthlyExpenses,
      data.dependents,
      data.jobStability,
      hasInsurance
    );
    
    const shortfall = Math.max(0, calculation.recommendedAmount - data.currentEmergencyFund);
    const monthsToGoal = data.monthlySavingsCapacity > 0 ? 
      Math.ceil(shortfall / data.monthlySavingsCapacity) : 0;
    
    const enhancedResult = {
      ...calculation,
      currentFund: data.currentEmergencyFund,
      shortfall,
      monthsToGoal,
      targetAchievementDate: monthsToGoal > 0 ? 
        new Date(Date.now() + monthsToGoal * 30 * 24 * 60 * 60 * 1000).toLocaleDateString() : 
        "Already achieved",
      adequacyPercentage: Math.round((data.currentEmergencyFund / calculation.recommendedAmount) * 100)
    };
    
    setResult(enhancedResult);
  };

  const handleDownloadPDF = () => {
    if (!result) return;
    generatePDF({
      title: "Emergency Fund Calculator Report",
      inputs: form.getValues(),
      results: result,
      calculatorType: "emergency-fund"
    });
  };

  const handleDownloadCSV = () => {
    if (!result) return;
    generateCSV({
      title: "Emergency Fund Calculator Report",
      inputs: form.getValues(),
      results: result,
      calculatorType: "emergency-fund"
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Personal & Financial Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="monthlyExpenses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Expenses (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="50000"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-sm text-slate-500">Include rent, food, utilities, EMIs, etc.</p>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dependents"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Dependents</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="1"
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
                  name="jobStability"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Stability</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select job stability" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="high">High (Government/Stable)</SelectItem>
                          <SelectItem value="medium">Medium (Private/Regular)</SelectItem>
                          <SelectItem value="low">Low (Freelance/Contract)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="hasHealthInsurance"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>I have adequate health insurance</FormLabel>
                        <p className="text-sm text-slate-500">
                          Covers medical emergencies for you and your family
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hasLifeInsurance"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>I have adequate life insurance</FormLabel>
                        <p className="text-sm text-slate-500">
                          Provides financial security for dependents
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="currentEmergencyFund"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Emergency Fund (₹)</FormLabel>
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
                name="monthlySavingsCapacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Savings Capacity (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="10000"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-sm text-slate-500">Amount you can save monthly for emergency fund</p>
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Calculate Emergency Fund
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Emergency Fund Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                <div className="result-card">
                  <div className="text-sm text-primary font-medium mb-1">Recommended Emergency Fund</div>
                  <div className="text-2xl font-bold text-primary">{formatCurrency(result.recommendedAmount)}</div>
                  <div className="text-sm text-slate-600 mt-1">
                    {result.months} months of expenses
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-600">Current Emergency Fund</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(result.currentFund)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-blue-700">Fund Adequacy</span>
                    <span className="font-semibold text-blue-900">{result.adequacyPercentage}%</span>
                  </div>
                  {result.shortfall > 0 ? (
                    <>
                      <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                        <span className="text-red-700">Shortfall</span>
                        <span className="font-semibold text-red-900">{formatCurrency(result.shortfall)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                        <span className="text-yellow-700">Months to Goal</span>
                        <span className="font-semibold text-yellow-900">{result.monthsToGoal} months</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <span className="text-green-700">Target Achievement</span>
                        <span className="font-semibold text-green-900">{result.targetAchievementDate}</span>
                      </div>
                    </>
                  ) : (
                    <div className="p-3 bg-green-50 rounded-lg text-center">
                      <span className="text-green-700 font-semibold">✅ Emergency Fund Goal Achieved!</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2">Emergency Fund Guidelines:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• High job stability: 6 months expenses</li>
                      <li>• Medium job stability: 7 months expenses</li>
                      <li>• Low job stability: 9 months expenses</li>
                      <li>• +0.5 months per dependent</li>
                      <li>• +1 month if no adequate insurance</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-900 mb-2">Where to Keep Emergency Fund:</h4>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• Savings Bank Account (Instant access)</li>
                      <li>• Fixed Deposits (Partial amount)</li>
                      <li>• Liquid Mutual Funds (Better returns)</li>
                      <li>• Avoid: Equity, Real Estate, or illiquid assets</li>
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
                <div className="text-4xl mb-4">🆘</div>
                <p>Enter your details to calculate emergency fund requirement</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
