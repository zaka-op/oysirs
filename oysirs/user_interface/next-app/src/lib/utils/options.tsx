// Generate year options (from 2010 to current year)
export const generateYearOptions = (): string[] => {
  const currentYear = new Date().getFullYear();
  const startYear = 2010;
  const years: string[] = [];

  for (let year = currentYear; year >= startYear; year--) {
    years.push(year.toString());
  }

  return years;
};

// Generate bank options
export const generateBankOptions = () => {
  return [
    { value: "ALL", label: "All Banks" },
    { value: "FIRSTBANK", label: "First Bank" },
    { value: "GTBANK", label: "GTBank" },
    { value: "ZENITH", label: "Zenith Bank" },
    { value: "UBA", label: "UBA" },
    { value: "ACCESS", label: "Access Bank" },
    { value: "ECOBANK", label: "Ecobank" },
    { value: "FCMB", label: "FCMB" },
    { value: "STERLING", label: "Sterling Bank" },
    { value: "POLARIS", label: "Polaris Bank" },
    { value: "WEMA", label: "Wema Bank" },
    { value: "PROVIDUS", label: "Providus Bank" },
    { value: "JAIZ", label: "Jaiz Bank" },
    { value: "CITIBANK", label: "Citibank" },
    { value: "HERITAGE", label: "Heritage Bank" },
    { value: "KEYSTONE", label: "Keystone Bank" },
    { value: "SUNTRUST", label: "Suntrust Bank" },
    { value: "VFD", label: "VFD Microfinance Bank" },
    { value: "STANBIC", label: "Stanbic IBTC Bank" },
    { value: "FIDELITY", label: "Fidelity Bank" },
    { value: "UNION", label: "Union Bank" },
    { value: "GLOBUS", label: "Globus Bank" },
    { value: "OPTIMUS", label: "Optimus Bank" },
    { value: "PREMIUMTRUST", label: "Premium Trust Bank" },
  ];
};

export const generateRequiredTxnColumns = () => {
  return [
    "NAME",
    "EMAIL",
    "MOBILE_NO",
    "ADDRESS",
    "TRXN_DATE",
    "TRXN_AMOUNT"
  ];
};