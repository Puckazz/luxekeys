type FormatterOptions = Intl.NumberFormatOptions & {
  locale?: string;
};

const DEFAULT_LOCALE = 'en-US';
const DEFAULT_CURRENCY = 'USD';

const formatterCache = new Map<string, Intl.NumberFormat>();

const buildCacheKey = (
  locale: string,
  options: Intl.NumberFormatOptions
): string => {
  const normalizedOptions = Object.entries(options)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => [key, String(value)]);

  return `${locale}|${JSON.stringify(normalizedOptions)}`;
};

export const getNumberFormatter = (
  options: FormatterOptions = {}
): Intl.NumberFormat => {
  const { locale = DEFAULT_LOCALE, ...intlOptions } = options;
  const key = buildCacheKey(locale, intlOptions);
  const cachedFormatter = formatterCache.get(key);

  if (cachedFormatter) {
    return cachedFormatter;
  }

  const formatter = new Intl.NumberFormat(locale, intlOptions);
  formatterCache.set(key, formatter);

  return formatter;
};

export const formatCurrency = (
  value: number,
  options: FormatterOptions = {}
): string => {
  const {
    locale = DEFAULT_LOCALE,
    currency = DEFAULT_CURRENCY,
    ...intlOptions
  } = options;

  return getNumberFormatter({
    locale,
    style: 'currency',
    currency,
    ...intlOptions,
  }).format(value);
};
