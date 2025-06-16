import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { calculateIncomeTax } from "@/utils/calculations";
import { formatCurrency } from "@/utils/formatters";
import { generatePDF, generateCSV } from "@/utils/pdfGenerator";

const incomeTaxSchema = z.object({
  grossIncome: z.number().min(0, "Gross income cannot be negative"),
  regime: z.enum(["new", "old"]),
  deductions: z.number().min(0, "Deductions cannot be negative").optional()
});

type IncomeTaxFormData = z.infer<typeof incomeTaxSchema>;

export default function IncomeTaxCalculator() {
  const [result, setResult] = useState<any>(null);

  const form = useForm<IncomeTaxFormData>({
    resolver: zodResolver(incomeTaxSchema),
    defaultValues: {
      grossIncome: 1000000,
      regime: "new",
      deductions: 0
    }
  });

  const onSubmit = (data: IncomeTaxFormData) => {
    const taxableIncome = data.regime === "old" ? 
      Math.max(0, data.grossIncome - (data.deductions || 0)) : 
      data.grossIncome;
    
    const calculation = calculateIncomeTax(taxableIncome, data.regime);
    setResult({
      ...calculation,
      grossIncome: data.grossIncome,
      deductions: data.deductions || 0,
      taxableIncome
    });
  };

  const handleDownloadPDF = () => {
    if (!result) return;
    generatePDF({
      title: "Income Tax Calculator Report",
      inputs: form.getValues(),
      results: result,
      calculatorType: "income-tax"
    });
  };

  const handleDownloadCSV = () => {
    if (!result) return;
    generateCSV({
      title: "Income Tax Calculator Report",
      inputs: form.getValues(),
      results: result,
      calculatorType: "income-tax"
    });
  };

  const watchRegime = form.watch("regime");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Income Tax Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="grossIncome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gross Annual Income (₹)</FormLabel>
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
                name="regime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax Regime</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select tax regime" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="new">New Tax Regime (2023-24)</SelectItem>
                        <SelectItem value="old">Old Tax Regime</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchRegime === "old" && (
                <FormField
                  control={form.control}
                  name="deductions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Deductions (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="150000"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-sm text-slate-500">
                        80C, 80D, HRA, etc. (Old regime only)
                      </p>
                    </FormItem>
                  )}
                />
              )}

              <Button type="submit" className="w-full">
                Calculate Tax
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Tax Calculation Results</CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                <div className="result-card">
                  <div className="text-sm text-primary font-medium mb-1">Total Tax Liability</div>
                  <div className="text-2xl font-bold text-primary">{formatCurrency(result.totalTax)}</div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-600">Gross Income</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(result.grossIncome)}</span>
                  </div>
                  {result.deductions > 0 && (
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-green-700">Deductions</span>
                      <span className="font-semibold text-green-900">{formatCurrency(result.deductions)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <span className="text-yellow-700">Taxable Income</span>
                    <span className="font-semibold text-yellow-900">{formatCurrency(result.taxableIncome)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="text-red-700">Income Tax</span>
                    <span className="font-semibold text-red-900">{formatCurrency(result.tax)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="text-red-700">Health & Education Cess</span>
                    <span className="font-semibold text-red-900">{formatCurrency(result.cess)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-blue-700">Net Income (After Tax)</span>
                    <span className="font-semibold text-blue-900">{formatCurrency(result.netIncome)}</span>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-900 mb-2">Tax Rates Used:</h4>
                  <p className="text-sm text-purple-800">
                    {form.getValues().regime === "new" ? 
                      "New Tax Regime 2023-24: ₹0-3L (0%), ₹3-6L (5%), ₹6-9L (10%), ₹9-12L (15%), ₹12-15L (20%), Above ₹15L (30%)" :
                      "Old Tax Regime: ₹0-2.5L (0%), ₹2.5-5L (5%), ₹5-10L (20%), Above ₹10L (30%)"
                    }
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
                <div className="text-4xl mb-4">💼</div>
                <p>Enter your income details to calculate tax</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
