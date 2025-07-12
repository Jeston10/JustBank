# Financial News Integration Guide

This guide explains how to set up and use the live financial news feature in your JustBank application.

## Features

- **Live Financial News**: Real-time news about banking, monetary policy, trading, and cryptocurrency
- **Pagination**: 20 news items per page with smooth navigation
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Multiple API Support**: Choose from different news APIs based on your needs

## API Options

### 1. NewsAPI.org (Recommended)
- **Free Tier**: 1,000 requests per day
- **Cost**: Free for basic usage
- **Coverage**: Global news sources
- **Setup**: Sign up at https://newsapi.org/

### 2. Alpha Vantage
- **Free Tier**: 500 requests per day
- **Cost**: Free for basic usage
- **Coverage**: Financial markets and news
- **Setup**: Sign up at https://www.alphavantage.co/

### 3. Yahoo Finance via RapidAPI
- **Free Tier**: 500 requests per month
- **Cost**: Paid plans available
- **Coverage**: Financial news and market data
- **Setup**: Sign up at https://rapidapi.com/

## Setup Instructions

### 1. Choose Your API Provider

For beginners, we recommend **NewsAPI.org** as it's free and easy to set up.

### 2. Get Your API Key

#### NewsAPI.org:
1. Go to https://newsapi.org/
2. Click "Get API Key"
3. Sign up for a free account
4. Copy your API key

#### Alpha Vantage:
1. Go to https://www.alphavantage.co/
2. Click "Get Your Free API Key Today"
3. Fill out the form
4. Copy your API key

#### Yahoo Finance (RapidAPI):
1. Go to https://rapidapi.com/
2. Sign up for an account
3. Subscribe to Yahoo Finance API
4. Copy your RapidAPI key

### 3. Configure Environment Variables

Add your API key to your `.env.local` file:

```bash
# For NewsAPI.org
NEWS_API_KEY=your_actual_api_key_here

# For Alpha Vantage
ALPHA_VANTAGE_API_KEY=your_actual_api_key_here

# For Yahoo Finance
RAPIDAPI_KEY=your_actual_rapidapi_key_here
```

### 4. Restart Your Development Server

```bash
npm run dev
```

## Usage

1. **Access the News Section**: Click on "Financial News" in the left sidebar
2. **Browse News**: View 20 news items per page
3. **Navigate**: Use the pagination controls at the bottom
4. **Read Full Articles**: Click "Read More" to open the full article in a new tab

## Customization

### Changing News Sources

You can modify the news sources by editing `lib/actions/news.actions.ts`:

```typescript
// Change keywords for different topics
const keywords = 'banking OR finance OR monetary OR trading OR cryptocurrency OR stocks OR economy'
```

### Switching Between APIs

To use a different API, modify the `getNews` function in `lib/actions/news.actions.ts`:

```typescript
// For Alpha Vantage
export const getNews = async (page: number = 1, pageSize: number = 20) => {
  // Use getAlphaVantageNews instead
  return await getAlphaVantageNews(page, pageSize)
}
```

### Styling

The news cards use Tailwind CSS classes. You can customize the appearance by modifying `components/NewsCard.tsx`.

## Troubleshooting

### Common Issues

1. **"API key not configured" error**
   - Make sure you've added the API key to your `.env.local` file
   - Restart your development server

2. **"Failed to fetch news" error**
   - Check if your API key is valid
   - Verify you haven't exceeded your API quota
   - Check your internet connection

3. **No images showing**
   - Some news articles don't have images
   - The app will show a default icon for missing images

### API Rate Limits

- **NewsAPI.org**: 1,000 requests/day (free)
- **Alpha Vantage**: 500 requests/day (free)
- **Yahoo Finance**: 500 requests/month (free)

### Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your API key is working by testing it directly
3. Check the API provider's documentation for any changes

## File Structure

```
app/(root)/news/
├── page.tsx                 # Main news page
components/
├── NewsCard.tsx            # Individual news card component
lib/actions/
├── news.actions.ts         # API calls and data processing
constants/
├── index.ts               # Sidebar navigation (updated)
```

## Security Notes

- Never commit your API keys to version control
- Use environment variables for all API keys
- Consider implementing rate limiting for production use
- Monitor your API usage to avoid unexpected charges 