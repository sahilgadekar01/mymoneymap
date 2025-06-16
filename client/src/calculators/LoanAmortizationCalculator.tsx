import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { calculateEMI } from "@/utils/calculations";
import { formatCurrency, formatNumber } from "@/utils/formatters";
import { generatePDF, generateCSV } from "@/utils/pdfGenerator";

const amortizationSchema = z.object({
  loanAmount: z.number().min(1, "Loan amount must be greater than 0"),
  interestRate: z.number().min(0.1, "Interest rate must be at least 0.1%").max(50, "Interest rate cannot exceed 50%"),
  loanTenure: z.number().min(1, "Loan tenure must be at least 1 year").max(50, "Loan tenure cannot exceed 50 years")
});

type AmortizationFormData = z.infer<typeof amortizationSchema>;

interface AmortizationRow {
  month: number;
  emi: number;
  principalPayment: number;
  interestPayment: number;
  remainingBalance: number;
  cumulativePrincipal: number;
  cumulativeInterest: number;
}

function generateAmortizationSchedule(
  loanAmount: number,
  interestRate: number,
  loanTenure: number
): AmortizationRow[] {
  const monthlyRate = interestRate / (12 * 100);
  const totalMonths = loanTenure * 12;
  
  const emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
             (Math.pow(1 + monthlyRate, totalMonths) - 1);
  
  const schedule: AmortizationRow[] = [];
  let remainingBalance = loanAmount;
  let cumulativePrincipal = 0;
  let cumulativeInterest = 0;
  
  for (let month = 1; month <= totalMonths; month++) {
    const interestPayment = remainingBalance * monthlyRate;
    const principalPayment = emi - interestPayment;
    
    remainingBalance = Math.max(0, remainingBalance - principalPayment);
    cumulativePrincipal += principalPayment;
    cumulativeInterest += interestPayment;
    
    schedule.push({
      month,
      emi: Math.round(emi),
      principalPayment: Math.round(principalPayment),
      interestPayment: Math.round(interestPayment),
      remainingBalance: Math.round(remainingBalance),
      cumulativePrincipal: Math.round(cumulativePrincipal),
      cumulativeInterest: Math.round(cumulativeInterest)
    });
  }
  
  return schedule;
}

export default function LoanAmortizationCalculator() {
  const [schedule, setSchedule] = useState<AmortizationRow[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('yearly');

  const form = useForm<AmortizationFormData>({
    resolver: zodResolver(amortizationSchema),
    defaultValues: {
      loanAmount: 2500000,
      interestRate: 8.5,
      loanTenure: 20
    }
  });

  const onSubmit = (data: AmortizationFormData) => {
    const emiResult = calculateEMI(data.loanAmount, data.interestRate, data.loanTenure);
    const fullSchedule = generateAmortizationSchedule(data.loanAmount, data.interestRate, data.loanTenure);
    
    setSchedule(fullSchedule);
    setSummary({
      ...emiResult,
      totalMonths: data.loanTenure * 12,
      avgMonthlyPrincipal: Math.round(data.loanAmount / (data.loanTenure * 12)),
      avgMonthlyInterest: Math.round(emiResult.totalInterest / (data.loanTenure * 12))
    });
  };

  const getDisplaySchedule = () => {
    if (viewMode === 'yearly') {
      const yearlySchedule = [];
      for (let year = 1; year <= form.getValues().loanTenure; year++) {
        const startMonth = (year - 1) * 12 + 1;
        const endMonth = Math.min(year * 12, schedule.length);
        
        if (startMonth <= schedule.length) {
          const yearData = schedule.slice(startMonth - 1, endMonth);
          const yearSummary = {
            period: `Year ${year}`,
            totalEMI: yearData.reduce((sum, month) => sum + month.emi, 0),
            totalPrincipal: yearData.reduce((sum, month) => sum + month.principalPayment, 0),
            totalInterest: yearData.reduce((sum, month) => sum + month.interestPayment, 0),
            endingBalance: yearData[yearData.length - 1]?.remainingBalance || 0
          };
          yearlySchedule.push(yearSummary);
        }
      }
      return yearlySchedule;
    }
    return schedule.slice(0, 60); // Show first 5 years for monthly view
  };

  const handleDownloadPDF = () => {
    if (!summary) return;
    
    generatePDF({
      title: "Loan Amortization Schedule Report",
      inputs: form.getValues(),
      results: { ...summary, schedulePreview: schedule.slice(0, 12) },
      calculatorType: "loan-amortization"
    });
  };

  const handleDownloadCSV = () => {
    if (!summary) return;
    
    // Create CSV content with full schedule
    const csvContent = [
      ['Loan Amortization Schedule'],
      ['Loan Amount', formatCurrency(form.getValues().loanAmount)],
      ['Interest Rate', `${form.getValues().interestRate}%`],
      ['Loan Tenure', `${form.getValues().loanTenure} years`],
      ['Monthly EMI', formatCurrency(summary.emi)],
      [''],
      ['Month', 'EMI', 'Principal', 'Interest', 'Balance'],
      ...schedule.map(row => [
        row.month,
        row.emi,
        row.principalPayment,
        row.interestPayment,
        row.remainingBalance
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `loan-amortization-schedule-${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle>Loan Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="loanAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loan Amount (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="2500000"
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
                  name="interestRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interest Rate (% per annum)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="8.5"
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
                  name="loanTenure"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loan Tenure (Years)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="20"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full">
                Generate Amortization Schedule
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Results Summary */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-slate-600 mb-1">Monthly EMI</div>
              <div className="text-2xl font-bold text-primary">{formatCurrency(summary.emi)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-slate-600 mb-1">Total Interest</div>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalInterest)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-slate-600 mb-1">Total Amount</div>
              <div className="text-2xl font-bold text-slate-900">{formatCurrency(summary.totalAmount)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-slate-600 mb-1">Total Months</div>
              <div className="text-2xl font-bold text-blue-600">{summary.totalMonths}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Amortization Schedule */}
      {schedule.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Amortization Schedule</CardTitle>
              <div className="flex space-x-2">
                <Button
                  variant={viewMode === 'yearly' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('yearly')}
                >
                  Yearly View
                </Button>
                <Button
                  variant={viewMode === 'monthly' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('monthly')}
                >
                  Monthly View
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">
                      {viewMode === 'yearly' ? 'Year' : 'Month'}
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-slate-700">EMI</th>
                    <th className="text-right py-3 px-4 font-medium text-slate-700">Principal</th>
                    <th className="text-right py-3 px-4 font-medium text-slate-700">Interest</th>
                    <th className="text-right py-3 px-4 font-medium text-slate-700">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {viewMode === 'yearly' ? (
                    getDisplaySchedule().map((row: any, index) => (
                      <tr key={index} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-medium text-slate-900">{row.period}</td>
                        <td className="py-3 px-4 text-right text-slate-700">{formatCurrency(row.totalEMI)}</td>
                        <td className="py-3 px-4 text-right text-green-600">{formatCurrency(row.totalPrincipal)}</td>
                        <td className="py-3 px-4 text-right text-red-600">{formatCurrency(row.totalInterest)}</td>
                        <td className="py-3 px-4 text-right text-slate-900">{formatCurrency(row.endingBalance)}</td>
                      </tr>
                    ))
                  ) : (
                    getDisplaySchedule().map((row: any, index) => (
                      <tr key={index} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-medium text-slate-900">{row.month}</td>
                        <td className="py-3 px-4 text-right text-slate-700">{formatCurrency(row.emi)}</td>
                        <td className="py-3 px-4 text-right text-green-600">{formatCurrency(row.principalPayment)}</td>
                        <td className="py-3 px-4 text-right text-red-600">{formatCurrency(row.interestPayment)}</td>
                        <td className="py-3 px-4 text-right text-slate-900">{formatCurrency(row.remainingBalance)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {viewMode === 'monthly' && schedule.length > 60 && (
              <div className="mt-4 text-center text-sm text-slate-500">
                Showing first 60 months. Download CSV for complete schedule.
              </div>
            )}

            <div className="flex space-x-3 mt-6">
              <Button onClick={handleDownloadPDF} variant="outline" className="flex-1">
                Download PDF Summary
              </Button>
              <Button onClick={handleDownloadCSV} variant="outline" className="flex-1">
                Download Complete CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insights */}
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900">Interest vs Principal</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Interest Paid</span>
                    <span className="font-medium">{Math.round((summary.totalInterest / summary.totalAmount) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ width: `${(summary.totalInterest / summary.totalAmount) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Principal Amount</span>
                    <span className="font-medium">{Math.round((form.getValues().loanAmount / summary.totalAmount) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${(form.getValues().loanAmount / summary.totalAmount) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900">Key Insights</h4>
                <ul className="text-sm text-slate-600 space-y-2">
                  <li>• Interest is highest in early years and decreases over time</li>
                  <li>• Principal payments increase as interest payments decrease</li>
                  <li>• Consider prepayments to reduce total interest burden</li>
                  <li>• Review your loan annually for better interest rates</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!summary && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-slate-400">Enter loan details to generate amortization schedule</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
