import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { calculateSIP } from "@/utils/calculations";
import { formatCurrency } from "@/utils/formatters";
import { generatePDF, generateCSV } from "@/utils/pdfGenerator";

const sipSchema = z.object({
  monthlyAmount: z.number().min(100, "Monthly amount must be at least ₹100"),
  expectedReturn: z.number().min(1, "Expected return must be at least 1%").max(30, "Expected return cannot exceed 30%"),
  investmentPeriod: z.number().min(1, "Investment period must be at least 1 year").max(50, "Investment period cannot exceed 50 years")
});

type SIPFormData = z.infer<typeof sipSchema>;

export default function SIPCalculator() {
  const [result, setResult] = useState<any>(null);

  const form = useForm<SIPFormData>({
    resolver: zodResolver(sipSchema),
    defaultValues: {
      monthlyAmount: 5000,
      expectedReturn: 12,
      investmentPeriod: 10
    }
  });

  const onSubmit = (data: SIPFormData) => {
    const calculation = calculateSIP(data.monthlyAmount, data.expectedReturn, data.investmentPeriod);
    setResult(calculation);
  };

  const handleDownloadPDF = () => {
    if (!result) return;
    generatePDF({
      title: "SIP Calculator Report",
      inputs: form.getValues(),
      results: result,
      calculatorType: "sip"
    });
  };

  const handleDownloadCSV = () => {
    if (!result) return;
    generateCSV({
      title: "SIP Calculator Report",
      inputs: form.getValues(),
      results: result,
      calculatorType: "sip"
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>SIP Investment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="monthlyAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Investment Amount (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="5000"
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

              <FormField
                control={form.control}
                name="investmentPeriod"
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

              <Button type="submit" className="w-full">
                Calculate SIP Returns
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>SIP Investment Results</CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                <div className="result-card">
                  <div className="text-sm text-primary font-medium mb-1">Maturity Value</div>
                  <div className="text-2xl font-bold text-primary">{formatCurrency(result.futureValue)}</div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-600">Total Investment</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(result.totalInvestment)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-green-700">Total Returns</span>
                    <span className="font-semibold text-green-900">{formatCurrency(result.totalReturns)}</span>
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
                <div className="text-4xl mb-4">💹</div>
                <p>Enter SIP details to see your investment projection</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
