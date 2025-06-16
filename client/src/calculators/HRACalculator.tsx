import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { calculateHRAExemption } from "@/utils/calculations";
import { formatCurrency } from "@/utils/formatters";
import { generatePDF, generateCSV } from "@/utils/pdfGenerator";

const hraSchema = z.object({
  salary: z.number().min(0, "Salary cannot be negative"),
  hra: z.number().min(0, "HRA cannot be negative"),
  rentPaid: z.number().min(0, "Rent paid cannot be negative"),
  isMetroCity: z.boolean()
});

type HRAFormData = z.infer<typeof hraSchema>;

export default function HRACalculator() {
  const [result, setResult] = useState<any>(null);

  const form = useForm<HRAFormData>({
    resolver: zodResolver(hraSchema),
    defaultValues: {
      salary: 600000,
      hra: 180000,
      rentPaid: 240000,
      isMetroCity: true
    }
  });

  const onSubmit = (data: HRAFormData) => {
    const calculation = calculateHRAExemption(data.salary, data.hra, data.rentPaid, data.isMetroCity);
    setResult(calculation);
  };

  const handleDownloadPDF = () => {
    if (!result) return;
    generatePDF({
      title: "HRA Exemption Calculator Report",
      inputs: form.getValues(),
      results: result,
      calculatorType: "hra"
    });
  };

  const handleDownloadCSV = () => {
    if (!result) return;
    generateCSV({
      title: "HRA Exemption Calculator Report",
      inputs: form.getValues(),
      results: result,
      calculatorType: "hra"
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>HRA Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="salary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Annual Basic Salary (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="600000"
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
                name="hra"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Annual HRA Received (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="180000"
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
                name="rentPaid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Annual Rent Paid (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="240000"
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
                name="isMetroCity"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        I live in a metro city
                      </FormLabel>
                      <p className="text-sm text-slate-500">
                        Delhi, Mumbai, Chennai, Kolkata, Bangalore, Hyderabad, Ahmedabad, Pune
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Calculate HRA Exemption
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>HRA Exemption Results</CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                <div className="result-card">
                  <div className="text-sm text-primary font-medium mb-1">HRA Exemption</div>
                  <div className="text-2xl font-bold text-primary">{formatCurrency(result.hraExemption)}</div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-600">HRA Received</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(form.getValues().hra)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-green-700">HRA Exemption</span>
                    <span className="font-semibold text-green-900">{formatCurrency(result.hraExemption)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="text-red-700">Taxable HRA</span>
                    <span className="font-semibold text-red-900">{formatCurrency(result.taxableHRA)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-blue-700">Annual Rent Paid</span>
                    <span className="font-semibold text-blue-900">{formatCurrency(result.actualRent)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <span className="text-yellow-700">Basic Salary</span>
                    <span className="font-semibold text-yellow-900">{formatCurrency(result.basicSalary)}</span>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-900 mb-2">HRA Exemption Calculation:</h4>
                  <p className="text-sm text-purple-800 mb-2">
                    HRA exemption is the <strong>minimum</strong> of:
                  </p>
                  <ul className="text-sm text-purple-800 space-y-1">
                    <li>1. Actual HRA received: {formatCurrency(form.getValues().hra)}</li>
                    <li>2. {form.getValues().isMetroCity ? '50%' : '40%'} of basic salary: {formatCurrency(result.basicSalary * (form.getValues().isMetroCity ? 0.5 : 0.4))}</li>
                    <li>3. Rent paid - 10% of basic salary: {formatCurrency(Math.max(0, form.getValues().rentPaid - result.basicSalary * 0.1))}</li>
                  </ul>
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
                <div className="text-4xl mb-4">🏠</div>
                <p>Enter your HRA details to calculate exemption</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
