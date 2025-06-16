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

const inflationSchema = z.object({
  currentValue: z.number().min(1, "Current value must be greater than 0"),
  inflationRate: z.number().min(0.1, "Inflation rate must be at least 0.1%").max(20, "Inflation rate cannot exceed 20%"),
  years: z.number().min(1, "Years must be at least 1").max(50, "Years cannot exceed 50")
});

type InflationFormData = z.infer<typeof inflationSchema>;

function calculateInflationAdjustedValue(currentValue: number, inflationRate: number, years: number) {
  const futureValue = currentValue * Math.pow(1 + inflationRate / 100, years);
  const totalInflation = futureValue - currentValue;
  const purchasingPowerLoss = (totalInflation / futureValue) * 100;
  
  return {
    futureValue: Math.round(futureValue),
    totalInflation: Math.round(totalInflation),
    purchasingPowerLoss: Math.round(purchasingPowerLoss * 100) / 100,
    equivalentTodaysValue: Math.round(currentValue)
  };
}

export default function InflationCalculator() {
  const [result, setResult] = useState<any>(null);

  const form = useForm<InflationFormData>({
    resolver: zodResolver(inflationSchema),
    defaultValues: {
      currentValue: 100000,
      inflationRate: 6,
      years: 10
    }
  });

  const onSubmit = (data: InflationFormData) => {
    const calculation = calculateInflationAdjustedValue(data.currentValue, data.inflationRate, data.years);
    setResult(calculation);
  };

  const handleDownloadPDF = () => {
    if (!result) return;
    generatePDF({
      title: "Inflation Adjusted Future Value Report",
      inputs: form.getValues(),
      results: result,
      calculatorType: "inflation"
    });
  };

  const handleDownloadCSV = () => {
    if (!result) return;
    generateCSV({
      title: "Inflation Adjusted Future Value Report",
      inputs: form.getValues(),
      results: result,
      calculatorType: "inflation"
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Inflation Analysis Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="currentValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Value/Amount (₹)</FormLabel>
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
                    <p className="text-sm text-slate-500">Average Indian inflation rate is around 5-7%</p>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="years"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Period (Years)</FormLabel>
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
                Calculate Future Value
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Inflation Impact Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                <div className="result-card">
                  <div className="text-sm text-primary font-medium mb-1">Future Value (Nominal)</div>
                  <div className="text-2xl font-bold text-primary">{formatCurrency(result.futureValue)}</div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-600">Today's Value</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(result.equivalentTodaysValue)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="text-red-700">Inflation Impact</span>
                    <span className="font-semibold text-red-900">{formatCurrency(result.totalInflation)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <span className="text-yellow-700">Purchasing Power Loss</span>
                    <span className="font-semibold text-yellow-900">{result.purchasingPowerLoss}%</span>
                  </div>
                </div>

                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <h4 className="font-semibold text-orange-900 mb-2">What this means:</h4>
                  <p className="text-sm text-orange-800">
                    After {form.getValues().years} years, you'll need {formatCurrency(result.futureValue)} to 
                    buy what costs {formatCurrency(result.equivalentTodaysValue)} today due to inflation.
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
                <p>Enter details to see inflation's impact on value</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
