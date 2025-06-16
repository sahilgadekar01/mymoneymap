import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { calculateBreakEven } from "@/utils/calculations";
import { formatCurrency, formatNumber } from "@/utils/formatters";
import { generatePDF, generateCSV } from "@/utils/pdfGenerator";

const breakEvenSchema = z.object({
  fixedCosts: z.number().min(0, "Fixed costs cannot be negative"),
  variableCostPerUnit: z.number().min(0, "Variable cost per unit cannot be negative"),
  pricePerUnit: z.number().min(0.01, "Price per unit must be greater than 0"),
  targetProfit: z.number().min(0, "Target profit cannot be negative").optional()
});

type BreakEvenFormData = z.infer<typeof breakEvenSchema>;

function calculateExtendedBreakEven(data: BreakEvenFormData) {
  const basicBreakEven = calculateBreakEven(data.fixedCosts, data.variableCostPerUnit, data.pricePerUnit);
  
  // Calculate units needed for target profit
  let unitsForTargetProfit = 0;
  let revenueForTargetProfit = 0;
  
  if (data.targetProfit && data.targetProfit > 0) {
    const contributionMargin = data.pricePerUnit - data.variableCostPerUnit;
    unitsForTargetProfit = Math.ceil((data.fixedCosts + data.targetProfit) / contributionMargin);
    revenueForTargetProfit = unitsForTargetProfit * data.pricePerUnit;
  }
  
  // Calculate margin of safety
  const currentUnits = basicBreakEven.breakEvenUnits * 1.2; // Assume 20% above break-even
  const marginOfSafety = Math.max(0, currentUnits - basicBreakEven.breakEvenUnits);
  const marginOfSafetyPercentage = currentUnits > 0 ? (marginOfSafety / currentUnits) * 100 : 0;
  
  return {
    ...basicBreakEven,
    targetProfit: data.targetProfit || 0,
    unitsForTargetProfit,
    revenueForTargetProfit,
    marginOfSafety: Math.round(marginOfSafety),
    marginOfSafetyPercentage: Math.round(marginOfSafetyPercentage * 100) / 100,
    variableCostTotal: Math.round(basicBreakEven.breakEvenUnits * data.variableCostPerUnit),
    totalCostAtBreakEven: Math.round(data.fixedCosts + (basicBreakEven.breakEvenUnits * data.variableCostPerUnit))
  };
}

export default function BreakEvenCalculator() {
  const [result, setResult] = useState<any>(null);

  const form = useForm<BreakEvenFormData>({
    resolver: zodResolver(breakEvenSchema),
    defaultValues: {
      fixedCosts: 500000,
      variableCostPerUnit: 200,
      pricePerUnit: 500,
      targetProfit: 100000
    }
  });

  const onSubmit = (data: BreakEvenFormData) => {
    if (data.pricePerUnit <= data.variableCostPerUnit) {
      form.setError("pricePerUnit", {
        type: "manual",
        message: "Price per unit must be greater than variable cost per unit"
      });
      return;
    }
    
    const calculation = calculateExtendedBreakEven(data);
    setResult(calculation);
  };

  const handleDownloadPDF = () => {
    if (!result) return;
    generatePDF({
      title: "Break-even Point Calculator Report",
      inputs: form.getValues(),
      results: result,
      calculatorType: "break-even"
    });
  };

  const handleDownloadCSV = () => {
    if (!result) return;
    generateCSV({
      title: "Break-even Point Calculator Report",
      inputs: form.getValues(),
      results: result,
      calculatorType: "break-even"
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Business Cost Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="fixedCosts"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fixed Costs (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="500000"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-sm text-slate-500">
                      Rent, salaries, insurance, utilities, etc.
                    </p>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="variableCostPerUnit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Variable Cost per Unit (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="200"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-sm text-slate-500">
                      Materials, labor, shipping per unit
                    </p>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pricePerUnit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Selling Price per Unit (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="500"
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
                name="targetProfit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Profit (₹) - Optional</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="100000"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-sm text-slate-500">
                      Desired profit amount beyond break-even
                    </p>
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Calculate Break-even Point
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Break-even Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                <div className="result-card">
                  <div className="text-sm text-primary font-medium mb-1">Break-even Point</div>
                  <div className="text-2xl font-bold text-primary">
                    {formatNumber(result.breakEvenUnits)} units
                  </div>
                  <div className="text-sm text-slate-600 mt-1">
                    Revenue: {formatCurrency(result.breakEvenRevenue)}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-600">Fixed Costs</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(form.getValues().fixedCosts)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-blue-700">Contribution Margin per Unit</span>
                    <span className="font-semibold text-blue-900">{formatCurrency(result.contributionMargin)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-green-700">Contribution Margin %</span>
                    <span className="font-semibold text-green-900">{result.contributionMarginPercent}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <span className="text-yellow-700">Variable Costs at Break-even</span>
                    <span className="font-semibold text-yellow-900">{formatCurrency(result.variableCostTotal)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                    <span className="text-orange-700">Total Costs at Break-even</span>
                    <span className="font-semibold text-orange-900">{formatCurrency(result.totalCostAtBreakEven)}</span>
                  </div>
                </div>

                {result.targetProfit > 0 && (
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="font-semibold text-purple-900 mb-2">Target Profit Analysis:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-purple-700">Units needed for {formatCurrency(result.targetProfit)} profit:</span>
                        <span className="font-semibold text-purple-900">{formatNumber(result.unitsForTargetProfit)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-700">Revenue needed:</span>
                        <span className="font-semibold text-purple-900">{formatCurrency(result.revenueForTargetProfit)}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">Key Business Metrics:</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-blue-700">Margin of Safety:</div>
                      <div className="font-semibold text-blue-900">
                        {formatNumber(result.marginOfSafety)} units ({result.marginOfSafetyPercentage}%)
                      </div>
                    </div>
                    <div>
                      <div className="text-blue-700">Break-even Revenue:</div>
                      <div className="font-semibold text-blue-900">{formatCurrency(result.breakEvenRevenue)}</div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-2">Break-even Formula:</h4>
                  <div className="text-sm text-green-800">
                    <p><strong>Break-even Units = Fixed Costs ÷ Contribution Margin per Unit</strong></p>
                    <p className="mt-2">
                      = {formatCurrency(form.getValues().fixedCosts)} ÷ {formatCurrency(result.contributionMargin)}
                      = {formatNumber(result.breakEvenUnits)} units
                    </p>
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
                <div className="text-4xl mb-4">⚖️</div>
                <p>Enter business costs to calculate break-even point</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
