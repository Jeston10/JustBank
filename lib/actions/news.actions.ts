'use server'

interface NewsResponse {
  success: boolean
  articles?: any[]
  totalResults?: number
  message?: string
}

export const getNews = async (page: number = 1, pageSize: number = 20): Promise<NewsResponse> => {
  try {
    // Using Alpha Vantage API for financial news
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY
    
    if (!apiKey) {
      return {
        success: false,
        message: 'Alpha Vantage API key not configured. Please add ALPHA_VANTAGE_API_KEY to your environment variables.'
      }
    }

    const url = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&topics=financial_markets&apikey=${apiKey}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 300 } // Cache for 5 minutes
    })

    if (!response.ok) {
      throw new Error(`Alpha Vantage API error: ${response.status}`)
    }

    const data = await response.json()

    if (data.Note || data.Error) {
      return {
        success: false,
        message: data.Note || data.Error || 'Failed to fetch news'
      }
    }

    // Transform the articles to add unique IDs and pagination
    const allArticles = data.feed || []
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const articles = allArticles.slice(startIndex, endIndex).map((article: any, index: number) => ({
      id: `${article.time_published}-${index}`,
      title: article.title,
      description: article.summary,
      url: article.url,
      urlToImage: article.banner_image || '/icons/monitor.svg',
      publishedAt: new Date(article.time_published).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      source: {
        name: article.source
      }
    }))

    return {
      success: true,
      articles,
      totalResults: allArticles.length
    }

  } catch (error) {
    console.error('Error fetching Alpha Vantage news:', error)
    return {
      success: false,
      message: 'Failed to fetch news. Please try again later.'
    }
  }
}

// Alternative API implementations (uncomment and modify as needed)

// For Alpha Vantage News API
export const getAlphaVantageNews = async (page: number = 1, pageSize: number = 20): Promise<NewsResponse> => {
  try {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY
    
    if (!apiKey) {
      return {
        success: false,
        message: 'Alpha Vantage API key not configured.'
      }
    }

    const url = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&topics=financial_markets&apikey=${apiKey}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 300 }
    })

    if (!response.ok) {
      throw new Error(`Alpha Vantage API error: ${response.status}`)
    }

    const data = await response.json()

    if (data.Note || data.Error) {
      return {
        success: false,
        message: data.Note || data.Error || 'Failed to fetch news'
      }
    }

    const articles = data.feed?.slice((page - 1) * pageSize, page * pageSize).map((article: any, index: number) => ({
      id: `${article.time_published}-${index}`,
      title: article.title,
      description: article.summary,
      url: article.url,
      urlToImage: article.banner_image || '/icons/monitor.svg',
      publishedAt: new Date(article.time_published).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      source: {
        name: article.source
      }
    })) || []

    return {
      success: true,
      articles,
      totalResults: data.feed?.length || 0
    }

  } catch (error) {
    console.error('Error fetching Alpha Vantage news:', error)
    return {
      success: false,
      message: 'Failed to fetch news from Alpha Vantage.'
    }
  }
}

// For Yahoo Finance API (requires RapidAPI)
export const getYahooFinanceNews = async (page: number = 1, pageSize: number = 20): Promise<NewsResponse> => {
  try {
    const apiKey = process.env.RAPIDAPI_KEY
    
    if (!apiKey) {
      return {
        success: false,
        message: 'RapidAPI key not configured for Yahoo Finance.'
      }
    }

    const url = 'https://yahoo-finance-news.p.rapidapi.com/news/list'

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'yahoo-finance-news.p.rapidapi.com'
      },
      next: { revalidate: 300 }
    })

    if (!response.ok) {
      throw new Error(`Yahoo Finance API error: ${response.status}`)
    }

    const data = await response.json()

    const articles = data.slice((page - 1) * pageSize, page * pageSize).map((article: any, index: number) => ({
      id: `${article.published_at}-${index}`,
      title: article.title,
      description: article.summary,
      url: article.link,
      urlToImage: article.image || '/icons/monitor.svg',
      publishedAt: new Date(article.published_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      source: {
        name: article.source
      }
    }))

    return {
      success: true,
      articles,
      totalResults: data.length
    }

  } catch (error) {
    console.error('Error fetching Yahoo Finance news:', error)
    return {
      success: false,
      message: 'Failed to fetch news from Yahoo Finance.'
    }
  }
} 