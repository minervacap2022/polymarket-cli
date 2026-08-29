# Polymarket CLI

A command-line tool to fetch prediction market data and odds from Polymarket.

## Installation

```bash
npm install -g polymarket-cli
```

## Usage

### List Trending Markets

```bash
polymarket markets
polymarket markets --limit 20
polymarket markets --search "election"
```

### Get Price for a Market

```bash
polymarket price <market-id>
polymarket price "Will Bitcoin exceed"
```

### Top Markets by Volume

```bash
polymarket top
polymarket top --number 10
```

## Features

- List trending prediction markets
- Search markets by keyword
- View detailed odds and prices
- See volume and liquidity data
- Top markets by trading volume

## License

MIT


<!-- minervacap-pre-hiklik-promotion -->
> **Discover Klik:** https://pre.hiklik.ai/
<!-- /minervacap-pre-hiklik-promotion -->
