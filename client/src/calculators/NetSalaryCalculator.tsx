import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/utils/formatters";
import { generatePDF, generateCSV } from "@/utils/pdfGenerator";

const netSalarySchema = z.object({
  grossSalary: z.number().min(0, "Gross salary cannot be negative"),
  pfContribution: z.number().min(0, "PF contribution cannot be negative").max(100, "PF contribution cannot exceed 100%"),
  esicContribution: z.number().min(0, "ESIC contribution cannot be negative").max(100, "ESIC contribution cannot exceed 100%"),
  professionalTax: z.number().min(0, "Professional tax cannot be negative"),
  otherDeductions: z.number().min(0, "Other deductions cannot be negative"),
  regime: z.enum(["new", "old"])
});

type NetSalaryFormData = z.infer<typeof netSalarySchema>;

function calculateNetSalary(data: NetSalaryFormData) {
  const { grossSalary, pfContribution, esicContribution, professionalTax, otherDeductions, regime } = data;
  
  // Calculate basic salary (typically 40-50% of gross)
  const basicSalary = grossSalary * 0.4;
  
  // Calculate PF deduction (12% of basic salary, capped at ₹1,800)
  const pfDeduction = Math.min(basicSalary * (pfContribution / 100), 21600); // Annual cap
  
  // Calculate ESIC deduction (0.75% of gross salary if gross <= 21,000 per month)
  const monthlyGross = grossSalary / 12;
  const esicDeduction = monthlyGross <= 21000 ? grossSalary * (esicContribution / 100) : 0;
  
  // Calculate income tax
  let incomeTax = 0;
  if (regime === "new") {
    if (grossSalary <= 300000) {
      incomeTax = 0;
    } else if (grossSalary <= 600000) {
      incomeTax = (grossSalary - 300000) * 0.05;
    } else if (grossSalary <= 900000) {
      incomeTax = 15000 + (grossSalary - 600000) * 0.10;
    } else if (grossSalary <= 1200000) {
      incomeTax = 45000 + (grossSalary - 900000) * 0.15;
    } else if (grossSalary <= 1500000) {
      incomeTax = 90000 + (grossSalary - 1200000) * 0.20;
    } else {
      incomeTax = 150000 + (grossSalary - 1500000) * 0.30;
    }
  } else {
    // Old regime with standard deduction
    const taxableIncome = Math.max(0, grossSalary - 50000); // Standard deduction
    if (taxableIncome <= 250000) {
      incomeTax = 0;
    } else if (taxableIncome <= 500000) {
      incomeTax = (taxableIncome - 250000) * 0.05;
    } else if (taxableIncome <= 1000000) {
      incomeTax = 12500 + (taxableIncome - 500000) * 0.20;
    } else {
      incomeTax = 112500 + (taxableIncome - 1000000) * 0.30;
    }
  }
  
  // Add cess (4% of income tax)
  const cess = incomeTax * 0.04;
  const totalTax = incomeTax + cess;
  
  const totalDeductions = pfDeduction + esicDeduction + totalTax + professionalTax + otherDeductions;
  const netSalary = grossSalary - totalDeductions;
  const takeHomePercentage = (netSalary / grossSalary) * 100;
  
  return {
    grossSalary,
    basicSalary: Math.round(basicSalary),
    pfDeduction: Math.round(pfDeduction),
    esicDeduction: Math.round(esicDeduction),
    incomeTax: Math.round(incomeTax),
    cess: Math.round(cess),
    totalTax: Math.round(totalTax),
    professionalTax,
    otherDeductions,
    totalDeductions: Math.round(totalDeductions),
    netSalary: Math.round(netSalary),
    monthlyNetSalary: Math.round(netSalary / 12),
    takeHomePercentage: Math.round(takeHomePercentage * 100) / 100
  };
}

export default function NetSalaryCalculator() {
  const [result, setResult] = useState<any>(null);

  const form = useForm<NetSalaryFormData>({
    resolver: zodResolver(netSalarySchema),
    defaultValues: {
      grossSalary: 1000000,
      pfContribution: 12,
      esicContribution: 0.75,
      professionalTax: 2400,
      otherDeductions: 0,
      regime: "new"
    }
  });

  const onSubmit = (data: NetSalaryFormData) => {
    const calculation = calculateNetSalary(data);
    setResult(calculation);
  };

  const handleDownloadPDF = () => {
    if (!result) return;
    generatePDF({
      title: "Net Salary Calculator Report",
      inputs: form.getValues(),
      results: result,
      calculatorType: "net-salary"
    });
  };

  const handleDownloadCSV = () => {
    if (!result) return;
    generateCSV({
      title: "Net Salary Calculator Report",
      inputs: form.getValues(),
      results: result,
      calculatorType: "net-salary"
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Salary Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="grossSalary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gross Annual Salary (₹)</FormLabel>
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
                        <SelectItem value="new">New Tax Regime</SelectItem>
                        <SelectItem value="old">Old Tax Regime</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pfContribution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PF Contribution (%)</FormLabel>
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
                    <p className="text-sm text-slate-500">Typically 12% of basic salary</p>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="esicContribution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ESIC Contribution (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.75"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-sm text-slate-500">0.75% if gross ≤ ₹21,000/month</p>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="professionalTax"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Professional Tax (Annual ₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="2400"
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
                name="otherDeductions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Other Deductions (Annual ₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-sm text-slate-500">Insurance, loans, etc.</p>
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Calculate Net Salary
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Salary Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                <div className="result-card">
                  <div className="text-sm text-primary font-medium mb-1">Annual Net Salary</div>
                  <div className="text-2xl font-bold text-primary">{formatCurrency(result.netSalary)}</div>
                  <div className="text-sm text-slate-600 mt-1">
                    Monthly: {formatCurrency(result.monthlyNetSalary)}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-600">Gross Salary</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(result.grossSalary)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="text-red-700">PF Deduction</span>
                    <span className="font-semibold text-red-900">{formatCurrency(result.pfDeduction)}</span>
                  </div>
                  {result.esicDeduction > 0 && (
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span className="text-red-700">ESIC Deduction</span>
                      <span className="font-semibold text-red-900">{formatCurrency(result.esicDeduction)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="text-red-700">Income Tax + Cess</span>
                    <span className="font-semibold text-red-900">{formatCurrency(result.totalTax)}</span>
                  </div>
                  {result.professionalTax > 0 && (
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span className="text-red-700">Professional Tax</span>
                      <span className="font-semibold text-red-900">{formatCurrency(result.professionalTax)}</span>
                    </div>
                  )}
                  {result.otherDeductions > 0 && (
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span className="text-red-700">Other Deductions</span>
                      <span className="font-semibold text-red-900">{formatCurrency(result.otherDeductions)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border-t-2 border-orange-200">
                    <span className="text-orange-700 font-medium">Total Deductions</span>
                    <span className="font-bold text-orange-900">{formatCurrency(result.totalDeductions)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-green-700 font-medium">Take-home Percentage</span>
                    <span className="font-bold text-green-900">{result.takeHomePercentage}%</span>
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
                <div className="text-4xl mb-4">💰</div>
                <p>Enter salary details to calculate your take-home pay</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
