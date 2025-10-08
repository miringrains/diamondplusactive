import React from 'react'

interface FormattedMessageProps {
  content: string
  className?: string
}

export function FormattedMessage({ content, className = '' }: FormattedMessageProps) {
  // Function to parse and format the message content
  const formatContent = (text: string) => {
    // Split by numbered points (1. 2. 3. etc)
    const lines = text.split(/(?=\d+\.\s)/)
    
    return lines.map((line, index) => {
      // Check if it's a numbered point
      const numberedMatch = line.match(/^(\d+)\.\s(.+)/)
      if (numberedMatch) {
        const [, number, text] = numberedMatch
        // Format bold text within the line
        const formattedText = formatBoldText(text)
        return (
          <div key={index} className="mb-3">
            <span className="font-semibold text-[var(--brand)]">{number}.</span>{' '}
            <span dangerouslySetInnerHTML={{ __html: formattedText }} />
          </div>
        )
      }
      
      // For non-numbered lines, just format bold text
      const formattedLine = formatBoldText(line.trim())
      if (formattedLine) {
        return (
          <p key={index} className="mb-3" dangerouslySetInnerHTML={{ __html: formattedLine }} />
        )
      }
      return null
    }).filter(Boolean)
  }

  // Function to convert **text** to <strong>text</strong>
  const formatBoldText = (text: string) => {
    return text.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
  }

  // Check if content has numbered points
  const hasNumberedPoints = /\d+\.\s/.test(content)

  if (hasNumberedPoints) {
    return (
      <div className={`space-y-2 ${className}`}>
        {formatContent(content)}
      </div>
    )
  }

  // For simple messages without formatting, split by sentences for better readability
  const sentences = content.split(/(?<=[.!?])\s+/)
  const formattedSentences = sentences.map(s => formatBoldText(s)).join(' ')

  return (
    <div 
      className={`leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: formattedSentences }}
    />
  )
}
