import assert from 'node:assert/strict';
import { filterAndRankProductsForSearch } from '../utils/productSearch';

const products = [
  {
    id: '59',
    name: 'DEEP MOISTURIZING BEAUTY BOX',
    category: 'Beauty Boxes',
    description: 'Includes Hyaluron Cream and other products.',
  },
  {
    id: '28',
    name: 'INTENSIVE HYDRO SOOTHING CREAM',
    category: 'Cream',
    description: 'A moisturizer with hyaluron complex.',
  },
  {
    id: '29',
    name: 'MOISTURE REPLENISHING HYALURON CREAM',
    category: 'Cream',
    description: '',
  },
  {
    id: '18',
    name: 'MOISTURE REPLENISHING HYALURON SERUM',
    category: 'Serum',
    description: '',
  },
];

const options = { locale: 'en', t: (key) => key };
const hyaluronResults = filterAndRankProductsForSearch(
  products,
  'hyaluron',
  options
);
assert.deepEqual(
  hyaluronResults.map((product) => product.id),
  ['29', '18', '59', '28']
);

const creamResults = filterAndRankProductsForSearch(
  products,
  'hyaluron cream',
  options
);
assert.equal(creamResults[0]?.id, '29');

console.log('Product search smoke passed');
