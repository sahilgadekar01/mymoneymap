import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatNumber } from "@/utils/formatters";
import { generatePDF, generateCSV } from "@/utils/pdfGenerator";

const currencySchema = z.object({
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  fromCurrency: z.string().min(1, "Please select source currency"),
  toCurrency: z.string().min(1, "Please select target currency")
});

type CurrencyFormData = z.infer<typeof currencySchema>;

// Popular currencies with their symbols
const currencies = [
  { code: "INR", name: "Indian Rupee", symbol: "₹", flag: "🇮🇳" },
  { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸" },
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺" },
  { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", flag: "🇯🇵" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$", flag: "🇨🇦" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", flag: "🇦🇺" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF", flag: "🇨🇭" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", flag: "🇨🇳" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", flag: "🇸🇬" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$", flag: "🇭🇰" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ", flag: "🇦🇪" },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼", flag: "🇸🇦" },
  { code: "KRW", name: "South Korean Won", symbol: "₩", flag: "🇰🇷" },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM", flag: "🇲🇾" },
  { code: "THB", name: "Thai Baht", symbol: "฿", flag: "🇹🇭" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$", flag: "🇳🇿" },
  { code: "ZAR", name: "South African Rand", symbol: "R", flag: "🇿🇦" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$", flag: "🇧🇷" },
  { code: "RUB", name: "Russian Ruble", symbol: "₽", flag: "🇷🇺" }
];

// Mock exchange rates (in a real app, this would come from an API)
const mockExchangeRates: Record<string, Record<string, number>> = {
  "USD": {
    "INR": 83.25, "EUR": 0.92, "GBP": 0.79, "JPY": 149.50, "CAD": 1.36,
    "AUD": 1.53, "CHF": 0.88, "CNY": 7.24, "SGD": 1.35, "HKD": 7.82,
    "AED": 3.67, "SAR": 3.75, "KRW": 1320.50, "MYR": 4.68, "THB": 35.80,
    "NZD": 1.63, "ZAR": 18.75, "BRL": 5.12, "RUB": 92.50
  },
  "INR": {
    "USD": 0.012, "EUR": 0.011, "GBP": 0.0095, "JPY": 1.80, "CAD": 0.016,
    "AUD": 0.018, "CHF": 0.011, "CNY": 0.087, "SGD": 0.016, "HKD": 0.094,
    "AED": 0.044, "SAR": 0.045, "KRW": 15.86, "MYR": 0.056, "THB": 0.43,
    "NZD": 0.020, "ZAR": 0.225, "BRL": 0.061, "RUB": 1.11
  }
  // Add more base currencies as needed
};

function convertCurrency(amount: number, fromCurrency: string, toCurrency: string) {
  if (fromCurrency === toCurrency) {
    return {
      convertedAmount: amount,
      exchangeRate: 1,
      fromSymbol: currencies.find(c => c.code === fromCurrency)?.symbol || fromCurrency,
      toSymbol: currencies.find(c => c.code === toCurrency)?.symbol || toCurrency,
      lastUpdated: new Date().toLocaleString()
    };
  }

  let exchangeRate = 1;
  
  // Try direct conversion
  if (mockExchangeRates[fromCurrency] && mockExchangeRates[fromCurrency][toCurrency]) {
    exchangeRate = mockExchangeRates[fromCurrency][toCurrency];
  }
  // Try reverse conversion
  else if (mockExchangeRates[toCurrency] && mockExchangeRates[toCurrency][fromCurrency]) {
    exchangeRate = 1 / mockExchangeRates[toCurrency][fromCurrency];
  }
  // Convert via USD
  else if (mockExchangeRates["USD"][fromCurrency] && mockExchangeRates["USD"][toCurrency]) {
    const fromToUsd = 1 / mockExchangeRates["USD"][fromCurrency];
    const usdToTarget = mockExchangeRates["USD"][toCurrency];
    exchangeRate = fromToUsd * usdToTarget;
  }
  
  const convertedAmount = amount * exchangeRate;
  
  return {
    convertedAmount,
    exchangeRate,
    fromSymbol: currencies.find(c => c.code === fromCurrency)?.symbol || fromCurrency,
    toSymbol: currencies.find(c => c.code === toCurrency)?.symbol || toCurrency,
    lastUpdated: new Date().toLocaleString()
  };
}

export default function CurrencyConverter() {
  const [result, setResult] = useState<any>(null);
  const [historicalRates, setHistoricalRates] = useState<any[]>([]);

  const form = useForm<CurrencyFormData>({
    resolver: zodResolver(currencySchema),
    defaultValues: {
      amount: 1000,
      fromCurrency: "USD",
      toCurrency: "INR"
    }
  });

  const onSubmit = (data: CurrencyFormData) => {
    const conversion = convertCurrency(data.amount, data.fromCurrency, data.toCurrency);
    setResult(conversion);
    
    // Add to historical rates (mock data)
    const newRate = {
      date: new Date().toLocaleDateString(),
      rate: conversion.exchangeRate,
      pair: `${data.fromCurrency}/${data.toCurrency}`
    };
    setHistoricalRates(prev => [newRate, ...prev.slice(0, 4)]);
  };

  const handleSwapCurrencies = () => {
    const fromCurrency = form.getValues("fromCurrency");
    const toCurrency = form.getValues("toCurrency");
    
    form.setValue("fromCurrency", toCurrency);
    form.setValue("toCurrency", fromCurrency);
    
    // Auto-convert after swap
    if (result) {
      form.handleSubmit(onSubmit)();
    }
  };

  const handleDownloadPDF = () => {
    if (!result) return;
    generatePDF({
      title: "Currency Converter Report",
      inputs: form.getValues(),
      results: result,
      calculatorType: "currency"
    });
  };

  const handleDownloadCSV = () => {
    if (!result) return;
    generateCSV({
      title: "Currency Converter Report",
      inputs: form.getValues(),
      results: result,
      calculatorType: "currency"
    });
  };

  // Auto-convert when amount changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "amount" && result && value.amount && value.amount > 0) {
        form.handleSubmit(onSubmit)();
      }
    });
    return () => subscription.unsubscribe();
  }, [form, result]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Currency Conversion</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="1000"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="fromCurrency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From Currency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select source currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {currencies.map((currency) => (
                            <SelectItem key={currency.code} value={currency.code}>
                              <div className="flex items-center space-x-2">
                                <span>{currency.flag}</span>
                                <span>{currency.code}</span>
                                <span className="text-slate-500">-</span>
                                <span className="text-slate-500">{currency.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSwapCurrencies}
                    className="rounded-full px-4"
                  >
                    ⇅ Swap
                  </Button>
                </div>

                <FormField
                  control={form.control}
                  name="toCurrency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>To Currency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select target currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {currencies.map((currency) => (
                            <SelectItem key={currency.code} value={currency.code}>
                              <div className="flex items-center space-x-2">
                                <span>{currency.flag}</span>
                                <span>{currency.code}</span>
                                <span className="text-slate-500">-</span>
                                <span className="text-slate-500">{currency.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full">
                Convert Currency
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Conversion Results</CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                <div className="result-card">
                  <div className="text-sm text-primary font-medium mb-1">Converted Amount</div>
                  <div className="text-2xl font-bold text-primary">
                    {result.toSymbol} {formatNumber(result.convertedAmount)}
                  </div>
                  <div className="text-sm text-slate-600 mt-1">
                    {result.fromSymbol} {formatNumber(form.getValues().amount)}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-600">Exchange Rate</span>
                    <span className="font-semibold text-slate-900">
                      1 {form.getValues().fromCurrency} = {formatNumber(result.exchangeRate)} {form.getValues().toCurrency}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-blue-700">Inverse Rate</span>
                    <span className="font-semibold text-blue-900">
                      1 {form.getValues().toCurrency} = {formatNumber(1 / result.exchangeRate)} {form.getValues().fromCurrency}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-green-700">Last Updated</span>
                    <span className="font-semibold text-green-900">{result.lastUpdated}</span>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h4 className="font-semibold text-yellow-900 mb-2">💡 Quick Calculations:</h4>
                  <div className="text-sm text-yellow-800 space-y-1">
                    <div className="flex justify-between">
                      <span>{result.fromSymbol} 1:</span>
                      <span>{result.toSymbol} {formatNumber(result.exchangeRate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{result.fromSymbol} 100:</span>
                      <span>{result.toSymbol} {formatNumber(result.exchangeRate * 100)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{result.fromSymbol} 1,000:</span>
                      <span>{result.toSymbol} {formatNumber(result.exchangeRate * 1000)}</span>
                    </div>
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
                <div className="text-4xl mb-4">💱</div>
                <p>Enter amount and select currencies to convert</p>
              </div>
            )}
          </CardContent>
        </Card>

        {historicalRates.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Conversions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {historicalRates.map((rate, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                    <span className="text-sm font-medium">{rate.pair}</span>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{formatNumber(rate.rate)}</div>
                      <div className="text-xs text-slate-500">{rate.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
