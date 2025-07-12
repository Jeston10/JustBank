'use client'

import { useState, useEffect } from 'react'
import { getNews } from '@/lib/actions/news.actions'
import NewsCard from '@/components/NewsCard'
import { Pagination } from '@/components/Pagination'
import HeaderBox from '@/components/HeaderBox'

interface NewsItem {
  id: string
  title: string
  description: string
  url: string
  urlToImage: string
  publishedAt: string
  source: {
    name: string
  }
}

const NewsPage = () => {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [error, setError] = useState<string | null>(null)

  const itemsPerPage = 20

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true)
        const response = await getNews(currentPage, itemsPerPage)
        
        if (response.success) {
          setNews(response.articles)
          setTotalPages(Math.ceil(response.totalResults / itemsPerPage))
        } else {
          setError(response.message || 'Failed to fetch news')
        }
      } catch (err) {
        setError('An error occurred while fetching news')
        console.error('Error fetching news:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  }, [currentPage])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading News</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <HeaderBox 
          title="Financial News"
          subtext="Stay updated with the latest banking, monetary, and trading news"
          user={null}
        />

        <div className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {news.map((item) => (
              <NewsCard key={item.id} news={item} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default NewsPage 