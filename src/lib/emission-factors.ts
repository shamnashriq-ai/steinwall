export const scope1Categories = [
  { value: "stationary_combustion", label: "Stationary Combustion (Boilers, Furnaces)" },
  { value: "mobile_combustion", label: "Mobile Combustion (Fleet Vehicles)" },
  { value: "process_emissions", label: "Process Emissions (Manufacturing)" },
  { value: "fugitive_emissions", label: "Fugitive Emissions (Refrigerants, Leaks)" },
];

export const scope2Categories = [
  { value: "electricity", label: "Purchased Electricity" },
  { value: "steam", label: "Purchased Steam" },
  { value: "cooling", label: "Purchased Cooling" },
  { value: "heating", label: "Purchased Heating" },
];

export const scope3Categories = [
  { value: "cat1_purchased_goods", label: "Cat 1: Purchased Goods & Services" },
  { value: "cat2_capital_goods", label: "Cat 2: Capital Goods" },
  { value: "cat3_fuel_energy", label: "Cat 3: Fuel & Energy Related" },
  { value: "cat4_upstream_transport", label: "Cat 4: Upstream Transportation" },
  { value: "cat5_waste", label: "Cat 5: Waste Generated in Operations" },
  { value: "cat6_business_travel", label: "Cat 6: Business Travel" },
  { value: "cat7_commuting", label: "Cat 7: Employee Commuting" },
  { value: "cat8_upstream_leased", label: "Cat 8: Upstream Leased Assets" },
  { value: "cat9_downstream_transport", label: "Cat 9: Downstream Transportation" },
  { value: "cat10_processing", label: "Cat 10: Processing of Sold Products" },
  { value: "cat11_use_of_products", label: "Cat 11: Use of Sold Products" },
  { value: "cat12_end_of_life", label: "Cat 12: End-of-Life Treatment" },
  { value: "cat13_downstream_leased", label: "Cat 13: Downstream Leased Assets" },
  { value: "cat14_franchises", label: "Cat 14: Franchises" },
  { value: "cat15_investments", label: "Cat 15: Investments" },
];

export const units = [
  { value: "kWh", label: "kWh" },
  { value: "MWh", label: "MWh" },
  { value: "litres", label: "Litres" },
  { value: "kg", label: "Kilograms" },
  { value: "tonnes", label: "Tonnes" },
  { value: "km", label: "Kilometres" },
  { value: "m3", label: "Cubic Metres (m³)" },
  { value: "RM", label: "Ringgit Malaysia (RM)" },
  { value: "USD", label: "US Dollars (USD)" },
];

export const sectorEmissionFactors: Record<string, number> = {
  "Manufacturing": 0.42,
  "Energy & Utilities": 0.85,
  "Oil & Gas": 0.95,
  "Retail & Consumer Goods": 0.25,
  "Financial Services": 0.08,
  "Technology": 0.15,
  "Healthcare": 0.30,
  "Construction": 0.55,
  "Transportation": 0.70,
  "Agriculture": 0.60,
  "Mining": 0.80,
  "Telecommunications": 0.12,
  "Professional Services": 0.06,
  "Other": 0.30,
};
