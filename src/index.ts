#!/usr/bin/env node

import { Command } from 'commander';
import axios from 'axios';

const POLYMARKET_API = 'https://clob.polymarket.com';
const MARKETS_API = 'https://gamma-api.polymarket.com';

interface Market {
  id: string;
  question: string;
  description: string;
  condition_id: string;
  outcomePrices: string;
  outcomes: string[];
  volume: number;
  liquidity: number;
  createdAt: string;
}

interface MarketListResponse {
  markets: Market[];
}

interface PriceResult {
  question: string;
  outcomes: string[];
  prices: number[];
  volume: number;
  liquidity: number;
}

const program = new Command();

program
  .name('polymarket')
  .description('Polymarket CLI - Fetch prediction market odds and data')
  .version('1.0.0');

program
  .command('markets')
  .description('List trending markets on Polymarket')
  .option('-l, --limit <number>', 'Number of markets to show', '10')
  .option('-s, --search <query>', 'Search markets by keyword')
  .action(async (options) => {
    try {
      const limit = parseInt(options.limit);
      let url = `${MARKETS_API}/markets?limit=${limit}&closed=false`;

      if (options.search) {
        url = `${MARKETS_API}/markets?search=${encodeURIComponent(options.search)}&limit=${limit}`;
      }

      const response = await axios.get(url);
      const markets: Market[] = response.data;

      if (markets.length === 0) {
        console.log('No markets found.');
        return;
      }

      console.log(`\n📊 Trending Polymarket Markets (${markets.length})\n`);
      console.log('─'.repeat(80));

      for (const market of markets) {
        const prices: number[] = market.outcomePrices ? JSON.parse(market.outcomePrices) : [0.5, 0.5];
        const outcomes: string[] = typeof market.outcomes === 'string' ? JSON.parse(market.outcomes) : (market.outcomes || ['Yes', 'No']);

        console.log(`\n❓ ${market.question}`);
        console.log(`   Outcomes:`);
        for (let i = 0; i < outcomes.length; i++) {
          const price = prices[i] || 0;
          const percent = (parseFloat(String(price)) * 100).toFixed(1);
          console.log(`   • ${outcomes[i]}: ${percent}%`);
        }
        console.log(`   Volume: $${(market.volume || 0).toLocaleString()}`);
        console.log(`   Liquidity: $${(market.liquidity || 0).toLocaleString()}`);
        console.log('─'.repeat(80));
      }
    } catch (error: any) {
      console.error('Error fetching markets:', error.message);
      process.exit(1);
    }
  });

program
  .command('price')
  .description('Get price/odds for a specific market')
  .argument('<market-id>', 'Market ID or question search term')
  .action(async (marketId) => {
    try {
      // First try to find by ID directly
      let url = `${MARKETS_API}/markets/${marketId}`;
      let market: Market | null = null;

      try {
        const response = await axios.get(url);
        market = response.data;
      } catch {
        // If not found by ID, search by question
        const searchUrl = `${MARKETS_API}/markets?search=${encodeURIComponent(marketId)}&limit=5`;
        const searchResponse = await axios.get(searchUrl);
        const markets: Market[] = searchResponse.data;

        if (markets.length > 0) {
          market = markets[0];
        }
      }

      if (!market) {
        console.error('Market not found.');
        process.exit(1);
      }

      const prices: number[] = market.outcomePrices ? JSON.parse(market.outcomePrices) : [0.5, 0.5];
      const outcomes: string[] = typeof market.outcomes === 'string' ? JSON.parse(market.outcomes) : (market.outcomes || ['Yes', 'No']);

      console.log(`\n🎯 ${market.question}\n`);
      console.log(`   ID: ${market.id}`);
      console.log(`   Outcomes:`);

      for (let i = 0; i < outcomes.length; i++) {
        const price = prices[i] || 0;
        const percent = (parseFloat(String(price)) * 100).toFixed(1);
        const bar = '█'.repeat(Math.round(parseFloat(String(price)) * 20)) + '░'.repeat(20 - Math.round(parseFloat(String(price)) * 20));
        console.log(`   ${outcomes[i].padEnd(8)} ${bar} ${percent}%`);
      }

      console.log(`\n   Volume: $${(market.volume || 0).toLocaleString()}`);
      console.log(`   Liquidity: $${(market.liquidity || 0).toLocaleString()}`);
      console.log('');
    } catch (error: any) {
      console.error('Error fetching price:', error.message);
      process.exit(1);
    }
  });

program
  .command('top')
  .description('Show top markets by volume')
  .option('-n, --number <number>', 'Number of markets to show', '5')
  .action(async (options) => {
    try {
      const n = parseInt(options.number);
      const response = await axios.get(`${MARKETS_API}/markets?limit=50&closed=false`);
      const markets: Market[] = response.data;

      // Sort by volume
      const sorted = markets.sort((a, b) => (b.volume || 0) - (a.volume || 0)).slice(0, n);

      console.log(`\n🏆 Top ${n} Polymarket Markets by Volume\n`);

      for (let i = 0; i < sorted.length; i++) {
        const market = sorted[i];
        const prices: number[] = market.outcomePrices ? JSON.parse(market.outcomePrices) : [0.5, 0.5];
        const outcomes: string[] = typeof market.outcomes === 'string' ? JSON.parse(market.outcomes) : (market.outcomes || ['Yes', 'No']);
        const yesPrice = parseFloat(String(prices[0] || 0.5));

        console.log(`${i + 1}. ${market.question}`);
        console.log(`   YES: ${(yesPrice * 100).toFixed(1)}% | Volume: $${(market.volume || 0).toLocaleString()}`);
        console.log('');
      }
    } catch (error: any) {
      console.error('Error fetching top markets:', error.message);
      process.exit(1);
    }
  });

program.parse();
