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

const netWorthSchema = z.object({
  // Liquid Assets
  savingsAccount: z.number().min(0, "Savings account balance cannot be negative"),
  fixedDeposits: z.number().min(0, "Fixed deposits cannot be negative"),
  liquidFunds: z.number().min(0, "Liquid funds cannot be negative"),
  
  // Investments
  mutualFunds: z.number().min(0, "Mutual funds cannot be negative"),
  stocks: z.number().min(0, "Stocks value cannot be negative"),
  bonds: z.number().min(0, "Bonds value cannot be negative"),
  ppf: z.number().min(0, "PPF value cannot be negative"),
  epf: z.number().min(0, "EPF value cannot be negative"),
  
  // Physical Assets
  realEstate: z.number().min(0, "Real estate value cannot be negative"),
  gold: z.number().min(0, "Gold value cannot be negative"),
  vehicle: z.number().min(0, "Vehicle value cannot be negative"),
  otherAssets: z.number().min(0, "Other assets cannot be negative"),
  
  // Liabilities
  homeLoan: z.number().min(0, "Home loan cannot be negative"),
  carLoan: z.number().min(0, "Car loan cannot be negative"),
  personalLoan: z.number().min(0, "Personal loan cannot be negative"),
  creditCardDebt: z.number().min(0, "Credit card debt cannot be negative"),
  otherLiabilities: z.number().min(0, "Other liabilities cannot be negative")
});

type NetWorthFormData = z.infer<typeof netWorthSchema>;

function calculateNetWorth(data: NetWorthFormData) {
  // Calculate total assets
  const liquidAssets = data.savingsAccount + data.fixedDeposits + data.liquidFunds;
  const investments = data.mutualFunds + data.stocks + data.bonds + data.ppf + data.epf;
  const physicalAssets = data.realEstate + data.gold + data.vehicle + data.otherAssets;
  const totalAssets = liquidAssets + investments + physicalAssets;
  
  // Calculate total liabilities
  const totalLiabilities = data.homeLoan + data.carLoan + data.personalLoan + data.creditCardDebt + data.otherLiabilities;
  
  // Calculate net worth
  const netWorth = totalAssets - totalLiabilities;
  
  // Calculate ratios
  const liquidityRatio = totalLiabilities > 0 ? (liquidAssets / totalLiabilities) * 100 : 100;
  const debtToAssetRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;
  const investmentPercentage = totalAssets > 0 ? (investments / totalAssets) * 100 : 0;
  
  return {
    liquidAssets: Math.round(liquidAssets),
    investments: Math.round(investments),
    physicalAssets: Math.round(physicalAssets),
    totalAssets: Math.round(totalAssets),
    totalLiabilities: Math.round(totalLiabilities),
    netWorth: Math.round(netWorth),
    liquidityRatio: Math.round(liquidityRatio * 100) / 100,
    debtToAssetRatio: Math.round(debtToAssetRatio * 100) / 100,
    investmentPercentage: Math.round(investmentPercentage * 100) / 100,
    isPositive: netWorth >= 0
  };
}

export default function NetWorthCalculator() {
  const [result, setResult] = useState<any>(null);

  const form = useForm<NetWorthFormData>({
    resolver: zodResolver(netWorthSchema),
    defaultValues: {
      savingsAccount: 100000,
      fixedDeposits: 200000,
      liquidFunds: 50000,
      mutualFunds: 500000,
      stocks: 300000,
      bonds: 100000,
      ppf: 250000,
      epf: 400000,
      realEstate: 5000000,
      gold: 200000,
      vehicle: 800000,
      otherAssets: 100000,
      homeLoan: 3000000,
      carLoan: 400000,
      personalLoan: 0,
      creditCardDebt: 50000,
      otherLiabilities: 0
    }
  });

  const onSubmit = (data: NetWorthFormData) => {
    const calculation = calculateNetWorth(data);
    setResult(calculation);
  };

  const handleDownloadPDF = () => {
    if (!result) return;
    generatePDF({
      title: "Net Worth Calculator Report",
      inputs: form.getValues(),
      results: result,
      calculatorType: "net-worth"
    });
  };

  const handleDownloadCSV = () => {
    if (!result) return;
    generateCSV({
      title: "Net Worth Calculator Report",
      inputs: form.getValues(),
      results: result,
      calculatorType: "net-worth"
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        {/* Assets Section */}
        <Card>
          <CardHeader>
            <CardTitle>Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <div className="space-y-6">
                {/* Liquid Assets */}
                <div>
                  <h4 className="font-medium text-slate-900 mb-3">Liquid Assets</h4>
                  <div className="space-y-3">
                    <FormField
                      control={form.control}
                      name="savingsAccount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Savings Account (₹)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
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
                      name="fixedDeposits"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fixed Deposits (₹)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
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
                      name="liquidFunds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Liquid/Ultra-short Funds (₹)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Investments */}
                <div>
                  <h4 className="font-medium text-slate-900 mb-3">Investments</h4>
                  <div className="space-y-3">
                    <FormField
                      control={form.control}
                      name="mutualFunds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mutual Funds (₹)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
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
                      name="stocks"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stocks/Shares (₹)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
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
                      name="bonds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bonds/Debentures (₹)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
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
                      name="ppf"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>PPF (₹)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
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
                      name="epf"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>EPF (₹)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Physical Assets */}
                <div>
                  <h4 className="font-medium text-slate-900 mb-3">Physical Assets</h4>
                  <div className="space-y-3">
                    <FormField
                      control={form.control}
                      name="realEstate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Real Estate (₹)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
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
                      name="gold"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gold/Jewelry (₹)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
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
                      name="vehicle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vehicle (₹)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
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
                      name="otherAssets"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Other Assets (₹)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </Form>
          </CardContent>
        </Card>

        {/* Liabilities Section */}
        <Card>
          <CardHeader>
            <CardTitle>Liabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="homeLoan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Home Loan Outstanding (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
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
                  name="carLoan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Car Loan Outstanding (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
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
                  name="personalLoan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Personal Loan Outstanding (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
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
                  name="creditCardDebt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Credit Card Debt (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
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
                  name="otherLiabilities"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Other Liabilities (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Form>
          </CardContent>
        </Card>

        <Button onClick={form.handleSubmit(onSubmit)} className="w-full">
          Calculate Net Worth
        </Button>
      </div>

      {/* Results */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Net Worth Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                <div className={`result-card ${result.isPositive ? 'from-green-50 to-green-100 border-green-200' : 'from-red-50 to-red-100 border-red-200'}`}>
                  <div className="text-sm font-medium mb-1">Your Net Worth</div>
                  <div className={`text-2xl font-bold ${result.isPositive ? 'text-green-700' : 'text-red-700'}`}>
                    {formatCurrency(result.netWorth)}
                  </div>
                  <div className="text-sm mt-1">
                    {result.isPositive ? '💚 Positive Net Worth' : '⚠️ Negative Net Worth'}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-blue-700">Total Assets</span>
                    <span className="font-semibold text-blue-900">{formatCurrency(result.totalAssets)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="text-red-700">Total Liabilities</span>
                    <span className="font-semibold text-red-900">{formatCurrency(result.totalLiabilities)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-lg text-center">
                    <div className="text-xs text-slate-600">Liquid Assets</div>
                    <div className="font-semibold text-slate-900">{formatCurrency(result.liquidAssets)}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg text-center">
                    <div className="text-xs text-slate-600">Investments</div>
                    <div className="font-semibold text-slate-900">{formatCurrency(result.investments)}</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <span className="text-yellow-700">Liquidity Ratio</span>
                    <span className="font-semibold text-yellow-900">{result.liquidityRatio}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="text-purple-700">Debt-to-Asset Ratio</span>
                    <span className="font-semibold text-purple-900">{result.debtToAssetRatio}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-green-700">Investment %</span>
                    <span className="font-semibold text-green-900">{result.investmentPercentage}%</span>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">Financial Health Indicators:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Liquidity Ratio: {result.liquidityRatio >= 100 ? '✅ Good' : '⚠️ Low'} (Target: {'>'}100%)</li>
                    <li>• Debt-to-Asset: {result.debtToAssetRatio <= 40 ? '✅ Good' : '⚠️ High'} (Target: {'<'}40%)</li>
                    <li>• Investment %: {result.investmentPercentage >= 30 ? '✅ Good' : '⚠️ Low'} (Target: {'>'}30%)</li>
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
                <div className="text-4xl mb-4">💯</div>
                <p>Enter your assets and liabilities to calculate net worth</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
