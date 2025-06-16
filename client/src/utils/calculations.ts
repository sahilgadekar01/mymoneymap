// EMI Calculation
export function calculateEMI(principal: number, rate: number, tenure: number) {
  const monthlyRate = rate / (12 * 100);
  const months = tenure * 12;
  
  if (monthlyRate === 0) {
    return {
      emi: principal / months,
      totalAmount: principal,
      totalInterest: 0
    };
  }
  
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
             (Math.pow(1 + monthlyRate, months) - 1);
  
  return {
    emi: Math.round(emi),
    totalAmount: Math.round(emi * months),
    totalInterest: Math.round((emi * months) - principal)
  };
}

// SIP Calculation
export function calculateSIP(monthlyAmount: number, rate: number, tenure: number) {
  const monthlyRate = rate / (12 * 100);
  const months = tenure * 12;
  
  const futureValue = monthlyAmount * 
    (((Math.pow(1 + monthlyRate, months)) - 1) / monthlyRate) * 
    (1 + monthlyRate);
  
  const totalInvestment = monthlyAmount * months;
  const totalReturns = futureValue - totalInvestment;
  
  return {
    futureValue: Math.round(futureValue),
    totalInvestment: Math.round(totalInvestment),
    totalReturns: Math.round(totalReturns)
  };
}

// Compound Interest Calculation
export function calculateCompoundInterest(
  principal: number, 
  rate: number, 
  time: number, 
  compoundFrequency: number = 1
) {
  const amount = principal * Math.pow(1 + (rate / 100) / compoundFrequency, compoundFrequency * time);
  const interest = amount - principal;
  
  return {
    amount: Math.round(amount),
    interest: Math.round(interest),
    principal: Math.round(principal)
  };
}

// PPF Calculation
export function calculatePPF(yearlyAmount: number, tenure: number = 15) {
  const rate = 7.1; // Current PPF rate
  const annualRate = rate / 100;
  
  let maturityAmount = 0;
  for (let year = 1; year <= tenure; year++) {
    maturityAmount += yearlyAmount * Math.pow(1 + annualRate, tenure - year + 1);
  }
  
  const totalInvestment = yearlyAmount * tenure;
  const interest = maturityAmount - totalInvestment;
  
  return {
    maturityAmount: Math.round(maturityAmount),
    totalInvestment: Math.round(totalInvestment),
    interest: Math.round(interest)
  };
}

// Retirement Corpus Calculation
export function calculateRetirementCorpus(
  currentAge: number,
  retirementAge: number,
  monthlyExpenses: number,
  inflationRate: number,
  expectedReturn: number
) {
  const yearsToRetirement = retirementAge - currentAge;
  const postRetirementYears = 85 - retirementAge; // Assuming life expectancy of 85
  
  // Future monthly expenses at retirement
  const futureMonthlyExpenses = monthlyExpenses * Math.pow(1 + inflationRate / 100, yearsToRetirement);
  
  // Annual expenses at retirement
  const annualExpensesAtRetirement = futureMonthlyExpenses * 12;
  
  // Required corpus using 4% rule (25x annual expenses)
  const requiredCorpus = annualExpensesAtRetirement * 25;
  
  // Monthly SIP required
  const monthlyRate = expectedReturn / (12 * 100);
  const months = yearsToRetirement * 12;
  
  const monthlySIP = requiredCorpus / 
    (((Math.pow(1 + monthlyRate, months)) - 1) / monthlyRate * (1 + monthlyRate));
  
  return {
    requiredCorpus: Math.round(requiredCorpus),
    monthlySIP: Math.round(monthlySIP),
    futureMonthlyExpenses: Math.round(futureMonthlyExpenses),
    currentValue: Math.round(monthlyExpenses)
  };
}

// FIRE Calculation
export function calculateFIRE(
  currentAge: number,
  currentSavings: number,
  monthlyExpenses: number,
  monthlySavings: number,
  expectedReturn: number
) {
  const annualExpenses = monthlyExpenses * 12;
  const fireNumber = annualExpenses * 25; // 4% rule
  
  if (currentSavings >= fireNumber) {
    return {
      fireNumber: Math.round(fireNumber),
      yearsToFire: 0,
      fireAge: currentAge,
      shortfall: 0
    };
  }
  
  const shortfall = fireNumber - currentSavings;
  const monthlyRate = expectedReturn / (12 * 100);
  
  // Calculate years to FIRE using financial formula
  const months = Math.log(1 + (shortfall * monthlyRate) / monthlySavings) / Math.log(1 + monthlyRate);
  const yearsToFire = Math.ceil(months / 12);
  
  return {
    fireNumber: Math.round(fireNumber),
    yearsToFire,
    fireAge: currentAge + yearsToFire,
    shortfall: Math.round(shortfall)
  };
}

// Income Tax Calculation (New Tax Regime)
export function calculateIncomeTax(grossIncome: number, regime: 'old' | 'new' = 'new') {
  let tax = 0;
  
  if (regime === 'new') {
    // New tax regime 2023-24
    if (grossIncome <= 300000) {
      tax = 0;
    } else if (grossIncome <= 600000) {
      tax = (grossIncome - 300000) * 0.05;
    } else if (grossIncome <= 900000) {
      tax = 15000 + (grossIncome - 600000) * 0.10;
    } else if (grossIncome <= 1200000) {
      tax = 45000 + (grossIncome - 900000) * 0.15;
    } else if (grossIncome <= 1500000) {
      tax = 90000 + (grossIncome - 1200000) * 0.20;
    } else {
      tax = 150000 + (grossIncome - 1500000) * 0.30;
    }
  } else {
    // Old tax regime
    if (grossIncome <= 250000) {
      tax = 0;
    } else if (grossIncome <= 500000) {
      tax = (grossIncome - 250000) * 0.05;
    } else if (grossIncome <= 1000000) {
      tax = 12500 + (grossIncome - 500000) * 0.20;
    } else {
      tax = 112500 + (grossIncome - 1000000) * 0.30;
    }
  }
  
  // Add cess
  const cess = tax * 0.04;
  const totalTax = tax + cess;
  
  return {
    tax: Math.round(tax),
    cess: Math.round(cess),
    totalTax: Math.round(totalTax),
    netIncome: Math.round(grossIncome - totalTax)
  };
}

// HRA Exemption Calculation
export function calculateHRAExemption(
  salary: number,
  hra: number,
  rentPaid: number,
  isMetroCity: boolean
) {
  const basicSalary = salary * 0.5; // Assuming 50% is basic
  
  const exemption1 = hra;
  const exemption2 = basicSalary * (isMetroCity ? 0.5 : 0.4);
  const exemption3 = Math.max(0, rentPaid - basicSalary * 0.1);
  
  const hraExemption = Math.min(exemption1, exemption2, exemption3);
  const taxableHRA = hra - hraExemption;
  
  return {
    hraExemption: Math.round(hraExemption),
    taxableHRA: Math.round(taxableHRA),
    actualRent: Math.round(rentPaid),
    basicSalary: Math.round(basicSalary)
  };
}

// Emergency Fund Calculation
export function calculateEmergencyFund(
  monthlyExpenses: number,
  dependents: number,
  jobStability: 'high' | 'medium' | 'low',
  hasInsurance: boolean
) {
  let multiplier = 6; // Base 6 months
  
  // Adjust based on job stability
  if (jobStability === 'low') multiplier += 3;
  else if (jobStability === 'medium') multiplier += 1;
  
  // Adjust based on dependents
  multiplier += dependents * 0.5;
  
  // Adjust based on insurance
  if (!hasInsurance) multiplier += 1;
  
  const emergencyFund = monthlyExpenses * multiplier;
  
  return {
    recommendedAmount: Math.round(emergencyFund),
    months: Math.round(multiplier),
    monthlyExpenses: Math.round(monthlyExpenses)
  };
}

// Break-even Point Calculation
export function calculateBreakEven(
  fixedCosts: number,
  variableCostPerUnit: number,
  pricePerUnit: number
) {
  const contributionMargin = pricePerUnit - variableCostPerUnit;
  const breakEvenUnits = fixedCosts / contributionMargin;
  const breakEvenRevenue = breakEvenUnits * pricePerUnit;
  
  return {
    breakEvenUnits: Math.round(breakEvenUnits),
    breakEvenRevenue: Math.round(breakEvenRevenue),
    contributionMargin: Math.round(contributionMargin),
    contributionMarginPercent: Math.round((contributionMargin / pricePerUnit) * 100)
  };
}
