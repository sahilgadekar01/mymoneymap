import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { calculatePPF } from "@/utils/calculations";
import { formatCurrency } from "@/utils/formatters";
import { generatePDF, generateCSV } from "@/utils/pdfGenerator";

const ppfSchema = z.object({
  yearlyAmount: z.number().min(500, "Minimum yearly deposit is ₹500").max(150000, "Maximum yearly deposit is ₹1,50,000"),
  tenure: z.number().min(15, "Minimum PPF tenure is 15 years").max(50, "Maximum extended tenure is 50 years")
});

type PPFFormData = z.infer<typeof ppfSchema>;

export default function PPFCalculator() {
  const [result, setResult] = useState<any>(null);

  const form = useForm<PPFFormData>({
    resolver: zodResolver(ppfSchema),
    defaultValues: {
      yearlyAmount: 150000,
      tenure: 15
    }
  });

  const onSubmit = (data: PPFFormData) => {
    const calculation = calculatePPF(data.yearlyAmount, data.tenure);
    setResult(calculation);
  };

  const handleDownloadPDF = () => {
    if (!result) return;
    generatePDF({
      title: "PPF Calculator Report",
      inputs: form.getValues(),
      results: result,
      calculatorType: "ppf"
    });
  };

  const handleDownloadCSV = () => {
    if (!result) return;
    generateCSV({
      title: "PPF Calculator Report",
      inputs: form.getValues(),
      results: result,
      calculatorType: "ppf"
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>PPF Investment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="yearlyAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Yearly Deposit Amount (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="150000"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-sm text-slate-500">Minimum: ₹500, Maximum: ₹1,50,000 per year</p>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tenure"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Investment Tenure (Years)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="15"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-sm text-slate-500">PPF has a lock-in period of 15 years</p>
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Calculate PPF Maturity
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>PPF Maturity Details</CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                <div className="result-card">
                  <div className="text-sm text-primary font-medium mb-1">Maturity Amount</div>
                  <div className="text-2xl font-bold text-primary">{formatCurrency(result.maturityAmount)}</div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-600">Total Investment</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(result.totalInvestment)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-green-700">Total Interest</span>
                    <span className="font-semibold text-green-900">{formatCurrency(result.interest)}</span>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Tax Benefits:</strong> PPF offers tax deduction under Section 80C, 
                    tax-free interest, and tax-free maturity amount (EEE status).
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
                <div className="text-4xl mb-4">🏛️</div>
                <p>Enter PPF details to see your maturity amount</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
