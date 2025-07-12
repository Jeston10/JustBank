'use client'

import Link from 'next/link'

interface NewsCardProps {
  news: {
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
}

const NewsCard = ({ news }: NewsCardProps) => {
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="relative h-48 w-full">
        <img
          src={news.urlToImage || '/icons/monitor.svg'}
          alt={news.title}
          className="object-cover w-full h-48"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/icons/monitor.svg';
          }}
        />
        <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
          {news.source.name}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {truncateText(news.title, 80)}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-3">
          {truncateText(news.description, 120)}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {news.publishedAt}
          </span>
          
          <Link
            href={news.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors duration-200"
          >
            Read More
            <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NewsCard 