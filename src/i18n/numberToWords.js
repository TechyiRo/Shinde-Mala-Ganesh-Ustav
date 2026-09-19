// Conversion of numbers to words in Marathi and English with Indian numbering format

const onesEn = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
];

const tensEn = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
];

const marathiUnits = {
  0: 'शून्य', 1: 'एक', 2: 'दोन', 3: 'तीन', 4: 'चार', 5: 'पाच', 6: 'सहा', 7: 'सात', 8: 'आठ', 9: 'नऊ',
  10: 'दहा', 11: 'अकरा', 12: 'बारा', 13: 'तेरा', 14: 'चौदा', 15: 'पंधरा', 16: 'सोळा', 17: 'सतरा', 18: 'अठरा', 19: 'एकोणीस',
  20: 'वीस', 21: 'एकवीस', 22: 'बावीस', 23: 'तेवीस', 24: 'चोवीस', 25: 'पंचवीस', 26: 'सव्वीस', 27: 'सत्तावीस', 28: 'अठ्ठावीस', 29: 'एकोणतीस',
  30: 'तीस', 31: 'एकतीस', 32: 'बत्तीस', 33: 'तेहेतीस', 34: 'चौतीस', 35: 'पस्तीस', 36: 'छत्तीस', 37: 'सदतीस', 38: 'अडतीस', 39: 'एकोणचाळीस',
  40: 'चाळीस', 41: 'एक्केचाळीस', 42: 'बेचाळीस', 43: 'त्रेचाळीस', 44: 'चव्वेचाळीस', 45: 'पंचेचाळीस', 46: 'शेहेचाळीस', 47: 'सत्तेचाळीस', 48: 'अठ्ठेचाळीस', 49: 'एकोणपन्नास',
  50: 'पन्नास', 51: 'एक्कावन्न', 52: 'बावन्न', 53: 'त्रेपन्न', 54: 'चोपन्न', 55: 'पंचावन्न', 56: 'छप्पन्न', 57: 'सत्तावन्न', 58: 'अठ्ठावन्न', 59: 'एकोणसाठ',
  60: 'साठ', 61: 'एकसष्ठ', 62: 'बासष्ठ', 63: 'त्रेसष्ठ', 64: 'चौसष्ठ', 65: 'पासष्ठ', 66: 'सहासष्ठ', 67: 'सदुसष्ठ', 68: 'अडुसष्ठ', 69: 'एकोणसत्तर',
  70: 'सत्तर', 71: 'एक्काहत्तर', 72: 'बाहत्तर', 73: 'त्र्याहत्तर', 74: 'चौऱ्याहत्तर', 75: 'पंचाहत्तर', 76: 'शहात्तर', 77: 'सत्त्याहत्तर', 78: 'अठ्ठ्याहत्तर', 79: 'एकोणऐंशी',
  80: 'ऐंशी', 81: 'एक्क्याऐंशी', 82: 'ब्याऐंशी', 83: 'त्र्याऐंशी', 84: 'चौऱ्याऐंशी', 85: 'पंच्याऐंशी', 86: 'शहाऐंशी', 87: 'सत्त्याऐंशी', 88: 'अठ्ठ्याऐंशी', 89: 'एकोणनव्वद',
  90: 'नव्वद', 91: 'एक्याण्णव', 92: 'ब्याण्णव', 93: 'त्र्याण्णव', 94: 'चौऱ्याण्णव', 95: 'पंच्याण्णव', 96: 'शहाण्णव', 97: 'सत्त्याण्णव', 98: 'अठ्ठ्याण्णव', 99: 'नव्व्याण्णव'
};

function convertLessThanThousandEn(n) {
  if (n === 0) return '';
  if (n < 20) return onesEn[n];
  if (n < 100) {
    return tensEn[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + onesEn[n % 10] : '');
  }
  return onesEn[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertLessThanThousandEn(n % 100) : '');
}

export function numberToWordsEn(num) {
  if (num === null || num === undefined || isNaN(num)) return '';
  num = Math.floor(Number(num));
  if (num === 0) return 'Zero Rupees Only';
  if (num < 0) return 'Minus ' + numberToWordsEn(-num);

  let crores = Math.floor(num / 10000000);
  num %= 10000000;
  let lakhs = Math.floor(num / 100000);
  num %= 100000;
  let thousands = Math.floor(num / 1000);
  let remainder = num % 1000;

  let parts = [];
  if (crores > 0) parts.push(convertLessThanThousandEn(crores) + ' Crore');
  if (lakhs > 0) parts.push(convertLessThanThousandEn(lakhs) + ' Lakh');
  if (thousands > 0) parts.push(convertLessThanThousandEn(thousands) + ' Thousand');
  if (remainder > 0) parts.push(convertLessThanThousandEn(remainder));

  return parts.join(' ') + ' Rupees Only';
}

function convertLessThanThousandMr(n) {
  if (n === 0) return '';
  if (n < 100) return marathiUnits[n];
  
  let hundreds = Math.floor(n / 100);
  let rem = n % 100;
  let hundredStr = '';
  if (hundreds === 1) hundredStr = 'एकशे';
  else if (hundreds === 2) hundredStr = 'दोनशे';
  else if (hundreds === 3) hundredStr = 'तीनशे';
  else if (hundreds === 4) hundredStr = 'चारशे';
  else if (hundreds === 5) hundredStr = 'पाचशे';
  else if (hundreds === 6) hundredStr = 'सहाशे';
  else if (hundreds === 7) hundredStr = 'सातशे';
  else if (hundreds === 8) hundredStr = 'आठशे';
  else if (hundreds === 9) hundredStr = 'नऊशे';

  if (rem === 0) return hundredStr;
  return hundredStr + ' ' + marathiUnits[rem];
}

export function numberToWordsMr(num) {
  if (num === null || num === undefined || isNaN(num)) return '';
  num = Math.floor(Number(num));
  if (num === 0) return 'शून्य रुपये फक्त';
  if (num < 0) return 'ऋण ' + numberToWordsMr(-num);

  let crores = Math.floor(num / 10000000);
  num %= 10000000;
  let lakhs = Math.floor(num / 100000);
  num %= 100000;
  let thousands = Math.floor(num / 1000);
  let remainder = num % 1000;

  let parts = [];
  if (crores > 0) {
    let crStr = crores < 100 ? marathiUnits[crores] : convertLessThanThousandMr(crores);
    parts.push(crStr + ' कोटी');
  }
  if (lakhs > 0) {
    let lkStr = lakhs < 100 ? marathiUnits[lakhs] : convertLessThanThousandMr(lakhs);
    parts.push(lkStr + ' लाख');
  }
  if (thousands > 0) {
    let thStr = thousands < 100 ? marathiUnits[thousands] : convertLessThanThousandMr(thousands);
    parts.push(thStr + ' हजार');
  }
  if (remainder > 0) {
    parts.push(convertLessThanThousandMr(remainder));
  }

  return parts.join(' ') + ' रुपये फक्त';
}

export function numberToWords(num, lang = 'mr') {
  return lang === 'mr' ? numberToWordsMr(num) : numberToWordsEn(num);
}

// Format Indian Currency String: e.g. 125000 -> "₹ 1,25,000"
export function formatCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹ 0';
  return '₹ ' + Number(amount).toLocaleString('en-IN');
}
